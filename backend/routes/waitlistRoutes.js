const express = require('express');
const ctrl = require('../controllers/waitlistController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/:rideId/join',  authenticateToken, ctrl.join);
router.post('/:rideId/leave', authenticateToken, ctrl.leave);
router.get('/:rideId',        authenticateToken, ctrl.getForRide);
router.get('/me/list',        authenticateToken, ctrl.getMyWaitlist);

module.exports = router;
