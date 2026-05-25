const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/user/:userId', reviewController.getUserReviews);

router.post('/',
  authenticateToken,
  [
    body('reviewedId').notEmpty().withMessage('ID utilisateur noté requis.'),
    body('rideId').notEmpty().withMessage('ID trajet requis.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5.'),
    body('type').isIn(['driver', 'passenger']).withMessage('Type invalide.'),
  ],
  reviewController.create
);

module.exports = router;
