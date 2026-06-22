const { Review, User, Booking, Ride } = require('../models');

async function create(req, res, next) {
  try {
    const { reviewedId, rideId, rating, comment, type,
            punctuality, driving, communication, cleanliness } = req.body;

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

    const review = await Review.create({
      reviewerId: req.user.id, reviewedId, rideId, rating, comment, type,
      punctuality:   punctuality   || null,
      driving:       driving       || null,
      communication: communication || null,
      cleanliness:   cleanliness   || null,
    });

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

// L'utilisateur noté répond à un avis le concernant
async function respond(req, res, next) {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) return res.status(400).json({ message: 'Réponse vide.' });
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Avis introuvable.' });
    if (review.reviewedId !== req.user.id) return res.status(403).json({ message: 'Vous ne pouvez répondre qu\'aux avis vous concernant.' });
    await review.update({ response: response.trim() });
    return res.json({ message: 'Réponse publiée.', review });
  } catch (err) { return next(err); }
}

module.exports = { create, getUserReviews, respond };
