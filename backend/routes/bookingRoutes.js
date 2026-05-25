const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/',
  [
    body('rideId').notEmpty().withMessage('ID du trajet requis.'),
    body('seats').isInt({ min: 1 }).withMessage('Nombre de places invalide.'),
  ],
  bookingController.create
);

router.get('/me',            bookingController.getMyBookings);
router.get('/driver',        bookingController.getDriverBookings);
router.get('/pending-count', bookingController.pendingCount);
router.put('/:id/accept', bookingController.accept);
router.put('/:id/refuse', bookingController.refuse);
router.put('/:id/cancel', bookingController.cancel);

module.exports = router;
