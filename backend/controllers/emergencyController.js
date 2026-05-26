const { EmergencyContact } = require('../models');

async function getMine(req, res, next) {
  try {
    const contacts = await EmergencyContact.findAll({ where: { userId: req.user.id } });
    return res.json({ contacts });
  } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { name, phone, relation } = req.body;
    const count = await EmergencyContact.count({ where: { userId: req.user.id } });
    if (count >= 3) return res.status(400).json({ message: 'Maximum 3 contacts d\'urgence.' });
    const contact = await EmergencyContact.create({ userId: req.user.id, name, phone, relation });
    return res.status(201).json({ contact });
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    const contact = await EmergencyContact.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!contact) return res.status(404).json({ message: 'Contact introuvable.' });
    await contact.destroy();
    return res.json({ message: 'Contact supprimé.' });
  } catch (err) { return next(err); }
}

module.exports = { getMine, create, remove };
