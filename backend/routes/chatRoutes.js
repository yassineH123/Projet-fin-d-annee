const express = require('express');
const rateLimit = require('express-rate-limit');
const chatController = require('../controllers/chatController');

const router = express.Router();

// AtlasBot est volontairement accessible sans connexion (support pré-inscription).
// Un rate-limit par IP évite l'abus/la consommation excessive du LLM par ce point
// d'entrée public, sans casser l'usage anonyme existant.
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de messages envoyés. Réessayez dans quelques minutes.' },
});

router.post('/', chatLimiter, chatController.sendMessage);

module.exports = router;
