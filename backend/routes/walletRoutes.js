const express = require('express');
const ctrl = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/',              authenticateToken, ctrl.getBalance);
router.post('/topup',        authenticateToken, ctrl.topUp);
router.get('/transactions',  authenticateToken, ctrl.getTransactions);

module.exports = router;
