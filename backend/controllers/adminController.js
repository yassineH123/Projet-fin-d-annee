const { Op } = require('sequelize');
const { User, Ride, Booking, Review } = require('../models');
const { createNotification } = require('../services/notificationService');
const { sendDriverVerificationResult } = require('../services/emailService');

async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalRides, totalBookings, totalReviews] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      Ride.count(),
      Booking.count(),
      Review.count(),
    ]);
    return res.json({ stats: { totalUsers, totalRides, totalBookings, totalReviews } });
  } catch (err) { return next(err); }
}

async function listUsers(req, res, next) {
  try {
    const search = (req.query.search || '').trim();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const where = { role: { [Op.in]: ['user', 'admin'] } };
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName:  { [Op.like]: `%${search}%` } },
        { email:     { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit, offset,
    });

    return res.json({ users, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

async function listRides(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const { count, rows: rides } = await Ride.findAndCountAll({
      include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit, offset: (page - 1) * limit,
    });
    return res.json({ rides, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

async function blockUser(req, res, next) {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (target.id === req.user.id) return res.status(403).json({ message: 'Vous ne pouvez pas vous bloquer vous-même.' });
    if (target.role === 'admin' && req.user.role !== 'superadmin')
      return res.status(403).json({ message: 'Seul un super admin peut bloquer un admin.' });
    if (target.role === 'superadmin') return res.status(403).json({ message: 'Action non autorisée.' });
    await target.update({ status: 'blocked' });
    return res.json({ message: 'Utilisateur bloqué.' });
  } catch (err) { return next(err); }
}

async function unblockUser(req, res, next) {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (target.role === 'admin' && req.user.role !== 'superadmin')
      return res.status(403).json({ message: 'Seul un super admin peut débloquer un admin.' });
    await target.update({ status: 'active' });
    return res.json({ message: 'Utilisateur débloqué.' });
  } catch (err) { return next(err); }
}

async function deleteUser(req, res, next) {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (target.id === req.user.id) return res.status(403).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    if (target.role === 'admin' && req.user.role !== 'superadmin')
      return res.status(403).json({ message: 'Seul un super admin peut supprimer un admin.' });
    if (target.role === 'superadmin') return res.status(403).json({ message: 'Action non autorisée.' });
    await target.destroy();
    return res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) { return next(err); }
}

async function cancelRide(req, res, next) {
  try {
    const ride = await Ride.findByPk(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    await ride.update({ status: 'cancelled' });
    return res.json({ message: 'Trajet annulé.' });
  } catch (err) { return next(err); }
}

// ── Driver verification ──────────────────────────────────────────────────────

async function listPendingDrivers(req, res, next) {
  try {
    const drivers = await User.findAll({
      where: {
        driverVerified: false,
        [Op.or]: [
          { passportDoc: { [Op.ne]: null } },
          { cinDoc:      { [Op.ne]: null } },
        ],
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    return res.json({ drivers });
  } catch (err) { return next(err); }
}

async function approveDriver(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    await user.update({ driverVerified: true });
    createNotification(user.id, {
      type: 'system',
      title: 'Profil conducteur vérifié ✅',
      message: 'Félicitations ! Votre profil conducteur a été vérifié. Vous pouvez maintenant publier des trajets.',
      link: '/rides/publish',
    });
    sendDriverVerificationResult({ to: user.email, firstName: user.firstName, approved: true }).catch(() => {});
    return res.json({ message: 'Conducteur approuvé.' });
  } catch (err) { return next(err); }
}

async function rejectDriver(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const { reason } = req.body;
    await user.update({ driverVerified: false, passportDoc: null, cinDoc: null });
    createNotification(user.id, {
      type: 'system',
      title: 'Document refusé ❌',
      message: reason || 'Votre document a été refusé. Veuillez soumettre un nouveau document valide.',
      link: '/profile',
    });
    sendDriverVerificationResult({ to: user.email, firstName: user.firstName, approved: false, reason }).catch(() => {});
    return res.json({ message: 'Conducteur refusé.' });
  } catch (err) { return next(err); }
}

// ── Vérification d'identité (KYC) ──
async function listPendingKyc(req, res, next) {
  try {
    const users = await User.findAll({
      where: { kycStatus: 'pending' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'photo', 'kycSelfie', 'cinDoc', 'kycStatus', 'createdAt'],
      order: [['updatedAt', 'DESC']],
    });
    return res.json({ users });
  } catch (err) { return next(err); }
}

async function approveKyc(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    await user.update({ kycStatus: 'approved' });
    createNotification(user.id, {
      type: 'system',
      title: 'Identité vérifiée',
      message: 'Votre identité a été vérifiée avec succès. Un badge de confiance apparaît désormais sur votre profil.',
      link: '/profile',
    });
    return res.json({ message: 'Identité approuvée.' });
  } catch (err) { return next(err); }
}

async function rejectKyc(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const { reason } = req.body;
    await user.update({ kycStatus: 'rejected', kycSelfie: null });
    createNotification(user.id, {
      type: 'system',
      title: 'Vérification d\'identité refusée',
      message: reason || 'Votre vérification d\'identité a été refusée. Veuillez soumettre des documents valides et lisibles.',
      link: '/profile',
    });
    return res.json({ message: 'Identité refusée.' });
  } catch (err) { return next(err); }
}

module.exports = { getDashboard, listUsers, listRides, blockUser, unblockUser, deleteUser, cancelRide, listPendingDrivers, approveDriver, rejectDriver, listPendingKyc, approveKyc, rejectKyc };
