const express = require('express');
const ctrl = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/',              authenticateToken, ctrl.getMine);
router.post('/:rideId',      authenticateToken, ctrl.toggle);
router.get('/:rideId/check', authenticateToken, ctrl.check);
module.exports = router;
