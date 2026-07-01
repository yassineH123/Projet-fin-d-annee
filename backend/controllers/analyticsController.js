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
    const user = await User.findById(userId);
    if (!user) return;
    const current = user.badges || [];
    const earned = BADGE_RULES.filter(r => r.check(user) && !current.find(b => b.id === r.id))
      .map(r => ({ id: r.id, label: r.label, emoji: r.emoji, earnedAt: new Date() }));
    if (earned.length > 0) {
      user.set({ badges: [...current, ...earned] });
      await user.save();
    }
    const newLevel = computeLevel(user.totalTrips);
    if (user.level !== newLevel) {
      user.set({ level: newLevel });
      await user.save();
    }
  } catch (_) {}
}

async function getDriverStats(req, res, next) {
  try {
    const driverId = req.user.id;
    const rides = await Ride.find({ driverId });
    const rideIds = rides.map(r => r.id);
    const [bookings, reviews] = await Promise.all([
      Booking.find({ rideId: { $in: rideIds }, status: 'accepted' })
        .populate({ path: 'ride', select: 'price distanceKm' }),
      Review.find({ reviewedId: driverId, type: 'driver' }),
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

    const user = await User.findById(driverId).select('totalTrips avgRating level badges totalKm');

    // ── Séries mensuelles (6 derniers mois, par date de publication) ──
    // Clé locale "YYYY-MM" sans passer par toISOString (évite le décalage de fuseau)
    const localKey = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };
    const now = new Date();
    const monthKeys = [];
    const monthLabels = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.push(key);
      monthLabels[key] = d.toLocaleDateString('fr-FR', { month: 'short' });
    }

    const tripsByMonth = Object.fromEntries(monthKeys.map(k => [k, 0]));
    const earnByMonth  = Object.fromEntries(monthKeys.map(k => [k, 0]));
    let totalSeats = 0, totalBooked = 0;
    const destCount = {};

    rides.forEach(r => {
      const key = localKey(r.createdAt);
      const booked = Math.max(0, (r.seats || 0) - (r.seatsAvailable || 0));
      totalSeats  += r.seats || 0;
      totalBooked += booked;
      destCount[r.to] = (destCount[r.to] || 0) + 1;
      if (key in tripsByMonth) {
        tripsByMonth[key] += 1;
        earnByMonth[key]  += booked * parseFloat(r.price || 0);
      }
    });

    const monthlyTrips    = monthKeys.map(k => ({ month: monthLabels[k], trips: tripsByMonth[k] }));
    const monthlyEarnings = monthKeys.map(k => ({ month: monthLabels[k], earnings: Math.round(earnByMonth[k]) }));
    const topDestinations = Object.entries(destCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const fillRate = totalSeats > 0 ? Math.round((totalBooked / totalSeats) * 100) : 0;

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
      monthlyTrips,
      monthlyEarnings,
      topDestinations,
      fillRate,
    });
  } catch (err) { return next(err); }
}

async function getLeaderboard(req, res, next) {
  try {
    const { type = 'rating' } = req.query;
    const sort = type === 'trips'
      ? { totalTrips: -1 }
      : type === 'km'
      ? { totalKm: -1 }
      : { avgRating: -1, totalRatings: -1 };

    const drivers = await User.find({ isDriver: true, totalTrips: { $gt: 0 } })
      .select('firstName lastName photo avgRating totalRatings totalTrips totalKm level badges')
      .sort(sort)
      .limit(20);
    return res.json({ drivers });
  } catch (err) { return next(err); }
}

module.exports = { getDriverStats, getLeaderboard, assignBadges, computeLevel };
