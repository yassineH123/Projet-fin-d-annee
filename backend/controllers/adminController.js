const { Op } = require('sequelize');
const { User, Ride, Booking, Review } = require('../models');

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

module.exports = { getDashboard, listUsers, listRides, blockUser, unblockUser, deleteUser, cancelRide };
