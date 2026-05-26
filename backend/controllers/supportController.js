const { SupportTicket, User } = require('../models');

async function create(req, res, next) {
  try {
    const { subject, category, message } = req.body;
    const ticket = await SupportTicket.create({ userId: req.user.id, subject, category: category || 'autre', message });
    return res.status(201).json({ ticket });
  } catch (err) { return next(err); }
}

async function getMine(req, res, next) {
  try {
    const tickets = await SupportTicket.findAll({ where: { userId: req.user.id }, order: [['createdAt','DESC']] });
    return res.json({ tickets });
  } catch (err) { return next(err); }
}

async function getAll(req, res, next) {
  try {
    const tickets = await SupportTicket.findAll({
      include: [{ model: User, as: 'user', attributes: ['id','firstName','lastName','email','photo'] }],
      order: [['createdAt','DESC']],
    });
    return res.json({ tickets });
  } catch (err) { return next(err); }
}

async function reply(req, res, next) {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable.' });
    await ticket.update({ adminReply: req.body.reply, status: 'resolved', repliedAt: new Date() });
    return res.json({ ticket });
  } catch (err) { return next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable.' });
    await ticket.update({ status: req.body.status });
    return res.json({ ticket });
  } catch (err) { return next(err); }
}

module.exports = { create, getMine, getAll, reply, updateStatus };
