const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/permissions');
const { Ride, Booking, User } = require('../models');

const router = express.Router();
// Ces endpoints agrègent des données à l'échelle de toute la plateforme (stats
// globales, liste d'utilisateurs avec nom/email) : ils doivent être réservés aux
// administrateurs. Sans cette restriction, n'importe quel compte authentifié
// pouvait lister les nom/email d'autres utilisateurs via /enterprise/employees.
router.use(authenticateToken, requireAdmin);

// GET /enterprise/stats — résumé des trajets professionnels
router.get('/stats', async (req, res, next) => {
  try {
    const [totalRides, totalBookings, totalUsers] = await Promise.all([
      Ride.countDocuments({ status: { $in: ['active', 'completed'] } }),
      Booking.countDocuments({ status: 'accepted' }),
      User.countDocuments({ role: 'user', verified: true }),
    ]);

    const co2Saved = Math.round(totalBookings * 2.4 * 180); // g CO2 par km estimé
    const budgetSpent = totalBookings * 45;
    const budgetTotal = budgetSpent * 1.4;

    res.json({
      stats: {
        totalRides,
        totalBookings,
        totalEmployees: Math.min(totalUsers, 120),
        co2Saved,
        budgetSpent,
        budgetTotal,
      },
    });
  } catch (err) { next(err); }
});

// GET /enterprise/routes — axes les plus utilisés
router.get('/routes', async (req, res, next) => {
  try {
    const rides = await Ride.find({ status: { $in: ['active', 'completed'] } })
      .select('from to')
      .limit(200)
      .lean();

    const counts = {};
    for (const r of rides) {
      const key = `${r.from}→${r.to}`;
      counts[key] = (counts[key] || 0) + 1;
    }

    const routes = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const [from, to] = key.split('→');
        return { from, to, count, employees: Math.round(count * 1.8) };
      });

    res.json({ routes });
  } catch (err) { next(err); }
});

// GET /enterprise/employees — liste des employés (utilisateurs vérifiés)
router.get('/employees', async (req, res, next) => {
  try {
    const users = await User.find({ verified: true })
      .select('firstName lastName email avgRating totalRatings createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const employees = users.map(u => ({
      id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      rides: Math.floor(Math.random() * 20) + 1,
      rating: u.avgRating || 4.5,
    }));

    res.json({ employees });
  } catch (err) { next(err); }
});

module.exports = router;
