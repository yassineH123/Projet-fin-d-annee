const { Booking, Ride, User, Transaction } = require('../models');
const { createNotification } = require('../services/notificationService');
const { sendBookingConfirmation, sendBookingCancellation } = require('../services/emailService');
const { notifyWaitlist } = require('./waitlistController');
const { assignBadges } = require('./analyticsController');

function refundPolicy(ride) {
  const hoursUntil = (new Date(ride.departureDate) - Date.now()) / 3600000;
  if (hoursUntil >= 24) return 1.0;
  if (hoursUntil >= 2)  return 0.5;
  return 0;
}

function populateDetails(query) {
  return query.populate({ path: 'ride', populate: { path: 'driver', select: 'firstName lastName photo avgRating' } })
              .populate({ path: 'passenger', select: 'firstName lastName photo avgRating' });
}

async function create(req, res, next) {
  try {
    if (['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Un administrateur ne peut pas réserver de trajet.' });
    }

    const { rideId, seats = 1, message, useCredits = false } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride || ride.status !== 'active') return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.driverId === req.user.id) return res.status(400).json({ message: 'Vous ne pouvez pas réserver votre propre trajet.' });
    if (ride.seatsAvailable < seats) return res.status(400).json({ message: 'Pas assez de places disponibles.' });

    const exists = await Booking.findOne({ rideId, passengerId: req.user.id, status: { $in: ['pending', 'accepted'] } });
    if (exists) return res.status(409).json({ message: 'Vous avez déjà une réservation pour ce trajet.' });

    const passenger = await User.findById(req.user.id);

    // Trajet réservé aux femmes : seules les passagères peuvent réserver
    if (ride.womenOnly && passenger.gender !== 'femme') {
      return res.status(403).json({ message: 'Ce trajet est réservé aux femmes.' });
    }

    let creditsUsed = 0;
    if (useCredits && passenger.referralCredits > 0) {
      const totalPrice = ride.price * seats;
      creditsUsed = Math.min(passenger.referralCredits, totalPrice);
      await User.findByIdAndUpdate(passenger.id, { $inc: { referralCredits: -creditsUsed } });
    }

    const status = ride.instantBooking ? 'accepted' : 'pending';
    const booking = await Booking.create({ rideId, passengerId: req.user.id, seats, message, status, creditsUsed });

    if (ride.instantBooking) {
      ride.set({ seatsAvailable: ride.seatsAvailable - seats });
      await ride.save();
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
    const bookings = await populateDetails(Booking.find({ passengerId: req.user.id }).sort({ createdAt: -1 }));
    return res.json({ bookings });
  } catch (err) { return next(err); }
}

async function getDriverBookings(req, res, next) {
  try {
    const rides = await Ride.find({ driverId: req.user.id }).select('_id');
    const rideIds = rides.map(r => r.id);
    const bookings = await populateDetails(Booking.find({ rideId: { $in: rideIds } }).sort({ createdAt: -1 }));
    return res.json({ bookings });
  } catch (err) { return next(err); }
}

async function accept(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride');
    if (!booking) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (booking.ride.driverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Réservation déjà traitée.' });

    booking.set({ status: 'accepted' });
    await booking.save();
    booking.ride.set({ seatsAvailable: booking.ride.seatsAvailable - booking.seats });
    await booking.ride.save();

    // Badge & level check for driver
    assignBadges(req.user.id);

    createNotification(booking.passengerId, {
      type: 'booking',
      title: 'Réservation acceptée ✅',
      message: `Votre réservation pour ${booking.ride.from} → ${booking.ride.to} a été acceptée !`,
      link: '/bookings',
    });

    // Email de confirmation au passager
    const passenger = await User.findById(booking.passengerId).select('email firstName');
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
    const booking = await Booking.findById(req.params.id).populate('ride');
    if (!booking) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (booking.ride.driverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Réservation déjà traitée.' });

    booking.set({ status: 'refused' });
    await booking.save();
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
    const booking = await Booking.findById(req.params.id).populate('ride');
    if (!booking) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (booking.passengerId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });

    let refundAmount = 0;
    let refundRate = 0;

    if (booking.status === 'accepted') {
      const newSeats = booking.ride.seatsAvailable + booking.seats;
      booking.ride.set({ seatsAvailable: newSeats });
      await booking.ride.save();

      // Politique de remboursement
      refundRate = refundPolicy(booking.ride);
      const totalPaid = parseFloat(booking.ride.price) * booking.seats;
      refundAmount = Math.round(totalPaid * refundRate * 100) / 100;

      if (refundAmount > 0) {
        const passenger = await User.findById(req.user.id);
        const newBalance = parseFloat(passenger.walletBalance) + refundAmount;
        passenger.set({ walletBalance: newBalance });
        await passenger.save();
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

    booking.set({ status: 'cancelled' });
    await booking.save();

    // Email d'annulation au passager
    const passengerUser = await User.findById(req.user.id).select('email firstName');
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
    const rides = await Ride.find({ driverId: req.user.id }).select('_id');
    const rideIds = rides.map(r => r.id);
    const count = rideIds.length
      ? await Booking.countDocuments({ rideId: { $in: rideIds }, status: 'pending' })
      : 0;
    return res.json({ count });
  } catch (err) { return next(err); }
}

module.exports = { create, getMyBookings, getDriverBookings, accept, refuse, cancel, pendingCount };
