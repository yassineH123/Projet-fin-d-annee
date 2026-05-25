const { Report, User } = require('../models');

async function create(req, res, next) {
  try {
    const { reportedId, rideId, reason, description } = req.body;
    if (reportedId === req.user.id)
      return res.status(400).json({ message: 'Vous ne pouvez pas vous signaler vous-même.' });

    const report = await Report.create({
      reporterId: req.user.id,
      reportedId,
      rideId: rideId || null,
      reason,
      description,
    });
    return res.status(201).json({ report });
  } catch (err) { return next(err); }
}

async function getAll(req, res, next) {
  try {
    const reports = await Report.findAll({
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName', 'photo'] },
        { model: User, as: 'reported', attributes: ['id', 'firstName', 'lastName', 'photo'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ reports });
  } catch (err) { return next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: 'Signalement introuvable.' });
    await report.update({ status: req.body.status });
    return res.json({ report });
  } catch (err) { return next(err); }
}

module.exports = { create, getAll, updateStatus };
