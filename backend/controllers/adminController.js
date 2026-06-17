const { Op } = require('sequelize');
const sequelize = require('../database');
const { User, Ride, Booking, Review, Report, AdminLog } = require('../models');
const REVIEWER_ATTRS = ['id', 'firstName', 'lastName', 'photo'];
const { logAdminAction } = require('../services/auditLogService');

const SAFE_USER_ATTRS = { exclude: ['password'] };

async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalDrivers, totalRides, totalBookings, totalReviews, totalReports, totalBanned] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      User.count({ where: { role: 'user', isDriver: true } }),
      Ride.count(),
      Booking.count(),
      Review.count(),
      Report.count(),
      User.count({ where: { status: 'blocked' } }),
    ]);
    return res.json({
      stats: { totalUsers, totalDrivers, totalRides, totalBookings, totalReviews, totalReports, totalBanned },
    });
  } catch (err) { return next(err); }
}

async function getCharts(req, res, next) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [usersPerMonth, ridesPerMonth, bookingStatuses, reportStatuses] = await Promise.all([
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
      sequelize.query(
        `SELECT status, COUNT(*) as count FROM reports GROUP BY status`,
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

    const bookingStatusLabels = { pending: 'En attente', accepted: 'Acceptées', refused: 'Refusées', cancelled: 'Annulées' };
    const bookingStatusColors = { pending: '#F59E0B', accepted: '#10B981', refused: '#EF4444', cancelled: '#6B7280' };
    const reservations = bookingStatuses.map((r) => ({
      name: bookingStatusLabels[r.status] || r.status,
      value: parseInt(r.count),
      color: bookingStatusColors[r.status] || '#94A3B8',
    }));

    const reportStatusLabels = { pending: 'En attente', in_progress: 'En cours', resolved: 'Résolus', rejected: 'Rejetés' };
    const reportStatusColors = { pending: '#F59E0B', in_progress: '#3B82F6', resolved: '#10B981', rejected: '#6B7280' };
    const reports = reportStatuses.map((r) => ({
      name: reportStatusLabels[r.status] || r.status,
      value: parseInt(r.count),
      color: reportStatusColors[r.status] || '#94A3B8',
    }));

    return res.json({ inscriptions, trajets, reservations, reports });
  } catch (err) { return next(err); }
}

async function listUsers(req, res, next) {
  try {
    const search = (req.query.search || '').trim().slice(0, 100);
    const role   = req.query.role;
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = 20;
    const offset = (page - 1) * limit;

    const allowedRoles = ['user', 'admin'];
    const where = { role: { [Op.in]: allowedRoles } };
    if (role && allowedRoles.includes(role)) {
      where.role = role;
    }
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName:  { [Op.like]: `%${search}%` } },
        { email:     { [Op.like]: `%${search}%` } },
        { phone:     { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: SAFE_USER_ATTRS,
      order: [['createdAt', 'DESC']],
      limit, offset,
    });

    return res.json({ users, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

async function getUserDetail(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, { attributes: SAFE_USER_ATTRS });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const [ridesAsDriver, bookingsAsPassenger, reportsReceived, reportsFiled, reviews] = await Promise.all([
      Ride.count({ where: { driverId: user.id } }),
      Booking.count({ where: { passengerId: user.id } }),
      Report.count({ where: { reportedUserId: user.id } }),
      Report.count({ where: { reporterId: user.id } }),
      Review.findAll({
        where: { reviewedId: user.id },
        include: [{ model: User, as: 'reviewer', attributes: REVIEWER_ATTRS }],
        order: [['createdAt', 'DESC']],
        limit: 20,
      }),
    ]);

    return res.json({
      user,
      stats: { ridesAsDriver, bookingsAsPassenger, reportsReceived, reportsFiled },
      reviews,
    });
  } catch (err) { return next(err); }
}

function assertCanActOnTarget(req, target) {
  if (target.id === req.user.id) {
    return 'Vous ne pouvez pas effectuer cette action sur votre propre compte.';
  }
  if (target.role === 'superadmin') {
    return 'Action non autorisée sur un super admin.';
  }
  if (target.role === 'admin' && req.user.role !== 'superadmin') {
    return 'Seul un super admin peut agir sur un compte admin.';
  }
  return null;
}

async function suspendUser(req, res, next) {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const error = assertCanActOnTarget(req, target);
    if (error) return res.status(403).json({ message: error });

    await target.update({ status: 'suspended' });
    await logAdminAction({ adminId: req.user.id, action: 'SUSPEND_USER', targetType: 'User', targetId: target.id });
    return res.json({ message: 'Compte désactivé.' });
  } catch (err) { return next(err); }
}

async function banUser(req, res, next) {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const error = assertCanActOnTarget(req, target);
    if (error) return res.status(403).json({ message: error });

    await target.update({ status: 'blocked' });
    await logAdminAction({ adminId: req.user.id, action: 'BAN_USER', targetType: 'User', targetId: target.id });
    return res.json({ message: 'Utilisateur banni.' });
  } catch (err) { return next(err); }
}

async function reactivateUser(req, res, next) {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (target.role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Seul un super admin peut réactiver un compte admin.' });
    }

    await target.update({ status: 'active' });
    await logAdminAction({ adminId: req.user.id, action: 'REACTIVATE_USER', targetType: 'User', targetId: target.id });
    return res.json({ message: 'Compte réactivé.' });
  } catch (err) { return next(err); }
}

async function deleteUser(req, res, next) {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const error = assertCanActOnTarget(req, target);
    if (error) return res.status(403).json({ message: error });

    await target.destroy();
    await logAdminAction({ adminId: req.user.id, action: 'DELETE_USER', targetType: 'User', targetId: target.id, details: { email: target.email } });
    return res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) { return next(err); }
}

async function listRides(req, res, next) {
  try {
    const search = (req.query.search || '').trim().slice(0, 100);
    const status = req.query.status;
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = 20;

    const where = {};
    if (status && ['active', 'cancelled', 'completed'].includes(status)) {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { from: { [Op.like]: `%${search}%` } },
        { to:   { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: rides } = await Ride.findAndCountAll({
      where,
      include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit, offset: (page - 1) * limit,
    });
    return res.json({ rides, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

async function getRideDetail(req, res, next) {
  try {
    const ride = await Ride.findByPk(req.params.id, {
      include: [
        { model: User, as: 'driver', attributes: SAFE_USER_ATTRS },
        { model: Booking, as: 'bookings', include: [{ model: User, as: 'passenger', attributes: ['id', 'firstName', 'lastName', 'email'] }] },
      ],
    });
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    return res.json({ ride });
  } catch (err) { return next(err); }
}

async function cancelRide(req, res, next) {
  try {
    const ride = await Ride.findByPk(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });

    await ride.update({ status: 'cancelled' });
    await logAdminAction({ adminId: req.user.id, action: 'CANCEL_RIDE', targetType: 'Ride', targetId: ride.id });
    return res.json({ message: 'Trajet annulé.' });
  } catch (err) { return next(err); }
}

async function deleteRide(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const ride = await Ride.findByPk(req.params.id, { transaction });
    if (!ride) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Trajet introuvable.' });
    }

    await Booking.destroy({ where: { rideId: ride.id }, transaction });
    await ride.destroy({ transaction });
    await transaction.commit();

    await logAdminAction({
      adminId: req.user.id,
      action: 'DELETE_RIDE',
      targetType: 'Ride',
      targetId: req.params.id,
      details: { from: ride.from, to: ride.to },
    });
    return res.json({ message: 'Trajet supprimé.' });
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
}

async function listReports(req, res, next) {
  try {
    const status = req.query.status;
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = 20;

    const where = {};
    if (status && ['pending', 'in_progress', 'resolved', 'rejected'].includes(status)) {
      where.status = status;
    }

    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter',     attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'reportedUser', attributes: ['id', 'firstName', 'lastName', 'email', 'status'] },
        { model: Ride, as: 'ride',         attributes: ['id', 'from', 'to'], required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit, offset: (page - 1) * limit,
    });
    return res.json({ reports, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

async function getReportDetail(req, res, next) {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [
        { model: User, as: 'reporter',      attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: User, as: 'reportedUser',  attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'status'] },
        { model: User, as: 'handledByAdmin', attributes: ['id', 'firstName', 'lastName'] },
        { model: Ride, as: 'ride', required: false },
      ],
    });
    if (!report) return res.status(404).json({ message: 'Signalement introuvable.' });
    return res.json({ report });
  } catch (err) { return next(err); }
}

async function updateReportStatus(req, res, next) {
  try {
    const { status, adminNote } = req.body;
    const allowedStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: 'Signalement introuvable.' });

    const updates = { status };
    if (adminNote !== undefined) updates.adminNote = adminNote;
    updates.handledBy = req.user.id;
    updates.resolvedAt = ['resolved', 'rejected'].includes(status) ? new Date() : null;

    await report.update(updates);
    await logAdminAction({
      adminId: req.user.id,
      action: 'UPDATE_REPORT_STATUS',
      targetType: 'Report',
      targetId: report.id,
      details: { status },
    });
    return res.json({ message: 'Signalement mis à jour.', report });
  } catch (err) { return next(err); }
}

async function listAdminLogs(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 30;

    const where = {};
    if (req.query.action)     where.action     = req.query.action;
    if (req.query.targetType) where.targetType = req.query.targetType;

    const { count, rows: logs } = await AdminLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit, offset: (page - 1) * limit,
    });
    return res.json({ logs, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

module.exports = {
  getDashboard, getCharts,
  listUsers, getUserDetail, suspendUser, banUser, reactivateUser, deleteUser,
  listRides, getRideDetail, cancelRide, deleteRide,
  listReports, getReportDetail, updateReportStatus,
  listAdminLogs,
};
