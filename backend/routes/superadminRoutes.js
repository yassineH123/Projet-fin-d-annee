const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const superadminController = require('../controllers/superadminController');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('superadmin'));

router.get('/admins', superadminController.listAdmins);
router.post('/admins', superadminController.createAdmin);
router.delete('/admins/:id', superadminController.deleteAdmin);

module.exports = router;