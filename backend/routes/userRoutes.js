const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const profileUpload = upload.docs.fields([
  { name: 'photo',         maxCount: 1 },
  { name: 'carPhoto',      maxCount: 1 },
  { name: 'cinDoc',        maxCount: 1 },
  { name: 'permisDoc',     maxCount: 1 },
  { name: 'carteGriseDoc', maxCount: 1 },
  { name: 'passportDoc',   maxCount: 1 },
]);

router.get('/search',       userController.searchUsers);
router.get('/me',           authenticateToken, userController.me);
router.get('/driver-stats', authenticateToken, userController.driverStats);
router.put('/profile',      authenticateToken, profileUpload, userController.updateProfile);
router.put('/onboarding',   authenticateToken, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'carPhoto', maxCount: 1 }]), userController.completeOnboarding);
router.post('/kyc',         authenticateToken, upload.docs.fields([{ name: 'kycSelfie', maxCount: 1 }, { name: 'cinDoc', maxCount: 1 }]), userController.submitKyc);
router.get('/:id',          userController.getProfile);

module.exports = router;
