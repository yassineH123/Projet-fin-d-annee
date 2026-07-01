const { Friendship, User } = require('../models');
const { createNotification } = require('../services/notificationService');
const { isAdmin, isOwner } = require('../middleware/permissions');

async function sendRequest(req, res, next) {
  try {
    const requesterId = req.user.id;
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: 'receiverId requis.' });
    if (requesterId === receiverId) return res.status(400).json({ message: 'Vous ne pouvez pas vous ajouter vous-même.' });

    if (isAdmin(req.user)) {
      return res.status(403).json({ message: 'Les administrateurs ne peuvent pas avoir d\'amis.' });
    }
    const receiver = await User.findById(receiverId).select('id role');
    if (!receiver) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (isAdmin(receiver)) {
      return res.status(403).json({ message: 'Impossible d\'envoyer une demande d\'ami à un administrateur.' });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });
    if (existing) return res.status(409).json({ message: 'Demande déjà envoyée ou amis.', status: existing.status, id: existing.id });

    const friendship = await Friendship.create({ requesterId, receiverId });

    const requester = await User.findById(requesterId).select('firstName lastName');
    createNotification(receiverId, {
      type: 'system',
      title: "Nouvelle demande d'ami",
      message: `${requester.firstName} ${requester.lastName} vous a envoyé une demande d'ami`,
      link: '/friends',
    });

    return res.status(201).json({ friendship });
  } catch (err) { return next(err); }
}

async function accept(req, res, next) {
  try {
    const friendship = await Friendship.findById(req.params.id);
    if (!friendship) return res.status(404).json({ message: 'Demande introuvable.' });
    if (!isOwner(req.user, friendship.receiverId)) return res.status(403).json({ message: 'Accès refusé.' });
    friendship.set({ status: 'accepted' });
    await friendship.save();

    createNotification(friendship.requesterId, {
      type: 'system',
      title: "Demande d'ami acceptée ✅",
      message: "Votre demande d'ami a été acceptée !",
      link: '/friends',
    });
    return res.json({ friendship });
  } catch (err) { return next(err); }
}

async function refuse(req, res, next) {
  try {
    const friendship = await Friendship.findById(req.params.id);
    if (!friendship) return res.status(404).json({ message: 'Demande introuvable.' });
    if (!isOwner(req.user, friendship.receiverId)) return res.status(403).json({ message: 'Accès refusé.' });
    await friendship.deleteOne();
    return res.json({ message: 'Demande refusée.' });
  } catch (err) { return next(err); }
}

async function removeFriend(req, res, next) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;
    await Friendship.deleteMany({
      $or: [
        { requesterId: userId, receiverId: friendId },
        { requesterId: friendId, receiverId: userId },
      ],
      status: 'accepted',
    });
    return res.json({ message: 'Ami supprimé.' });
  } catch (err) { return next(err); }
}

async function getFriends(req, res, next) {
  try {
    const userId = req.user.id;
    const friendships = await Friendship.find({
      $or: [{ requesterId: userId }, { receiverId: userId }], status: 'accepted',
    });
    const friendIds = friendships.map(f => f.requesterId === userId ? f.receiverId : f.requesterId);
    const friends = await User.find({ _id: { $in: friendIds } })
      .select('id firstName lastName photo avgRating totalTrips isDriver availabilityStatus driverVerified');
    return res.json({ friends });
  } catch (err) { return next(err); }
}

async function getRequests(req, res, next) {
  try {
    const requests = await Friendship.find({ receiverId: req.user.id, status: 'pending' })
      .populate({ path: 'requester', select: 'id firstName lastName photo avgRating' })
      .sort({ createdAt: -1 });
    return res.json({ requests });
  } catch (err) { return next(err); }
}

async function getStatus(req, res, next) {
  try {
    const userId   = req.user.id;
    const targetId = req.params.userId;
    const friendship = await Friendship.findOne({
      $or: [
        { requesterId: userId, receiverId: targetId },
        { requesterId: targetId, receiverId: userId },
      ],
    });
    if (!friendship) return res.json({ status: 'none' });
    return res.json({ status: friendship.status, id: friendship.id, isMine: friendship.requesterId === userId });
  } catch (err) { return next(err); }
}

async function getMutual(req, res, next) {
  try {
    const getIds = async (uid) => {
      const fs = await Friendship.find({
        $or: [{ requesterId: uid }, { receiverId: uid }], status: 'accepted',
      });
      return fs.map(f => (f.requesterId === uid ? f.receiverId : f.requesterId));
    };
    const [mine, theirs] = await Promise.all([getIds(req.user.id), getIds(req.params.userId)]);
    const mutual = mine.filter(id => theirs.includes(id));
    return res.json({ count: mutual.length });
  } catch (err) { return next(err); }
}

async function pendingCount(req, res, next) {
  try {
    const count = await Friendship.countDocuments({ receiverId: req.user.id, status: 'pending' });
    return res.json({ count });
  } catch (err) { return next(err); }
}

module.exports = { sendRequest, accept, refuse, removeFriend, getFriends, getRequests, getStatus, getMutual, pendingCount };
