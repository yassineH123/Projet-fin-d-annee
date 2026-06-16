const { Review, User, Booking, Ride } = require('../models');

async function create(req, res, next) {
  try {
    const { reviewedId, rideId, rating, comment, type } = req.body;

    // Vérifier qu'une réservation acceptée existe
    if (type === 'driver') {
      const booking = await Booking.findOne({
        where: { rideId, passengerId: req.user.id, status: 'accepted' },
      });
      if (!booking) return res.status(403).json({ message: 'Vous devez avoir voyagé sur ce trajet.' });
    } else {
      const ride = await Ride.findOne({ where: { id: rideId, driverId: req.user.id } });
      if (!ride) return res.status(403).json({ message: 'Accès refusé.' });
    }

    const existing = await Review.findOne({ where: { reviewerId: req.user.id, rideId, type } });
    if (existing) return res.status(409).json({ message: 'Vous avez déjà noté cet utilisateur pour ce trajet.' });

    const review = await Review.create({ reviewerId: req.user.id, reviewedId, rideId, rating, comment, type });

    // Mettre à jour la note moyenne de l'utilisateur noté
    const reviews = await Review.findAll({ where: { reviewedId } });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.update(
      { avgRating: Math.round(avg * 10) / 10, totalRatings: reviews.length },
      { where: { id: reviewedId } }
    );

    return res.status(201).json({ review });
  } catch (err) { return next(err); }
}

async function getUserReviews(req, res, next) {
  try {
    const reviews = await Review.findAll({
      where: { reviewedId: req.params.userId },
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName', 'photo'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ reviews });
  } catch (err) { return next(err); }
}

module.exports = { create, getUserReviews };