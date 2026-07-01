const express = require('express');
const ctrl = require('../controllers/emergencyController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/',      authenticateToken, ctrl.getMine);
router.post('/',     authenticateToken, ctrl.create);
router.delete('/:id',authenticateToken, ctrl.remove);
module.exports = router;
