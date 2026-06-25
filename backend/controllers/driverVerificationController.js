const path = require('path');
const fs = require('fs');
const { User } = require('../models');
const { verifyDocument } = require('../services/ollamaVisionService');

const uploadDir = path.join(__dirname, '../uploads');

async function verifyDriver(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (!user.isDriver) {
      return res.status(400).json({ message: 'Choisissez le profil conducteur avant de soumettre vos documents.' });
    }

    const cinFile    = req.files?.cinDoc?.[0];
    const permisFile = req.files?.permisDoc?.[0];
    const carFile     = req.files?.carPhoto?.[0];

    if (!cinFile || !permisFile) {
      return res.status(400).json({ message: 'La photo de la CIN et celle du permis sont obligatoires.' });
    }

    const carPhotoPath = carFile
      ? path.join(uploadDir, carFile.filename)
      : (user.carPhoto ? path.join(uploadDir, path.basename(user.carPhoto)) : null);

    if (!carPhotoPath || !fs.existsSync(carPhotoPath)) {
      return res.status(400).json({ message: 'La photo du véhicule est obligatoire.' });
    }

    const [cinResult, permisResult, carResult] = await Promise.all([
      verifyDocument(path.join(uploadDir, cinFile.filename), 'cin'),
      verifyDocument(path.join(uploadDir, permisFile.filename), 'permis'),
      verifyDocument(carPhotoPath, 'voiture'),
    ]);

    const results = { cin: cinResult, permis: permisResult, voiture: carResult };
    const allValid = cinResult.valide && permisResult.valide && carResult.valide;

    if (!allValid) {
      user.set({ driverVerified: false });
      await user.save();
      return res.status(422).json({
        message: 'Un ou plusieurs documents n\'ont pas pu être validés.',
        results,
      });
    }

    const updates = {
      driverVerified: true,
      cinDoc:    `/uploads/${cinFile.filename}`,
      permisDoc: `/uploads/${permisFile.filename}`,
    };
    if (carFile) updates.carPhoto = `/uploads/${carFile.filename}`;

    user.set(updates);
    await user.save();
    const updated = await User.findById(req.user.id).select('-password');

    return res.json({ message: 'Documents validés, vous êtes un conducteur vérifié !', results, user: updated });
  } catch (err) {
    return res.status(503).json({ message: err.message });
  }
}

module.exports = { verifyDriver };
