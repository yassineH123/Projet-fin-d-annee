const express = require('express');
const ctrl = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireDriver } = require('../middleware/permissions');
const router = express.Router();

// Statistiques conducteur : réservées aux comptes ayant la capacité conducteur.
router.get('/driver',      authenticateToken, requireDriver('Réservé aux conducteurs.'), ctrl.getDriverStats);
router.get('/leaderboard', ctrl.getLeaderboard);

module.exports = router;
