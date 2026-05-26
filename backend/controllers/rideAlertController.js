const { RideAlert, Ride, User, Notification } = require('../models');
const { Op } = require('sequelize');

async function create(req, res, next) {
  try {
    const { from, to, date, maxPrice, transportMode } = req.body;
    const alert = await RideAlert.create({ userId: req.user.id, from, to, date: date || null, maxPrice: maxPrice || null, transportMode: transportMode || null });
    return res.status(201).json({ alert });
  } catch (err) { return next(err); }
}

async function getMine(req, res, next) {
  try {
    const alerts = await RideAlert.findAll({ where: { userId: req.user.id }, order: [['createdAt','DESC']] });
    return res.json({ alerts });
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    const alert = await RideAlert.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!alert) return res.status(404).json({ message: 'Alerte introuvable.' });
    await alert.destroy();
    return res.json({ message: 'Alerte supprimée.' });
  } catch (err) { return next(err); }
}

async function toggle(req, res, next) {
  try {
    const alert = await RideAlert.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!alert) return res.status(404).json({ message: 'Alerte introuvable.' });
    await alert.update({ active: !alert.active });
    return res.json({ alert });
  } catch (err) { return next(err); }
}

// Called after a new ride is published
async function triggerAlerts(ride) {
  try {
    const where = { active: true, from: { [Op.like]: `%${ride.from}%` }, to: { [Op.like]: `%${ride.to}%` } };
    if (ride.transportMode) where.transportMode = { [Op.or]: [ride.transportMode, null] };
    const alerts = await RideAlert.findAll({ where });
    for (const alert of alerts) {
      if (alert.maxPrice && ride.price > alert.maxPrice) continue;
      if (alert.date && new Date(alert.date).toDateString() !== new Date(ride.departureDate).toDateString()) continue;
      await Notification.create({
        userId: alert.userId,
        type: 'ride',
        title: '🔔 Trajet correspondant trouvé !',
        body: `Nouveau trajet ${ride.from} → ${ride.to} disponible à ${ride.price} DH`,
        link: `/rides/${ride.id}`,
      });
    }
  } catch (_) {}
}

module.exports = { create, getMine, remove, toggle, triggerAlerts };
