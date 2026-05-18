const { Booking, Ride, User } = require('../models');

const includeDetails = [
  { model: Ride, as: 'ride', include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating'] }] },
  { model: User, as: 'passenger', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating'] },
];

async function create(req, res, next) {
  try {
    const { rideId, seats = 1, message } = req.body;
    const ride = await Ride.findByPk(rideId);
    if (!ride || ride.status !== 'active') return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId === req.user.id) return res.status(400).json({ message: 'Vous ne pouvez pas réserver votre propre trajet.' });
    if (ride.seatsAvailable < seats) return res.status(400).json({ message: 'Pas assez de places disponibles.' });

    const exists = await Booking.findOne({ where: { rideId, passengerId: req.user.id, status: ['pending', 'accepted'] } });
    if (exists) return res.status(409).json({ message: 'Vous avez déjà une réservation pour ce trajet.' });

    const status = ride.instantBooking ? 'accepted' : 'pending';
    const booking = await Booking.create({ rideId, passengerId: req.user.id, seats, message, status });

    if (ride.instantBooking) {
      await ride.update({ seatsAvailable: ride.seatsAvailable - seats });
    }

    return res.status(201).json({ booking });
  } catch (err) { return next(err); }
}

async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.findAll({
      where: { passengerId: req.user.id },
      include: includeDetails,
      order: [['createdAt', 'DESC']],
    });
    return res.json({ bookings });
  } catch (err) { return next(err); }
}

async function getDriverBookings(req, res, next) {
  try {
    const rides = await Ride.findAll({ where: { driverId: req.user.id }, attributes: ['id'] });
    const rideIds = rides.map(r => r.id);
    const bookings = await Booking.findAll({
      where: { rideId: rideIds },
      include: includeDetails,
      order: [['createdAt', 'DESC']],
    });
    return res.json({ bookings });
  } catch (err) { return next(err); }
}

async function accept(req, res, next) {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Ride, as: 'ride' }],
    });
    if (!booking) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (booking.ride.driverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Réservation déjà traitée.' });

    await booking.update({ status: 'accepted' });
    await booking.ride.update({ seatsAvailable: booking.ride.seatsAvailable - booking.seats });
    return res.json({ booking, message: 'Réservation acceptée.' });
  } catch (err) { return next(err); }
}

async function refuse(req, res, next) {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Ride, as: 'ride' }],
    });
    if (!booking) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (booking.ride.driverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Réservation déjà traitée.' });

    await booking.update({ status: 'refused' });
    return res.json({ booking, message: 'Réservation refusée.' });
  } catch (err) { return next(err); }
}

async function cancel(req, res, next) {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Ride, as: 'ride' }],
    });
    if (!booking) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (booking.passengerId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });

    if (booking.status === 'accepted') {
      await booking.ride.update({ seatsAvailable: booking.ride.seatsAvailable + booking.seats });
    }
    await booking.update({ status: 'cancelled' });
    return res.json({ message: 'Réservation annulée.' });
  } catch (err) { return next(err); }
}

async function pendingCount(req, res, next) {
  try {
    const rides = await Ride.findAll({ where: { driverId: req.user.id }, attributes: ['id'] });
    const rideIds = rides.map(r => r.id);
    const count = rideIds.length
      ? await Booking.count({ where: { rideId: rideIds, status: 'pending' } })
      : 0;
    return res.json({ count });
  } catch (err) { return next(err); }
}

module.exports = { create, getMyBookings, getDriverBookings, accept, refuse, cancel, pendingCount };
