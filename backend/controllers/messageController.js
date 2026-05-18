const { Op } = require('sequelize');
const { Conversation, Message, User } = require('../models');

async function unreadCount(req, res, next) {
  try {
    const userId = req.user.id;
    const convs = await Conversation.findAll({
      where: { [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }] },
      attributes: ['id'],
    });
    const convIds = convs.map(c => c.id);
    const count = convIds.length
      ? await Message.count({ where: { conversationId: { [Op.in]: convIds }, senderId: { [Op.ne]: userId }, read: false } })
      : 0;
    return res.json({ count });
  } catch (err) { return next(err); }
}

async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: [
        { model: User, as: 'participant1', attributes: ['id', 'firstName', 'lastName', 'photo'] },
        { model: User, as: 'participant2', attributes: ['id', 'firstName', 'lastName', 'photo'] },
        { model: Message, as: 'messages', limit: 1, order: [['createdAt', 'DESC']], separate: true },
      ],
      order: [['lastMessageAt', 'DESC']],
    });
    return res.json({ conversations });
  } catch (err) { return next(err); }
}

async function getMessages(req, res, next) {
  try {
    const conv = await Conversation.findByPk(req.params.conversationId);
    if (!conv) return res.status(404).json({ message: 'Conversation introuvable.' });
    if (conv.participant1Id !== req.user.id && conv.participant2Id !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const messages = await Message.findAll({
      where: { conversationId: req.params.conversationId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'photo'] }],
      order: [['createdAt', 'ASC']],
    });

    // Ne marquer comme lu que si le client le demande explicitement (premier chargement)
    if (req.query.markRead !== 'false') {
      await Message.update(
        { read: true },
        { where: { conversationId: req.params.conversationId, senderId: { [Op.ne]: req.user.id } } }
      );
    }

    return res.json({ messages });
  } catch (err) { return next(err); }
}

async function sendMessage(req, res, next) {
  try {
    const { receiverId, content, rideId } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer un message à vous-même.' });
    }

    let conv = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id: senderId, participant2Id: receiverId },
          { participant1Id: receiverId, participant2Id: senderId },
        ],
      },
    });

    if (!conv) {
      conv = await Conversation.create({ participant1Id: senderId, participant2Id: receiverId, rideId });
    }

    const message = await Message.create({ conversationId: conv.id, senderId, content });
    await conv.update({ lastMessageAt: new Date() });

    return res.status(201).json({ message, conversationId: conv.id });
  } catch (err) { return next(err); }
}

module.exports = { getConversations, getMessages, sendMessage, unreadCount };
