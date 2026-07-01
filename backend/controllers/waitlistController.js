const { WaitlistEntry, Ride, User, Notification } = require('../models');

async function join(req, res, next) {
  try {
    const { rideId } = req.params;
    const { seats = 1 } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.seatsAvailable > 0) return res.status(400).json({ message: 'Des places sont disponibles, réservez directement.' });

    const existing = await WaitlistEntry.findOne({ rideId, userId: req.user.id, status: 'waiting' });
    if (existing) return res.status(409).json({ message: 'Vous êtes déjà sur liste d\'attente.' });

    const entry = await WaitlistEntry.create({ rideId, userId: req.user.id, seats });
    return res.status(201).json({ entry });
  } catch (err) { return next(err); }
}

async function leave(req, res, next) {
  try {
    const entry = await WaitlistEntry.findOne({ rideId: req.params.rideId, userId: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Entrée introuvable.' });
    entry.set({ status: 'cancelled' });
    await entry.save();
    return res.json({ message: 'Retiré de la liste d\'attente.' });
  } catch (err) { return next(err); }
}

async function getForRide(req, res, next) {
  try {
    const entries = await WaitlistEntry.find({ rideId: req.params.rideId, status: 'waiting' })
      .populate({ path: 'user', select: 'id firstName lastName photo avgRating' })
      .sort({ createdAt: 1 });
    return res.json({ entries });
  } catch (err) { return next(err); }
}

async function getMyWaitlist(req, res, next) {
  try {
    const entries = await WaitlistEntry.find({ userId: req.user.id, status: 'waiting' })
      .populate({ path: 'ride', select: 'id from to departureDate price seatsAvailable' })
      .sort({ createdAt: -1 });
    return res.json({ entries });
  } catch (err) { return next(err); }
}

async function notifyWaitlist(rideId) {
  try {
    const entries = await WaitlistEntry.find({ rideId, status: 'waiting' })
      .populate({ path: 'ride', select: 'from to' })
      .sort({ createdAt: 1 });
    for (const entry of entries) {
      await Notification.create({
        userId: entry.userId,
        type: 'ride',
        title: 'Place disponible !',
        body: `Une place s'est libérée sur ${entry.ride?.from} → ${entry.ride?.to}`,
        link: `/rides/${rideId}`,
      });
      entry.set({ status: 'notified' });
      await entry.save();
    }
  } catch (_) {}
}

module.exports = { join, leave, getForRide, getMyWaitlist, notifyWaitlist };
