const { Ride, User, Booking, Transaction, Review } = require('../models');
const { notifyMatchingSavedSearches } = require('../services/savedSearchService');
const { triggerAlerts } = require('./rideAlertController');
const { getCityCoords, cityDistance } = require('../utils/cityCoords');
const { createNotification } = require('../services/notificationService');

async function create(req, res, next) {
  try {
    if (['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Un administrateur ne peut pas publier de trajet.' });
    }
    if (!req.user.isDriver) {
      return res.status(403).json({ message: 'Seuls les conducteurs peuvent publier un trajet. Choisissez le profil conducteur dans votre compte.' });
    }
    if (!req.user.driverVerified) {
      return res.status(403).json({ message: 'Vous devez valider vos documents (CIN, permis, véhicule) avant de publier un trajet.' });
    }

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
        await Ride.insertMany(occurrences);
        recurringCount = occurrences.length;
      }
    }

    notifyMatchingSavedSearches(ride);
    triggerAlerts(ride);

    return res.status(201).json({ ride, recurringCount });
  } catch (err) { return next(err); }
}

const DRIVER_SEARCH_ATTRS = 'firstName lastName photo avgRating totalRatings driverVerified handicapAccessible';

async function search(req, res, next) {
  try {
    const { from, to, date, minPrice, maxPrice, minRating, verifiedOnly, pmrOnly, seats,
            sortBy, transportMode, womenOnly, nearby } = req.query;
    const minSeats = Math.max(1, parseInt(seats) || 1);
    const RADIUS_KM = 70;                         // rayon « à proximité »
    const useNearby = nearby !== 'false';         // activé par défaut

    const where = { status: 'active', seatsAvailable: { $gte: minSeats } };

    // Coordonnées des villes recherchées (null si ville inconnue)
    const fromCoord = useNearby && from ? getCityCoords(from) : null;
    const toCoord   = useNearby && to   ? getCityCoords(to)   : null;

    // Villes connues → matching géographique (filtré en JS plus bas).
    // Villes inconnues → filtre texte classique.
    if (from && !fromCoord) where.from = { $regex: from, $options: 'i' };
    if (to   && !toCoord)   where.to   = { $regex: to, $options: 'i' };

    if (date) {
      const d = new Date(date);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      where.departureDate = { $gte: d, $lte: next };
    }
    if (minPrice) where.price = { ...where.price, $gte: Number(minPrice) };
    if (maxPrice) where.price = { ...where.price, $lte: Number(maxPrice) };
    if (transportMode && transportMode !== 'all') where.transportMode = transportMode;
    if (womenOnly === 'true') where.womenOnly = true;

    const driverMatch = {};
    if (verifiedOnly === 'true') driverMatch.driverVerified = true;
    if (pmrOnly === 'true')      driverMatch.handicapAccessible = true;
    if (minRating && Number(minRating) > 0) driverMatch.avgRating = { $gte: Number(minRating) };

    const sort = sortBy === 'price_asc' ? { price: 1 }
      : sortBy === 'price_desc' ? { price: -1 }
      : sortBy === 'rating_desc' ? null // trié après le populate, ci-dessous
      : { departureDate: 1 };

    let query = Ride.find(where).populate({
      path: 'driver',
      select: DRIVER_SEARCH_ATTRS,
      ...(Object.keys(driverMatch).length ? { match: driverMatch } : {}),
    });
    if (sort) query = query.sort(sort);

    let rides = await query;
    // Une recherche conducteur (`match`) qui ne correspond à aucun conducteur
    // laisse `driver: null` — on exclut ces trajets (équivalent d'un INNER JOIN).
    if (Object.keys(driverMatch).length) rides = rides.filter(r => r.driver);

    rides = rides.map(r => r.toJSON());

    if (sortBy === 'rating_desc') {
      rides.sort((a, b) => (b.driver?.avgRating || 0) - (a.driver?.avgRating || 0));
    }

    // ── Matching « à proximité » sur les villes connues ──
    if (fromCoord || toCoord) {
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
      if (!sortBy) {
        // Exact d'abord, puis par proximité, puis par date
        rides.sort((a, b) => {
          const da = (a.fromDistance || 0) + (a.toDistance || 0);
          const db = (b.fromDistance || 0) + (b.toDistance || 0);
          if (da !== db) return da - db;
          return new Date(a.departureDate) - new Date(b.departureDate);
        });
      }
    }

    return res.json({ rides });
  } catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate({ path: 'driver', select: 'firstName lastName photo avgRating totalRatings bio preferences' });
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    return res.json({ ride });
  } catch (err) { return next(err); }
}

async function getMine(req, res, next) {
  try {
    const rides = await Ride.find({ driverId: req.user.id }).sort({ departureDate: -1 });
    return res.json({ rides });
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });

    const { from, to, departureDate, price, seats, description, instantBooking,
            transportMode, stops, womenOnly, distanceKm } = req.body;
    ride.set({
      from, to, departureDate, price, seats, description, instantBooking,
      ...(transportMode !== undefined ? { transportMode } : {}),
      ...(stops !== undefined ? { stops } : {}),
      ...(womenOnly !== undefined ? { womenOnly } : {}),
      ...(distanceKm !== undefined ? { distanceKm } : {}),
    });
    await ride.save();
    return res.json({ ride });
  } catch (err) { return next(err); }
}

async function complete(req, res, next) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    if (ride.status !== 'active') return res.status(400).json({ message: 'Ce trajet ne peut pas être terminé.' });
    ride.set({ status: 'completed' });
    await ride.save();
    return res.json({ message: 'Trajet marqué comme terminé.', ride });
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    ride.set({ status: 'cancelled' });
    await ride.save();

    // Annule les réservations en cours et rembourse intégralement les passagers
    // (annulation à l'initiative du conducteur → remboursement 100 %).
    const bookings = await Booking.find({ rideId: ride.id, status: { $in: ['pending', 'accepted'] } });

    let refundedCount = 0;
    for (const booking of bookings) {
      if (booking.status === 'accepted') {
        const totalPaid = parseFloat(ride.price) * booking.seats;
        if (totalPaid > 0) {
          // Crédit atomique du portefeuille pour éviter une perte de mise à jour
          // si plusieurs remboursements/recharges arrivent en même temps.
          const passenger = await User.findByIdAndUpdate(
            booking.passengerId,
            { $inc: { walletBalance: totalPaid } },
            { new: true }
          );
          if (passenger) {
            await Transaction.create({
              userId: booking.passengerId,
              type: 'credit',
              amount: totalPaid,
              description: `Remboursement — trajet annulé par le conducteur (${ride.from} → ${ride.to})`,
              rideId: ride.id,
              balanceAfter: passenger.walletBalance,
            });
            refundedCount++;
          }
        }
      }
      const wasAccepted = booking.status === 'accepted';
      booking.set({ status: 'cancelled' });
      await booking.save();
      createNotification(booking.passengerId, {
        type: 'ride',
        title: 'Trajet annulé par le conducteur',
        message: `Le trajet ${ride.from} → ${ride.to} a été annulé.` +
          (wasAccepted ? ' Vous avez été intégralement remboursé sur votre portefeuille.' : ''),
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
    const [upcoming, topDrivers, trending, totalUsers, totalRides, avgRatingRows, fromCities, toCities] = await Promise.all([
      Ride.find({ status: 'active', seatsAvailable: { $gt: 0 }, departureDate: { $gt: new Date() } })
        .populate({ path: 'driver', select: 'firstName lastName photo avgRating' })
        .sort({ departureDate: 1 })
        .limit(6),
      User.find({ isDriver: true, avgRating: { $gt: 0 } })
        .select('firstName lastName photo avgRating totalRatings totalTrips')
        .sort({ avgRating: -1, totalTrips: -1 })
        .limit(6),
      Ride.aggregate([
        { $match: { status: { $in: ['active', 'completed'] } } },
        { $group: { _id: '$to', cnt: { $sum: 1 } } },
        { $sort: { cnt: -1 } },
        { $limit: 6 },
        { $project: { _id: 0, city: '$_id', cnt: 1 } },
      ]),
      User.countDocuments({ role: 'user' }),
      Ride.countDocuments({ status: { $in: ['active', 'completed'] } }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      Ride.distinct('from'),
      Ride.distinct('to'),
    ]);

    const stats = {
      totalUsers,
      totalRides,
      avgRating: avgRatingRows[0]?.avg ? Math.round(avgRatingRows[0].avg * 10) / 10 : 4.8,
      totalCities: Math.min((fromCities.length + toCities.length) || 45, 99),
    };

    return res.json({ upcoming, topDrivers, trending, stats });
  } catch (err) { return next(err); }
}

module.exports = { create, search, getOne, getMine, update, complete, remove, homeData };
