const { Op } = require('sequelize');
const { Ride, User, Booking, Transaction } = require('../models');
const sequelize = require('../database');
const { triggerAlerts } = require('./rideAlertController');
const { getCityCoords, cityDistance } = require('../utils/cityCoords');
const { createNotification } = require('../services/notificationService');

async function create(req, res, next) {
  try {
    const { from, to, departureDate, price, seats, description, instantBooking,
            transportMode, isRecurring, recurringDays, stops, womenOnly, distanceKm } = req.body;
    const ride = await Ride.create({
      driverId: req.user.id,
      from, to, departureDate,
      price, seats,
      seatsAvailable: seats,
      description,
      instantBooking: instantBooking || false,
      transportMode: transportMode || 'voiture',
      isRecurring: isRecurring || false,
      recurringDays: recurringDays || [],
      stops: stops || [],
      womenOnly: womenOnly || false,
      distanceKm: distanceKm || null,
    });

    // ── Trajet récurrent : génère les occurrences des 4 prochaines semaines ──
    let recurringCount = 0;
    if (ride.isRecurring && Array.isArray(ride.recurringDays) && ride.recurringDays.length > 0) {
      const HORIZON_DAYS = 28;   // ~4 semaines
      const MAX_OCCURRENCES = 12;
      const base = new Date(departureDate);
      const hh = base.getHours();
      const mm = base.getMinutes();
      const now = new Date();
      const cursor = new Date(base);
      cursor.setHours(0, 0, 0, 0);

      const occurrences = [];
      for (let i = 1; i <= HORIZON_DAYS && occurrences.length < MAX_OCCURRENCES; i++) {
        const d = new Date(cursor);
        d.setDate(cursor.getDate() + i);
        if (ride.recurringDays.includes(d.getDay())) {
          d.setHours(hh, mm, 0, 0);
          if (d > now && d.getTime() !== base.getTime()) {
            occurrences.push({
              driverId: ride.driverId,
              from: ride.from, to: ride.to,
              departureDate: d,
              price: ride.price,
              seats: ride.seats,
              seatsAvailable: ride.seats,
              description: ride.description,
              instantBooking: ride.instantBooking,
              transportMode: ride.transportMode,
              isRecurring: true,
              recurringDays: ride.recurringDays,
              stops: ride.stops,
              womenOnly: ride.womenOnly,
              distanceKm: ride.distanceKm,
            });
          }
        }
      }
      if (occurrences.length) {
        await Ride.bulkCreate(occurrences);
        recurringCount = occurrences.length;
      }
    }

    triggerAlerts(ride);
    return res.status(201).json({ ride, recurringCount });
  } catch (err) { return next(err); }
}

async function search(req, res, next) {
  try {
    const { from, to, date, minPrice, maxPrice, transportMode, womenOnly, nearby } = req.query;
    const RADIUS_KM = 70;                         // rayon « à proximité »
    const useNearby = nearby !== 'false';         // activé par défaut
    const where = { status: 'active', seatsAvailable: { [Op.gt]: 0 } };

    // Coordonnées des villes recherchées (null si ville inconnue)
    const fromCoord = useNearby && from ? getCityCoords(from) : null;
    const toCoord   = useNearby && to   ? getCityCoords(to)   : null;

    // Villes connues → matching géographique (filtré en JS plus bas).
    // Villes inconnues → filtre texte classique en SQL.
    if (from && !fromCoord) where.from = { [Op.like]: `%${from}%` };
    if (to   && !toCoord)   where.to   = { [Op.like]: `%${to}%` };

    if (date) {
      const d = new Date(date);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      where.departureDate = { [Op.between]: [d, next] };
    }
    if (minPrice) where.price = { ...where.price, [Op.gte]: Number(minPrice) };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: Number(maxPrice) };
    if (transportMode && transportMode !== 'all') where.transportMode = transportMode;
    if (womenOnly === 'true') where.womenOnly = true;

    let rides = await Ride.findAll({
      where,
      include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating', 'totalRatings'] }],
      order: [['departureDate', 'ASC']],
    });

    // ── Matching « à proximité » sur les villes connues ──
    if (fromCoord || toCoord) {
      rides = rides.map(r => r.toJSON());
      rides = rides.filter(r => {
        let ok = true;
        if (fromCoord) {
          const d = cityDistance(r.from, from, fromCoord);
          r.fromDistance = d;
          ok = ok && d != null && d <= RADIUS_KM;
        }
        if (toCoord) {
          const d = cityDistance(r.to, to, toCoord);
          r.toDistance = d;
          ok = ok && d != null && d <= RADIUS_KM;
        }
        return ok;
      });
      // Exact d'abord, puis par proximité, puis par date
      rides.sort((a, b) => {
        const da = (a.fromDistance || 0) + (a.toDistance || 0);
        const db = (b.fromDistance || 0) + (b.toDistance || 0);
        if (da !== db) return da - db;
        return new Date(a.departureDate) - new Date(b.departureDate);
      });
    }

    return res.json({ rides });
  } catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try {
    const ride = await Ride.findByPk(req.params.id, {
      include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating', 'totalRatings', 'bio', 'preferences'] }],
    });
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    return res.json({ ride });
  } catch (err) { return next(err); }
}

async function getMine(req, res, next) {
  try {
    const rides = await Ride.findAll({
      where: { driverId: req.user.id },
      order: [['departureDate', 'DESC']],
    });
    return res.json({ rides });
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    const ride = await Ride.findByPk(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });

    const { from, to, departureDate, price, seats, description, instantBooking } = req.body;
    await ride.update({ from, to, departureDate, price, seats, description, instantBooking });
    return res.json({ ride });
  } catch (err) { return next(err); }
}

async function complete(req, res, next) {
  try {
    const ride = await Ride.findByPk(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    if (ride.status !== 'active') return res.status(400).json({ message: 'Ce trajet ne peut pas être terminé.' });
    await ride.update({ status: 'completed' });
    return res.json({ message: 'Trajet marqué comme terminé.', ride });
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    const ride = await Ride.findByPk(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    await ride.update({ status: 'cancelled' });

    // Annule les réservations en cours et rembourse intégralement les passagers
    // (annulation à l'initiative du conducteur → remboursement 100 %).
    const bookings = await Booking.findAll({
      where: { rideId: ride.id, status: ['pending', 'accepted'] },
    });

    let refundedCount = 0;
    for (const booking of bookings) {
      if (booking.status === 'accepted') {
        const totalPaid = parseFloat(ride.price) * booking.seats;
        if (totalPaid > 0) {
          const passenger = await User.findByPk(booking.passengerId);
          if (passenger) {
            const newBalance = parseFloat(passenger.walletBalance) + totalPaid;
            await passenger.update({ walletBalance: newBalance });
            await Transaction.create({
              userId: booking.passengerId,
              type: 'credit',
              amount: totalPaid,
              description: `Remboursement — trajet annulé par le conducteur (${ride.from} → ${ride.to})`,
              rideId: ride.id,
              balanceAfter: newBalance,
            });
            refundedCount++;
          }
        }
      }
      await booking.update({ status: 'cancelled' });
      createNotification(booking.passengerId, {
        type: 'ride',
        title: 'Trajet annulé par le conducteur',
        message: `Le trajet ${ride.from} → ${ride.to} a été annulé.` +
          (booking.status === 'accepted' ? ' Vous avez été intégralement remboursé sur votre portefeuille.' : ''),
        link: '/bookings',
      });
    }

    return res.json({
      message: bookings.length
        ? `Trajet annulé. ${bookings.length} réservation(s) annulée(s), ${refundedCount} passager(s) remboursé(s).`
        : 'Trajet annulé.',
      cancelledBookings: bookings.length,
      refundedCount,
    });
  } catch (err) { return next(err); }
}

async function homeData(req, res, next) {
  try {
    const [upcoming, topDrivers, trending, totalUsers, totalRides, avgRatingRow, totalCities] = await Promise.all([
      Ride.findAll({
        where: { status: 'active', seatsAvailable: { [Op.gt]: 0 }, departureDate: { [Op.gt]: new Date() } },
        include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating'] }],
        order: [['departureDate', 'ASC']],
        limit: 6,
      }),
      User.findAll({
        where: { isDriver: true, avgRating: { [Op.gt]: 0 } },
        attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating', 'totalRatings', 'totalTrips'],
        order: [['avgRating', 'DESC'], ['totalTrips', 'DESC']],
        limit: 6,
      }),
      sequelize.query(
        'SELECT `to` AS city, COUNT(*) AS cnt FROM Rides WHERE status IN ("active","completed") GROUP BY `to` ORDER BY cnt DESC LIMIT 6',
        { type: sequelize.QueryTypes.SELECT }
      ),
      User.count({ where: { role: 'user' } }),
      Ride.count({ where: { status: { [Op.in]: ['active', 'completed'] } } }),
      sequelize.query(
        'SELECT ROUND(AVG(rating), 1) AS avg FROM Reviews',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT COUNT(DISTINCT `from`) + COUNT(DISTINCT `to`) AS cnt FROM Rides',
        { type: sequelize.QueryTypes.SELECT }
      ),
    ]);

    const stats = {
      totalUsers,
      totalRides,
      avgRating: avgRatingRow[0]?.avg || 4.8,
      totalCities: Math.min(totalCities[0]?.cnt || 45, 99),
    };

    return res.json({ upcoming, topDrivers, trending, stats });
  } catch (err) { return next(err); }
}

module.exports = { create, search, getOne, getMine, update, complete, remove, homeData };
