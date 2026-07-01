const { Event, User } = require('../models');

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
    const where = { eventDate: { $gte: new Date() } };
    if (city) where.city = { $regex: city, $options: 'i' };
    if (category) where.category = category;
    const events = await Event.find(where)
      .populate({ path: 'creator', select: 'id firstName lastName photo' })
      .sort({ eventDate: 1 });
    return res.json({ events });
  } catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try {
    const event = await Event.findById(req.params.id)
      .populate({ path: 'creator', select: 'id firstName lastName photo' });
    if (!event) return res.status(404).json({ message: 'Événement introuvable.' });
    return res.json({ event });
  } catch (err) { return next(err); }
}

async function attend(req, res, next) {
  try {
    await Event.findByIdAndUpdate(req.params.id, { $inc: { attendees: 1 } });
    return res.json({ message: 'Participation enregistrée.' });
  } catch (err) { return next(err); }
}

module.exports = { create, getAll, getOne, attend };
