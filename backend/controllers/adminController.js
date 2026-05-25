const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../database');
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

async function getCharts(req, res, next) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [usersPerMonth, ridesPerMonth, bookingStatuses] = await Promise.all([
      sequelize.query(
        `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count
         FROM users WHERE role = 'user' AND createdAt >= :from
         GROUP BY month ORDER BY month ASC`,
        { replacements: { from: sixMonthsAgo }, type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count
         FROM rides WHERE createdAt >= :from
         GROUP BY month ORDER BY month ASC`,
        { replacements: { from: sixMonthsAgo }, type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT status, COUNT(*) as count FROM bookings GROUP BY status`,
        { type: sequelize.QueryTypes.SELECT }
      ),
    ]);

    // Remplir les mois manquants avec 0
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7));
    }

    const fillMonths = (data) =>
      months.map((m) => ({
        month: m,
        count: parseInt(data.find((r) => r.month === m)?.count || 0),
      }));

    const frMonths = { '01':'Jan','02':'Fév','03':'Mar','04':'Avr','05':'Mai','06':'Jun','07':'Jul','08':'Aoû','09':'Sep','10':'Oct','11':'Nov','12':'Déc' };
    const formatMonth = (m) => `${frMonths[m.split('-')[1]]} ${m.split('-')[0]}`;

    const inscriptions = fillMonths(usersPerMonth).map((r) => ({ ...r, month: formatMonth(r.month) }));
    const trajets      = fillMonths(ridesPerMonth).map((r) => ({ ...r, month: formatMonth(r.month) }));

    const statusLabels = { pending: 'En attente', accepted: 'Acceptées', refused: 'Refusées', cancelled: 'Annulées' };
    const statusColors = { pending: '#F59E0B', accepted: '#10B981', refused: '#EF4444', cancelled: '#6B7280' };
    const reservations = bookingStatuses.map((r) => ({
      name: statusLabels[r.status] || r.status,
      value: parseInt(r.count),
      color: statusColors[r.status] || '#94A3B8',
    }));

    return res.json({ inscriptions, trajets, reservations });
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

module.exports = { getDashboard, getCharts, listUsers, listRides, blockUser, unblockUser, deleteUser, cancelRide };
