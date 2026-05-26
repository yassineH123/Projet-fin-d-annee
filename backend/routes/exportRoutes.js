const express = require('express');
const ctrl = require('../controllers/exportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/earnings',     authenticateToken, ctrl.exportDriverEarnings);
router.get('/transactions', authenticateToken, ctrl.exportTransactions);
module.exports = router;
