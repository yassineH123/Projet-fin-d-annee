const { Op } = require('sequelize');
const sequelize = require('../database');
const { User, Ride, Booking, Review, Transaction } = require('../models');

const BADGE_RULES = [
  { id: 'first_ride',    label: 'Premier trajet',      emoji: '🚀', check: (u) => u.totalTrips >= 1 },
  { id: 'trusted',       label: 'Conducteur vérifié',  emoji: '✅', check: (u) => u.driverVerified },
  { id: 'top_rated',     label: 'Top noté',            emoji: '⭐', check: (u) => u.avgRating >= 4.8 && u.totalRatings >= 5 },
  { id: 'veteran',       label: 'Vétéran (50 trajets)',emoji: '🏆', check: (u) => u.totalTrips >= 50 },
  { id: 'eco_warrior',   label: 'Éco-guerrier',        emoji: '🌿', check: (u) => u.totalTrips >= 20 },
  { id: 'ambassador',    label: 'Ambassadeur',          emoji: '🇲🇦', check: (u) => (u.totalKm || 0) >= 1000 },
];

function computeLevel(totalTrips) {
  if (totalTrips >= 100) return 'diamant';
  if (totalTrips >= 50)  return 'platine';
  if (totalTrips >= 25)  return 'or';
  if (totalTrips >= 10)  return 'argent';
  return 'bronze';
}

async function assignBadges(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;
    const current = user.badges || [];
    const earned = BADGE_RULES.filter(r => r.check(user) && !current.find(b => b.id === r.id))
      .map(r => ({ id: r.id, label: r.label, emoji: r.emoji, earnedAt: new Date() }));
    if (earned.length > 0) {
      await user.update({ badges: [...current, ...earned] });
    }
    const newLevel = computeLevel(user.totalTrips);
    if (user.level !== newLevel) await user.update({ level: newLevel });
  } catch (_) {}
}

async function getDriverStats(req, res, next) {
  try {
    const driverId = req.user.id;
    const [rides, bookings, reviews] = await Promise.all([
      Ride.findAll({ where: { driverId } }),
      Booking.findAll({
        include: [{ model: Ride, as: 'ride', where: { driverId }, attributes: ['price', 'distanceKm'] }],
        where: { status: 'accepted' },
      }),
      Review.findAll({ where: { reviewedId: driverId, type: 'driver' } }),
    ]);

    const totalEarnings = bookings.reduce((s, b) => s + parseFloat(b.ride.price || 0), 0);
    const totalKm = rides.reduce((s, r) => s + (r.distanceKm || 0), 0);
    const co2Saved = Math.round(totalKm * 0.12);

    const ratingByMonth = {};
    reviews.forEach(r => {
      const m = new Date(r.createdAt).toISOString().slice(0, 7);
      if (!ratingByMonth[m]) ratingByMonth[m] = { sum: 0, count: 0 };
      ratingByMonth[m].sum += r.rating;
      ratingByMonth[m].count++;
    });
    const ratingEvolution = Object.entries(ratingByMonth)
      .map(([month, { sum, count }]) => ({ month, avg: Math.round((sum / count) * 10) / 10 }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    const user = await User.findByPk(driverId, { attributes: ['totalTrips', 'avgRating', 'level', 'badges', 'totalKm'] });

    return res.json({
      totalTrips: user.totalTrips,
      totalEarnings: Math.round(totalEarnings),
      totalKm: user.totalKm || totalKm,
      co2Saved,
      avgRating: user.avgRating,
      level: user.level,
      badges: user.badges || [],
      ratingEvolution,
      activeRides: rides.filter(r => r.status === 'active').length,
    });
  } catch (err) { return next(err); }
}

async function getLeaderboard(req, res, next) {
  try {
    const { type = 'rating' } = req.query;
    const order = type === 'trips'
      ? [['totalTrips', 'DESC']]
      : type === 'km'
      ? [['totalKm', 'DESC']]
      : [['avgRating', 'DESC'], ['totalRatings', 'DESC']];

    const drivers = await User.findAll({
      where: { isDriver: true, totalTrips: { [Op.gt]: 0 } },
      attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating', 'totalRatings', 'totalTrips', 'totalKm', 'level', 'badges'],
      order,
      limit: 20,
    });
    return res.json({ drivers });
  } catch (err) { return next(err); }
}

module.exports = { getDriverStats, getLeaderboard, assignBadges, computeLevel };
