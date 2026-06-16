const express = require('express');
const { body } = require('express-validator');
const rideController = require('../controllers/rideController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/home',   rideController.homeData);
router.get('/search', rideController.search);
router.get('/mine', authenticateToken, rideController.getMine);
router.get('/:id', rideController.getOne);

router.post('/',
  authenticateToken,
  [
    body('from').trim().notEmpty().withMessage('Ville de départ requise.'),
    body('to').trim().notEmpty().withMessage('Ville d\'arrivée requise.'),
    body('departureDate').isISO8601().withMessage('Date invalide.'),
    body('price').isFloat({ min: 0 }).withMessage('Prix invalide.'),
    body('seats').isInt({ min: 1 }).withMessage('Nombre de places invalide.'),
  ],
  rideController.create
);

router.put('/:id/complete', authenticateToken, rideController.complete);
router.put('/:id', authenticateToken, rideController.update);
router.delete('/:id', authenticateToken, rideController.remove);

module.exports = router;