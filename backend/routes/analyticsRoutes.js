const express = require('express');
const ctrl = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/driver',      authenticateToken, ctrl.getDriverStats);
router.get('/leaderboard', ctrl.getLeaderboard);

module.exports = router;
