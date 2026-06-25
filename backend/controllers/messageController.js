const { Conversation, ConversationMember, Message, User } = require('../models');
const { getIO } = require('../socket');

const USER_ATTRS = 'id firstName lastName photo';

/* ── helpers ─────────────────────────────────────────────────── */
function isMember(conv, userId) {
  return conv.participant1Id === userId || conv.participant2Id === userId;
}

async function isGroupMember(conversationId, userId) {
  return !!(await ConversationMember.findOne({ conversationId, userId }));
}

/* ── unread count ─────────────────────────────────────────────── */
async function unreadCount(req, res, next) {
  try {
    const userId = req.user.id;
    const directConvs = await Conversation.find({
      $or: [{ participant1Id: userId }, { participant2Id: userId }],
    }).select('_id');
    const groupConvs = await ConversationMember.find({ userId }).select('conversationId');
    const convIds = [
      ...directConvs.map(c => c.id),
      ...groupConvs.map(c => c.conversationId),
    ];
    const count = convIds.length
      ? await Message.countDocuments({ conversationId: { $in: convIds }, senderId: { $ne: userId }, read: false })
      : 0;
    return res.json({ count });
  } catch (err) { return next(err); }
}

/* ── list conversations ───────────────────────────────────────── */
async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;

    const direct = await Conversation.find({
      type: 'direct', $or: [{ participant1Id: userId }, { participant2Id: userId }],
    })
      .populate({ path: 'participant1', select: USER_ATTRS })
      .populate({ path: 'participant2', select: USER_ATTRS })
      .sort({ lastMessageAt: -1 });

    const memberships = await ConversationMember.find({ userId }).select('conversationId');
    const groupIds = memberships.map(m => m.conversationId);
    const groups = groupIds.length ? await Conversation.find({
      _id: { $in: groupIds }, type: 'group',
    })
      .populate({ path: 'members', populate: { path: 'user', select: USER_ATTRS } })
      .sort({ lastMessageAt: -1 }) : [];

    let conversations = [...direct, ...groups];

    // `separate: true` last-message preview (équivalent : 1 message le plus
    // récent par conversation, attaché en tant qu'array `messages` de 0 ou 1 élément).
    await Promise.all(conversations.map(async (conv) => {
      const msg = await Message.findOne({ conversationId: conv.id }).sort({ createdAt: -1 });
      conv.messages = msg ? [msg] : [];
    }));

    conversations.sort(
      (a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt)
    );
    return res.json({ conversations });
  } catch (err) { return next(err); }
}

/* ── get messages ─────────────────────────────────────────────── */
async function getMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const conv = await Conversation.findById(req.params.conversationId);
    if (!conv) return res.status(404).json({ message: 'Conversation introuvable.' });

    const allowed = conv.type === 'group'
      ? await isGroupMember(conv.id, userId)
      : isMember(conv, userId);
    if (!allowed) return res.status(403).json({ message: 'Accès refusé.' });

    const messages = await Message.find({ conversationId: conv.id })
      .populate({ path: 'sender', select: USER_ATTRS })
      .sort({ createdAt: 1 });

    if (req.query.markRead !== 'false') {
      await Message.updateMany(
        { conversationId: conv.id, senderId: { $ne: userId }, read: false },
        { read: true }
      );
    }
    return res.json({ messages });
  } catch (err) { return next(err); }
}

/* ── send message ─────────────────────────────────────────────── */
async function sendMessage(req, res, next) {
  try {
    const { receiverId, content, rideId, conversationId: convId } = req.body;
    const senderId = req.user.id;

    let conv;

    if (convId) {
      // Sending to an existing group conversation
      conv = await Conversation.findById(convId);
      if (!conv) return res.status(404).json({ message: 'Conversation introuvable.' });
      const allowed = conv.type === 'group'
        ? await isGroupMember(conv.id, senderId)
        : isMember(conv, senderId);
      if (!allowed) return res.status(403).json({ message: 'Accès refusé.' });
    } else {
      if (!receiverId) return res.status(400).json({ message: 'receiverId requis.' });
      if (senderId === receiverId) return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer un message.' });

      conv = await Conversation.findOne({
        type: 'direct',
        $or: [
          { participant1Id: senderId, participant2Id: receiverId },
          { participant1Id: receiverId, participant2Id: senderId },
        ],
      });
      if (!conv) conv = await Conversation.create({ participant1Id: senderId, participant2Id: receiverId, rideId, type: 'direct' });
    }

    const message = await Message.create({ conversationId: conv.id, senderId, content });
    conv.set({ lastMessageAt: new Date() });
    await conv.save();

    const fullMsg = await Message.findById(message.id)
      .populate({ path: 'sender', select: USER_ATTRS });

    const io = getIO();
    if (io) io.to(`conv:${conv.id}`).emit('new_message', { message: fullMsg, conversationId: conv.id });

    return res.status(201).json({ message: fullMsg, conversationId: conv.id });
  } catch (err) { return next(err); }
}

/* ── react to message ─────────────────────────────────────────── */
async function reactToMessage(req, res, next) {
  try {
    const { emoji } = req.body;
    const userId = req.user.id;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message introuvable.' });

    const reactions = Array.isArray(msg.reactions) ? [...msg.reactions] : [];
    const idx = reactions.findIndex(r => r.userId === userId && r.emoji === emoji);
    if (idx >= 0) {
      reactions.splice(idx, 1); // toggle off
    } else {
      reactions.push({ userId, emoji });
    }
    msg.set({ reactions });
    await msg.save();

    const io = getIO();
    if (io) io.to(`conv:${msg.conversationId}`).emit('message_reaction', { messageId: msg.id, reactions });

    return res.json({ reactions });
  } catch (err) { return next(err); }
}

/* ── create group conversation ────────────────────────────────── */
async function createGroup(req, res, next) {
  try {
    const { name, memberIds, rideId } = req.body;
    if (!name || !memberIds?.length) return res.status(400).json({ message: 'Nom et membres requis.' });

    const conv = await Conversation.create({ type: 'group', name, rideId: rideId || null, participant1Id: req.user.id, participant2Id: req.user.id });
    const allIds = [...new Set([req.user.id, ...memberIds])];
    await ConversationMember.insertMany(
      allIds.map(uid => ({ conversationId: conv.id, userId: uid, role: uid === req.user.id ? 'admin' : 'member' }))
    );
    return res.status(201).json({ conversation: conv });
  } catch (err) { return next(err); }
}

module.exports = { getConversations, getMessages, sendMessage, unreadCount, reactToMessage, createGroup };
