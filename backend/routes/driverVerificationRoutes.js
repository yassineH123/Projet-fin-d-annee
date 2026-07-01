const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireDriver } = require('../middleware/permissions');
const upload = require('../middleware/uploadMiddleware');
const driverVerificationController = require('../controllers/driverVerificationController');

const router = express.Router();

const docsUpload = upload.fields([
  { name: 'cinDoc',    maxCount: 1 },
  { name: 'permisDoc', maxCount: 1 },
  { name: 'carPhoto',  maxCount: 1 },
]);

// requireDriver placé après docsUpload pour préserver l'ordre exact d'origine
// (le filtrage de fichiers multer s'exécutait déjà avant cette vérification).
router.post(
  '/',
  authenticateToken,
  docsUpload,
  requireDriver('Choisissez le profil conducteur avant de soumettre vos documents.', 400),
  driverVerificationController.verifyDriver
);

module.exports = router;
