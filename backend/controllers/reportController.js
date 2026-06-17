const { User, Ride, Report } = require('../models');

const ALLOWED_REASONS = ['comportement', 'fraude', 'securite', 'contenu_inapproprie', 'trajet_suspect', 'autre'];

async function createReport(req, res, next) {
  try {
    let { reportedUserId, rideId, reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Motif requis.' });
    }
    if (!ALLOWED_REASONS.includes(reason)) {
      return res.status(400).json({ message: 'Motif invalide.' });
    }
    if (!reportedUserId && !rideId) {
      return res.status(400).json({ message: 'Utilisateur ou trajet à signaler requis.' });
    }

    let ride = null;
    if (rideId) {
      ride = await Ride.findByPk(rideId);
      if (!ride) return res.status(404).json({ message: 'Trajet introuvable.' });
      // Un signalement de trajet vise implicitement son conducteur.
      if (!reportedUserId) reportedUserId = ride.driverId;
    }

    if (reportedUserId === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous signaler vous-même.' });
    }

    const reportedUser = await User.findByPk(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'Utilisateur signalé introuvable.' });
    }

    const report = await Report.create({
      reporterId: req.user.id,
      reportedUserId,
      rideId: rideId || null,
      reason,
      description: description?.trim() || null,
    });

    return res.status(201).json({ message: 'Signalement envoyé. Notre équipe va l\'examiner.', report });
  } catch (err) { return next(err); }
}

module.exports = { createReport };
