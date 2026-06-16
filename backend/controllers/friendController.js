const { Op } = require('sequelize');
const { Friendship, User } = require('../models');
const { createNotification } = require('../services/notificationService');

async function sendRequest(req, res, next) {
  try {
    const requesterId = req.user.id;
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: 'receiverId requis.' });
    if (requesterId === receiverId) return res.status(400).json({ message: 'Vous ne pouvez pas vous ajouter vous-même.' });

    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });
    if (existing) return res.status(409).json({ message: 'Demande déjà envoyée ou amis.', status: existing.status, id: existing.id });

    const friendship = await Friendship.create({ requesterId, receiverId });

    const requester = await User.findByPk(requesterId, { attributes: ['firstName', 'lastName'] });
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
    const friendship = await Friendship.findByPk(req.params.id);
    if (!friendship) return res.status(404).json({ message: 'Demande introuvable.' });
    if (friendship.receiverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    await friendship.update({ status: 'accepted' });

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
    const friendship = await Friendship.findByPk(req.params.id);
    if (!friendship) return res.status(404).json({ message: 'Demande introuvable.' });
    if (friendship.receiverId !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    await friendship.destroy();
    return res.json({ message: 'Demande refusée.' });
  } catch (err) { return next(err); }
}

async function removeFriend(req, res, next) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;
    await Friendship.destroy({
      where: {
        [Op.or]: [
          { requesterId: userId, receiverId: friendId },
          { requesterId: friendId, receiverId: userId },
        ],
        status: 'accepted',
      },
    });
    return res.json({ message: 'Ami supprimé.' });
  } catch (err) { return next(err); }
}

async function getFriends(req, res, next) {
  try {
    const userId = req.user.id;
    const friendships = await Friendship.findAll({
      where: { [Op.or]: [{ requesterId: userId }, { receiverId: userId }], status: 'accepted' },
    });
    const friendIds = friendships.map(f => f.requesterId === userId ? f.receiverId : f.requesterId);
    const friends = await User.findAll({
      where: { id: friendIds },
      attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating', 'totalTrips', 'isDriver', 'availabilityStatus', 'driverVerified'],
    });
    return res.json({ friends });
  } catch (err) { return next(err); }
}

async function getRequests(req, res, next) {
  try {
    const requests = await Friendship.findAll({
      where: { receiverId: req.user.id, status: 'pending' },
      include: [{ model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ requests });
  } catch (err) { return next(err); }
}

async function getStatus(req, res, next) {
  try {
    const userId   = req.user.id;
    const targetId = req.params.userId;
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId: userId, receiverId: targetId },
          { requesterId: targetId, receiverId: userId },
        ],
      },
    });
    if (!friendship) return res.json({ status: 'none' });
    return res.json({ status: friendship.status, id: friendship.id, isMine: friendship.requesterId === userId });
  } catch (err) { return next(err); }
}

async function getMutual(req, res, next) {
  try {
    const getIds = async (uid) => {
      const fs = await Friendship.findAll({
        where: { [Op.or]: [{ requesterId: uid }, { receiverId: uid }], status: 'accepted' },
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
    const count = await Friendship.count({ where: { receiverId: req.user.id, status: 'pending' } });
    return res.json({ count });
  } catch (err) { return next(err); }
}

module.exports = { sendRequest, accept, refuse, removeFriend, getFriends, getRequests, getStatus, getMutual, pendingCount };