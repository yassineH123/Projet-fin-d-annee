const express = require('express');
const ctrl = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Le webhook Stripe (/wallet/stripe/webhook) est enregistré directement dans
// backend/index.js, avant express.json(), pour recevoir le body brut requis par
// la vérification de signature — il n'est donc pas redéfini ici.

router.get('/',                    authenticateToken, ctrl.getBalance);
router.post('/topup',              authenticateToken, ctrl.topUp);
router.post('/stripe/checkout',    authenticateToken, ctrl.stripeCheckout);
router.get('/transactions',        authenticateToken, ctrl.getTransactions);

module.exports = router;
