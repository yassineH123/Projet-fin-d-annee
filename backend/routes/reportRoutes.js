const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

const isAdmin = (req, res, next) =>
  ['admin', 'superadmin'].includes(req.user?.role) ? next() : res.status(403).json({ message: 'Accès refusé.' });

router.post('/', authenticateToken, reportController.create);
router.get('/',   authenticateToken, isAdmin, reportController.getAll);
router.patch('/:id/status', authenticateToken, isAdmin, reportController.updateStatus);

module.exports = router;
