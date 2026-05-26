const { Event, User } = require('../models');
const { Op } = require('sequelize');

async function create(req, res, next) {
  try {
    const { title, description, city, address, eventDate, category } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const event = await Event.create({ creatorId: req.user.id, title, description, city, address, eventDate, category: category || 'autre', photo });
    return res.status(201).json({ event });
  } catch (err) { return next(err); }
}

async function getAll(req, res, next) {
  try {
    const { city, category } = req.query;
    const where = { eventDate: { [Op.gte]: new Date() } };
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (category) where.category = category;
    const events = await Event.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id','firstName','lastName','photo'] }],
      order: [['eventDate','ASC']],
    });
    return res.json({ events });
  } catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id','firstName','lastName','photo'] }],
    });
    if (!event) return res.status(404).json({ message: 'Événement introuvable.' });
    return res.json({ event });
  } catch (err) { return next(err); }
}

async function attend(req, res, next) {
  try {
    await Event.increment('attendees', { where: { id: req.params.id } });
    return res.json({ message: 'Participation enregistrée.' });
  } catch (err) { return next(err); }
}

module.exports = { create, getAll, getOne, attend };
