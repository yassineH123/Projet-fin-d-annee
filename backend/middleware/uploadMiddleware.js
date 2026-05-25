const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const imageFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
             allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Seules les images jpeg/jpg/png/webp sont acceptées.'));
};

const docFilter = (_req, file, cb) => {
  const allowedExt  = /jpeg|jpg|png|webp|pdf/;
  const allowedMime = /jpeg|jpg|png|webp|pdf/;
  const ok = allowedExt.test(path.extname(file.originalname).toLowerCase()) &&
             allowedMime.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Format accepté : image ou PDF.'));
};

const mediaFilter = (_req, file, cb) => {
  const allowedExt  = /jpeg|jpg|png|webp|gif|mp4|mov|webm/;
  const allowedMime = /image\/(jpeg|jpg|png|webp|gif)|video\/(mp4|quicktime|webm)/;
  const ok = allowedExt.test(path.extname(file.originalname).toLowerCase()) &&
             allowedMime.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Format accepté : image (jpg/png/gif) ou vidéo (mp4/mov).'));
};

const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });

upload.docs  = multer({ storage, fileFilter: docFilter,   limits: { fileSize: 10 * 1024 * 1024 } });
upload.media = multer({ storage, fileFilter: mediaFilter, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = upload;
