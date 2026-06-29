const mongoose = require('mongoose');
const { User, Ride, Booking, Review, Report, AdminLog, Conversation, ConversationMember, Message, Notification, Friendship, SavedSearch } = require('../models');
const Post = require('../models/Post');
const PostLike = require('../models/PostLike');
const PostComment = require('../models/PostComment');
const REVIEWER_ATTRS = 'firstName lastName photo';
const { logAdminAction } = require('../services/auditLogService');
const { createNotification } = require('../services/notificationService');
const { isSuperAdmin } = require('../middleware/permissions');

const SAFE_USER_ATTRS = '-password';

async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalDrivers, totalRides, totalBookings, totalReviews, totalReports, totalBanned] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isDriver: true }),
      Ride.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      Report.countDocuments(),
      User.countDocuments({ status: 'blocked' }),
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
      User.aggregate([
        { $match: { role: 'user', createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $project: { _id: 0, month: '$_id', count: 1 } },
        { $sort: { month: 1 } },
      ]),
      Ride.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $project: { _id: 0, month: '$_id', count: 1 } },
        { $sort: { month: 1 } },
      ]),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]),
      Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]),
    ]);

    // Remplir les mois manquants avec 0.
    // On construit chaque mois via Date.UTC(année, mois - i, 1) : fixer le jour au 1er
    // évite le débordement (ex. « 29 février » inexistant qui basculait sur mars, faisant
    // disparaître février et dupliquer mars), et l'UTC reste aligné sur les buckets
    // $dateToString (UTC) de l'agrégation ci-dessus.
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
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
    const where = { role: { $in: allowedRoles } };
    if (role && allowedRoles.includes(role)) {
      where.role = role;
    }
    if (search) {
      where.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
        { phone:     { $regex: search, $options: 'i' } },
      ];
    }

    const [users, count] = await Promise.all([
      User.find(where).select(SAFE_USER_ATTRS).sort({ createdAt: -1 }).skip(offset).limit(limit),
      User.countDocuments(where),
    ]);

    return res.json({ users, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

async function getUserDetail(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select(SAFE_USER_ATTRS);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const [ridesAsDriver, bookingsAsPassenger, reportsReceived, reportsFiled, reviews] = await Promise.all([
      Ride.countDocuments({ driverId: user.id }),
      Booking.countDocuments({ passengerId: user.id }),
      Report.countDocuments({ reportedUserId: user.id }),
      Report.countDocuments({ reporterId: user.id }),
      Review.find({ reviewedId: user.id })
        .populate({ path: 'reviewer', select: REVIEWER_ATTRS })
        .sort({ createdAt: -1 })
        .limit(20),
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
  if (target.role === 'admin' && !isSuperAdmin(req.user)) {
    return 'Seul un super admin peut agir sur un compte admin.';
  }
  return null;
}

async function suspendUser(req, res, next) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const error = assertCanActOnTarget(req, target);
    if (error) return res.status(403).json({ message: error });

    target.set({ status: 'suspended' });
    await target.save();
    await logAdminAction({ adminId: req.user.id, action: 'SUSPEND_USER', targetType: 'User', targetId: target.id });
    return res.json({ message: 'Compte désactivé.' });
  } catch (err) { return next(err); }
}

async function banUser(req, res, next) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const error = assertCanActOnTarget(req, target);
    if (error) return res.status(403).json({ message: error });

    target.set({ status: 'blocked' });
    await target.save();
    await logAdminAction({ adminId: req.user.id, action: 'BAN_USER', targetType: 'User', targetId: target.id });
    return res.json({ message: 'Utilisateur banni.' });
  } catch (err) { return next(err); }
}

async function reactivateUser(req, res, next) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (target.role === 'admin' && !isSuperAdmin(req.user)) {
      return res.status(403).json({ message: 'Seul un super admin peut réactiver un compte admin.' });
    }

    target.set({ status: 'active' });
    await target.save();
    await logAdminAction({ adminId: req.user.id, action: 'REACTIVATE_USER', targetType: 'User', targetId: target.id });
    return res.json({ message: 'Compte réactivé.' });
  } catch (err) { return next(err); }
}

// L'exigence "super admin uniquement" est appliquée en amont par adminRoutes.js
// (middleware requireSuperAdmin) sur PATCH /users/:id/role.
async function changeUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const error = assertCanActOnTarget(req, target);
    if (error) return res.status(403).json({ message: error });

    target.set({ role });
    await target.save();
    await logAdminAction({ adminId: req.user.id, action: 'CHANGE_USER_ROLE', targetType: 'User', targetId: target.id, details: { role } });
    return res.json({ message: role === 'admin' ? 'Utilisateur promu administrateur.' : 'Administrateur rétrogradé.' });
  } catch (err) { return next(err); }
}

async function deleteUser(req, res, next) {
  const session = await mongoose.startSession();
  try {
    let userId, email;
    await session.withTransaction(async () => {
      const target = await User.findById(req.params.id).session(session);
      if (!target) throw { status: 404, message: 'Utilisateur introuvable.' };
      const error = assertCanActOnTarget(req, target);
      if (error) throw { status: 403, message: error };

      userId = target.id;
      email = target.email;

      const rides = await Ride.find({ driverId: userId }).select('_id').session(session);
      const rideIds = rides.map((r) => r.id);
      const conversations = await Conversation.find({ $or: [{ participant1Id: userId }, { participant2Id: userId }] })
        .select('_id').session(session);
      const conversationIds = conversations.map((c) => c.id);

      await Booking.deleteMany({
        $or: [{ passengerId: userId }, ...(rideIds.length ? [{ rideId: { $in: rideIds } }] : [])],
      }, { session });
      await Review.deleteMany({ $or: [{ reviewerId: userId }, { reviewedId: userId }] }, { session });
      await Report.deleteMany({ $or: [{ reporterId: userId }, { reportedUserId: userId }] }, { session });
      if (conversationIds.length) {
        await Message.deleteMany({ conversationId: { $in: conversationIds } }, { session });
        await ConversationMember.deleteMany({ conversationId: { $in: conversationIds } }, { session });
      }
      await Message.deleteMany({ senderId: userId }, { session });
      await ConversationMember.deleteMany({ userId }, { session });
      await Conversation.deleteMany({ $or: [{ participant1Id: userId }, { participant2Id: userId }] }, { session });
      await Notification.deleteMany({ userId }, { session });
      await Friendship.deleteMany({ $or: [{ requesterId: userId }, { receiverId: userId }] }, { session });
      await SavedSearch.deleteMany({ userId }, { session });
      await AdminLog.deleteMany({ adminId: userId }, { session });

      const posts = await Post.find({ userId }).select('_id').session(session);
      const postIds = posts.map((p) => p.id);
      await PostLike.deleteMany({
        $or: [{ userId }, ...(postIds.length ? [{ postId: { $in: postIds } }] : [])],
      }, { session });
      await PostComment.deleteMany({
        $or: [{ userId }, ...(postIds.length ? [{ postId: { $in: postIds } }] : [])],
      }, { session });
      await Post.deleteMany({ userId }, { session });

      if (rideIds.length) {
        await Ride.deleteMany({ _id: { $in: rideIds } }, { session });
      }

      await target.deleteOne({ session });
    });

    await logAdminAction({ adminId: req.user.id, action: 'DELETE_USER', targetType: 'User', targetId: userId, details: { email } });
    return res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  } finally {
    await session.endSession();
  }
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
      where.$or = [
        { from: { $regex: search, $options: 'i' } },
        { to:   { $regex: search, $options: 'i' } },
      ];
    }

    const [rides, count] = await Promise.all([
      Ride.find(where)
        .populate({ path: 'driver', select: 'firstName lastName email' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Ride.countDocuments(where),
    ]);
    return res.json({ rides, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

async function getRideDetail(req, res, next) {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate({ path: 'driver', select: SAFE_USER_ATTRS })
      .populate({ path: 'bookings', populate: { path: 'passenger', select: 'firstName lastName email' } });
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
    return res.json({ ride });
  } catch (err) { return next(err); }
}

async function cancelRide(req, res, next) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });

    ride.set({ status: 'cancelled' });
    await ride.save();
    await logAdminAction({ adminId: req.user.id, action: 'CANCEL_RIDE', targetType: 'Ride', targetId: ride.id });
    return res.json({ message: 'Trajet annulé.' });
  } catch (err) { return next(err); }
}

async function deleteRide(req, res, next) {
  const session = await mongoose.startSession();
  try {
    let rideInfo;
    await session.withTransaction(async () => {
      const ride = await Ride.findById(req.params.id).session(session);
      if (!ride) throw { status: 404, message: 'Trajet introuvable.' };

      await Booking.deleteMany({ rideId: ride.id }, { session });
      rideInfo = { from: ride.from, to: ride.to };
      await ride.deleteOne({ session });
    });

    await logAdminAction({
      adminId: req.user.id,
      action: 'DELETE_RIDE',
      targetType: 'Ride',
      targetId: req.params.id,
      details: rideInfo,
    });
    return res.json({ message: 'Trajet supprimé.' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  } finally {
    await session.endSession();
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

    const [reports, count] = await Promise.all([
      Report.find(where)
        .populate({ path: 'reporter', select: 'firstName lastName email' })
        .populate({ path: 'reportedUser', select: 'firstName lastName email status' })
        .populate({ path: 'ride', select: 'from to' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Report.countDocuments(where),
    ]);
    return res.json({ reports, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

async function getReportDetail(req, res, next) {
  try {
    const report = await Report.findById(req.params.id)
      .populate({ path: 'reporter', select: 'firstName lastName email phone' })
      .populate({ path: 'reportedUser', select: 'firstName lastName email phone status' })
      .populate({ path: 'handledByAdmin', select: 'firstName lastName' })
      .populate('ride');
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

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Signalement introuvable.' });

    const updates = { status };
    if (adminNote !== undefined) updates.adminNote = adminNote;
    updates.handledBy = req.user.id;
    updates.resolvedAt = ['resolved', 'rejected'].includes(status) ? new Date() : null;

    report.set(updates);
    await report.save();
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

    const [logs, count] = await Promise.all([
      AdminLog.find(where)
        .populate({ path: 'admin', select: 'firstName lastName email' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AdminLog.countDocuments(where),
    ]);
    return res.json({ logs, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) { return next(err); }
}

// ── Vérification d'identité (KYC) ──
async function listPendingKyc(req, res, next) {
  try {
    const users = await User.find({ kycStatus: 'pending' })
      .select('firstName lastName email photo kycSelfie cinDoc kycStatus createdAt')
      .sort({ updatedAt: -1 });
    return res.json({ users });
  } catch (err) { return next(err); }
}

async function approveKyc(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    user.set({ kycStatus: 'approved' });
    await user.save();
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const { reason } = req.body;
    user.set({ kycStatus: 'rejected', kycSelfie: null });
    await user.save();
    createNotification(user.id, {
      type: 'system',
      title: 'Vérification d\'identité refusée',
      message: reason || 'Votre vérification d\'identité a été refusée. Veuillez soumettre des documents valides et lisibles.',
      link: '/profile',
    });
    return res.json({ message: 'Identité refusée.' });
  } catch (err) { return next(err); }
}

module.exports = {
  getDashboard, getCharts,
  listUsers, getUserDetail, suspendUser, banUser, reactivateUser, deleteUser, changeUserRole,
  listRides, getRideDetail, cancelRide, deleteRide,
  listReports, getReportDetail, updateReportStatus,
  listAdminLogs,
  listPendingKyc, approveKyc, rejectKyc,
};
