const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const predictionController = require('../controllers/predictionController');

const router = express.Router();

router.get('/', authenticateToken, predictionController.list);

module.exports = router;
