const express = require('express');
const ctrl = require('../controllers/loginHistoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authenticateToken, ctrl.getMine);

module.exports = router;
