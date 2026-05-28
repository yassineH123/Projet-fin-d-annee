const express = require('express');
const ctrl = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Stripe webhook doit recevoir le raw body — à placer avant express.json()
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), ctrl.stripeWebhook);

router.get('/',                    authenticateToken, ctrl.getBalance);
router.post('/topup',              authenticateToken, ctrl.topUp);
router.post('/stripe/checkout',    authenticateToken, ctrl.stripeCheckout);
router.get('/transactions',        authenticateToken, ctrl.getTransactions);

module.exports = router;
