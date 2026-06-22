const { Booking, Ride, User, Transaction } = require('../models');
const { createNotification } = require('../services/notificationService');
const { sendBookingConfirmation, sendBookingCancellation } = require('../services/emailService');
const { notifyWaitlist } = require('./waitlistController');
const { assignBadges } = require('./analyticsController');
const sequelize = require('../database');

function refundPolicy(ride) {
  const hoursUntil = (new Date(ride.departureDate) - Date.now()) / 3600000;
  if (hoursUntil >= 24) return 1.0;
  if (hoursUntil >= 2)  return 0.5;
  return 0;
}

const includeDetails = [
  { model: Ride, as: 'ride', include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating'] }] },
  { model: User, as: 'passenger', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating'] },
];

async function create(req, res, next) {
  try {
    const { rideId, seats = 1, message, useCredits = false } = req.body;
    const ride = await Ride.findByPk(rideId);
    if (!ride || ride.status !== 'active') return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId === req.user.id) return res.status(400).json({ message: 'Vous ne pouvez pas réserver votre propre trajet.' });
    if (ride.seatsAvailable < seats) return res.status(400).json({ message: 'Pas assez de places disponibles.' });

    const exists = await Booking.findOne({ where: { rideId, passengerId: req.user.id, status: ['pending', 'accepted'] } });
    if (exists) return res.status(409).json({ message: 'Vous avez déjà une réservation pour ce trajet.' });

    const passenger = await User.findByPk(req.user.id);

    // Trajet réservé aux femmes : seules les passagères peuvent réserver
    if (ride.womenOnly && passenger.gender !== 'femme') {
      return res.status(403).json({ message: 'Ce trajet est réservé aux femmes.' });
    }

    let creditsUsed = 0;
    if (useCredits && passenger.referralCredits > 0) {
      const totalPrice = ride.price * seats;
      creditsUsed = Math.min(passenger.referralCredits, totalPrice);
      await passenger.decrement({ referralCredits: creditsUsed });
    }

    const status = ride.instantBooking ? 'accepted' : 'pending';
    const booking = await Booking.create({ rideId, passengerId: req.user.id, seats, message, status, creditsUsed });

    if (ride.instantBooking) {
      await ride.update({ seatsAvailable: ride.seatsAvailable - seats });
    }

    createNotification(ride.driverId, {
      type: 'booking',
      title: 'Nouvelle réservation',
      message: `${passenger.firstName} ${passenger.lastName} a réservé ${seats} place(s) sur votre trajet ${ride.from} → ${ride.to}`,
      link: '/bookings',
    });

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

    // Badge & level check for driver
    assignBadges(req.user.id);

    createNotification(booking.passengerId, {
      type: 'booking',
      title: 'Réservation acceptée ✅',
      message: `Votre réservation pour ${booking.ride.from} → ${booking.ride.to} a été acceptée !`,
      link: '/bookings',
    });

    // Email de confirmation au passager
    const passenger = await User.findByPk(booking.passengerId, { attributes: ['email', 'firstName'] });
    if (passenger?.email) {
      sendBookingConfirmation({
        to: passenger.email,
        passenger: passenger.firstName,
        ride: booking.ride,
        seats: booking.seats,
        totalPrice: (parseFloat(booking.ride.price) * booking.seats).toFixed(0),
      }).catch(() => {});
    }

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
    createNotification(booking.passengerId, {
      type: 'booking',
      title: 'Réservation refusée',
      message: `Votre réservation pour ${booking.ride.from} → ${booking.ride.to} n'a pas été acceptée.`,
      link: '/bookings',
    });
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

    let refundAmount = 0;
    let refundRate = 0;

    if (booking.status === 'accepted') {
      const newSeats = booking.ride.seatsAvailable + booking.seats;
      await booking.ride.update({ seatsAvailable: newSeats });

      // Politique de remboursement
      refundRate = refundPolicy(booking.ride);
      const totalPaid = parseFloat(booking.ride.price) * booking.seats;
      refundAmount = Math.round(totalPaid * refundRate * 100) / 100;

      if (refundAmount > 0) {
        const passenger = await User.findByPk(req.user.id);
        const newBalance = parseFloat(passenger.walletBalance) + refundAmount;
        await passenger.update({ walletBalance: newBalance });
        await Transaction.create({
          userId: req.user.id,
          type: 'credit',
          amount: refundAmount,
          description: `Remboursement annulation trajet ${booking.ride.from} → ${booking.ride.to}`,
          rideId: booking.rideId,
          balanceAfter: newBalance,
        });
      }

      // Notifier la liste d'attente si une place s'est libérée
      notifyWaitlist(booking.rideId);

      createNotification(booking.ride.driverId, {
        type: 'booking',
        title: 'Réservation annulée',
        message: `${booking.seats} place(s) annulée(s) sur votre trajet ${booking.ride.from} → ${booking.ride.to}.`,
        link: '/bookings',
      });
    }

    await booking.update({ status: 'cancelled' });

    // Email d'annulation au passager
    const passengerUser = await User.findByPk(req.user.id, { attributes: ['email', 'firstName'] });
    if (passengerUser?.email) {
      sendBookingCancellation({
        to: passengerUser.email,
        passenger: passengerUser.firstName,
        ride: booking.ride,
        refundAmount,
        refundRate,
      }).catch(() => {});
    }

    const msg = refundAmount > 0
      ? `Réservation annulée. ${refundAmount} DH remboursés dans votre portefeuille (${Math.round(refundRate * 100)}%).`
      : 'Réservation annulée.';
    return res.json({ message: msg, refundAmount, refundRate });
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
