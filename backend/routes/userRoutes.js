const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/me', authenticateToken, userController.me);
router.put('/profile', authenticateToken, upload.single('photo'), userController.updateProfile);
router.put('/onboarding', authenticateToken, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'carPhoto', maxCount: 1 }]), userController.completeOnboarding);
router.get('/:id', userController.getProfile);

module.exports = router;
