const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Anti-spam : un utilisateur ne peut pas inonder le système de signalements.
const createReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de signalements envoyés. Réessayez plus tard.' },
});

router.post('/', authenticateToken, createReportLimiter, reportController.createReport);

module.exports = router;
