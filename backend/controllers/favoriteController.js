const { FavoriteRide } = require('../models');

async function toggle(req, res, next) {
  try {
    const { rideId } = req.params;
    const existing = await FavoriteRide.findOne({ userId: req.user.id, rideId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ favorited: false });
    }
    await FavoriteRide.create({ userId: req.user.id, rideId });
    return res.json({ favorited: true });
  } catch (err) { return next(err); }
}

async function getMine(req, res, next) {
  try {
    const favs = await FavoriteRide.find({ userId: req.user.id })
      .populate({ path: 'ride', populate: { path: 'driver', select: 'id firstName lastName photo avgRating' } })
      .sort({ createdAt: -1 });
    return res.json({ favorites: favs.map(f => f.ride).filter(Boolean) });
  } catch (err) { return next(err); }
}

async function check(req, res, next) {
  try {
    const fav = await FavoriteRide.findOne({ userId: req.user.id, rideId: req.params.rideId });
    return res.json({ favorited: !!fav });
  } catch (err) { return next(err); }
}

module.exports = { toggle, getMine, check };
