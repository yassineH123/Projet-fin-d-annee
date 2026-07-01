const { Group, GroupMember, User } = require('../models');

async function create(req, res, next) {
  try {
    const { name, description, from, to, isPrivate } = req.body;
    const group = await Group.create({ name, description, from, to, isPrivate: !!isPrivate, creatorId: req.user.id });
    await GroupMember.create({ groupId: group.id, userId: req.user.id, role: 'admin' });
    return res.status(201).json({ group });
  } catch (err) { return next(err); }
}

async function getAll(req, res, next) {
  try {
    const groups = await Group.find({})
      .populate({ path: 'creator', select: 'id firstName lastName photo' })
      .sort({ createdAt: -1 });
    return res.json({ groups });
  } catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try {
    const group = await Group.findById(req.params.id)
      .populate({ path: 'creator', select: 'id firstName lastName photo' })
      .populate({
        path: 'members',
        populate: { path: 'user', select: 'id firstName lastName photo avgRating' },
      });
    if (!group) return res.status(404).json({ message: 'Groupe introuvable.' });
    return res.json({ group });
  } catch (err) { return next(err); }
}

async function join(req, res, next) {
  try {
    const existing = await GroupMember.findOne({ groupId: req.params.id, userId: req.user.id });
    if (existing) return res.status(409).json({ message: 'Déjà membre.' });
    await GroupMember.create({ groupId: req.params.id, userId: req.user.id });
    await Group.findByIdAndUpdate(req.params.id, { $inc: { memberCount: 1 } });
    return res.json({ message: 'Rejoint le groupe.' });
  } catch (err) { return next(err); }
}

async function leave(req, res, next) {
  try {
    const member = await GroupMember.findOne({ groupId: req.params.id, userId: req.user.id });
    if (!member) return res.status(404).json({ message: 'Non membre.' });
    await member.deleteOne();
    await Group.findByIdAndUpdate(req.params.id, { $inc: { memberCount: -1 } });
    return res.json({ message: 'Groupe quitté.' });
  } catch (err) { return next(err); }
}

async function getMyGroups(req, res, next) {
  try {
    const memberships = await GroupMember.find({ userId: req.user.id })
      .populate({ path: 'group' });
    return res.json({ groups: memberships.map(m => m.group) });
  } catch (err) { return next(err); }
}

module.exports = { create, getAll, getOne, join, leave, getMyGroups };
