const { SupportTicket } = require('../models');

async function create(req, res, next) {
  try {
    const { subject, category, message } = req.body;
    const ticket = await SupportTicket.create({ userId: req.user.id, subject, category: category || 'autre', message });
    return res.status(201).json({ ticket });
  } catch (err) { return next(err); }
}

async function getMine(req, res, next) {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ tickets });
  } catch (err) { return next(err); }
}

async function getAll(req, res, next) {
  try {
    const tickets = await SupportTicket.find({})
      .populate({ path: 'user', select: 'id firstName lastName email photo' })
      .sort({ createdAt: -1 });
    return res.json({ tickets });
  } catch (err) { return next(err); }
}

async function reply(req, res, next) {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable.' });
    ticket.set({ adminReply: req.body.reply, status: 'resolved', repliedAt: new Date() });
    await ticket.save();
    return res.json({ ticket });
  } catch (err) { return next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable.' });
    ticket.set({ status: req.body.status });
    await ticket.save();
    return res.json({ ticket });
  } catch (err) { return next(err); }
}

module.exports = { create, getMine, getAll, reply, updateStatus };
