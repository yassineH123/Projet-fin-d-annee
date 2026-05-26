const { Story, User } = require('../models');
const { Op } = require('sequelize');

async function create(req, res, next) {
  try {
    const { caption } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Média requis.' });
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const mediaUrl = `/uploads/${req.file.filename}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const story = await Story.create({ userId: req.user.id, mediaUrl, mediaType, caption, expiresAt });
    return res.status(201).json({ story });
  } catch (err) { return next(err); }
}

async function getActive(req, res, next) {
  try {
    const stories = await Story.findAll({
      where: { expiresAt: { [Op.gt]: new Date() } },
      include: [{ model: User, as: 'author', attributes: ['id','firstName','lastName','photo'] }],
      order: [['createdAt','DESC']],
    });
    // Group by user
    const grouped = {};
    stories.forEach(s => {
      const uid = s.userId;
      if (!grouped[uid]) grouped[uid] = { user: s.author, stories: [] };
      grouped[uid].stories.push(s);
    });
    return res.json({ groups: Object.values(grouped) });
  } catch (err) { return next(err); }
}

async function view(req, res, next) {
  try {
    await Story.increment('views', { where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    const story = await Story.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!story) return res.status(404).json({ message: 'Story introuvable.' });
    await story.destroy();
    return res.json({ message: 'Story supprimée.' });
  } catch (err) { return next(err); }
}

module.exports = { create, getActive, view, remove };
