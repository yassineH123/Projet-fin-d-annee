const { WaitlistEntry, Ride, User, Notification } = require('../models');

async function join(req, res, next) {
  try {
    const { rideId } = req.params;
    const { seats = 1 } = req.body;
    const ride = await Ride.findByPk(rideId);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    if (ride.seatsAvailable > 0) return res.status(400).json({ message: 'Des places sont disponibles, réservez directement.' });

    const existing = await WaitlistEntry.findOne({ where: { rideId, userId: req.user.id, status: 'waiting' } });
    if (existing) return res.status(409).json({ message: 'Vous êtes déjà sur liste d\'attente.' });

    const entry = await WaitlistEntry.create({ rideId, userId: req.user.id, seats });
    return res.status(201).json({ entry });
  } catch (err) { return next(err); }
}

async function leave(req, res, next) {
  try {
    const entry = await WaitlistEntry.findOne({ where: { rideId: req.params.rideId, userId: req.user.id } });
    if (!entry) return res.status(404).json({ message: 'Entrée introuvable.' });
    await entry.update({ status: 'cancelled' });
    return res.json({ message: 'Retiré de la liste d\'attente.' });
  } catch (err) { return next(err); }
}

async function getForRide(req, res, next) {
  try {
    const entries = await WaitlistEntry.findAll({
      where: { rideId: req.params.rideId, status: 'waiting' },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating'] }],
      order: [['createdAt', 'ASC']],
    });
    return res.json({ entries });
  } catch (err) { return next(err); }
}

async function getMyWaitlist(req, res, next) {
  try {
    const entries = await WaitlistEntry.findAll({
      where: { userId: req.user.id, status: 'waiting' },
      include: [{ model: Ride, as: 'ride', attributes: ['id', 'from', 'to', 'departureDate', 'price', 'seatsAvailable'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ entries });
  } catch (err) { return next(err); }
}

async function notifyWaitlist(rideId) {
  try {
    const entries = await WaitlistEntry.findAll({
      where: { rideId, status: 'waiting' },
      include: [{ model: Ride, as: 'ride', attributes: ['from', 'to'] }],
      order: [['createdAt', 'ASC']],
    });
    for (const entry of entries) {
      await Notification.create({
        userId: entry.userId,
        type: 'ride',
        title: 'Place disponible !',
        body: `Une place s'est libérée sur ${entry.ride?.from} → ${entry.ride?.to}`,
        link: `/rides/${rideId}`,
      });
      await entry.update({ status: 'notified' });
    }
  } catch (_) {}
}

module.exports = { join, leave, getForRide, getMyWaitlist, notifyWaitlist };
