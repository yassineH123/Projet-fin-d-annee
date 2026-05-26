const express = require('express');
const ctrl = require('../controllers/premiumController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/status',    authenticateToken, ctrl.getStatus);
router.post('/subscribe',authenticateToken, ctrl.subscribe);
module.exports = router;
