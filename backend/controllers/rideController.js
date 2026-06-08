const { Op } = require('sequelize');
const { Ride, User, Booking } = require('../models');
const sequelize = require('../database');
const { triggerAlerts } = require('./rideAlertController');

async function create(req, res, next) {
  try {
    const { from, to, departureDate, price, seats, description, instantBooking } = req.body;
    const ride = await Ride.create({
      driverId: req.user.id,
      from, to, departureDate,
      price, seats,
      seatsAvailable: seats,
      description,
      instantBooking: instantBooking || false,
    });
    triggerAlerts(ride);
    return res.status(201).json({ ride });
  } catch (err) { return next(err); }
}

async function search(req, res, next) {
  try {
    const { from, to, date, minPrice, maxPrice, transportMode } = req.query;
    const where = { status: 'active', seatsAvailable: { [Op.gt]: 0 } };

    if (from) where.from = { [Op.like]: `%${from}%` };
    if (to)   where.to   = { [Op.like]: `%${to}%` };
    if (date) {
      const d = new Date(date);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      where.departureDate = { [Op.between]: [d, next] };
    }
    if (minPrice) where.price = { ...where.price, [Op.gte]: Number(minPrice) };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: Number(maxPrice) };
    if (transportMode && transportMode !== 'all') where.transportMode = transportMode;

    const rides = await Ride.findAll({
      where,
      include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating', 'totalRatings'] }],
      order: [['departureDate', 'ASC']],
    });
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
    return res.json({ message: 'Trajet annulé.' });
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
