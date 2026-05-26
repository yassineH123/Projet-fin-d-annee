const { FavoriteRide, Ride, User } = require('../models');

async function toggle(req, res, next) {
  try {
    const { rideId } = req.params;
    const existing = await FavoriteRide.findOne({ where: { userId: req.user.id, rideId } });
    if (existing) {
      await existing.destroy();
      return res.json({ favorited: false });
    }
    await FavoriteRide.create({ userId: req.user.id, rideId });
    return res.json({ favorited: true });
  } catch (err) { return next(err); }
}

async function getMine(req, res, next) {
  try {
    const favs = await FavoriteRide.findAll({
      where: { userId: req.user.id },
      include: [{ model: Ride, as: 'ride', include: [{ model: User, as: 'driver', attributes: ['id','firstName','lastName','photo','avgRating'] }] }],
      order: [['createdAt','DESC']],
    });
    return res.json({ favorites: favs.map(f => f.ride).filter(Boolean) });
  } catch (err) { return next(err); }
}

async function check(req, res, next) {
  try {
    const fav = await FavoriteRide.findOne({ where: { userId: req.user.id, rideId: req.params.rideId } });
    return res.json({ favorited: !!fav });
  } catch (err) { return next(err); }
}

module.exports = { toggle, getMine, check };
