const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const driverVerificationController = require('../controllers/driverVerificationController');

const router = express.Router();

const docsUpload = upload.fields([
  { name: 'cinDoc',    maxCount: 1 },
  { name: 'permisDoc', maxCount: 1 },
  { name: 'carPhoto',  maxCount: 1 },
]);

router.post('/', authenticateToken, docsUpload, driverVerificationController.verifyDriver);

module.exports = router;
