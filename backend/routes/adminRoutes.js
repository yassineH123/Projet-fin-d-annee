const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('admin', 'superadmin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/charts',    adminController.getCharts);
router.get('/users',     adminController.listUsers);
router.get('/rides',     adminController.listRides);

router.patch('/users/:id/block',   adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id',        adminController.deleteUser);
router.patch('/rides/:id/cancel',  adminController.cancelRide);

module.exports = router;
