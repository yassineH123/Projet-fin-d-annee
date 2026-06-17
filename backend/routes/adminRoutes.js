const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('admin', 'superadmin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/charts',    adminController.getCharts);

router.get('/users',           adminController.listUsers);
router.get('/users/:id',       adminController.getUserDetail);
router.patch('/users/:id/suspend',    adminController.suspendUser);
router.patch('/users/:id/reactivate', adminController.reactivateUser);
router.patch('/users/:id/ban',        adminController.banUser);
router.delete('/users/:id',           adminController.deleteUser);

router.get('/rides',             adminController.listRides);
router.get('/rides/:id',         adminController.getRideDetail);
router.patch('/rides/:id/cancel', adminController.cancelRide);
router.delete('/rides/:id',       adminController.deleteRide);

router.get('/reports',              adminController.listReports);
router.get('/reports/:id',          adminController.getReportDetail);
router.patch('/reports/:id/status', adminController.updateReportStatus);

router.get('/logs', adminController.listAdminLogs);

module.exports = router;
