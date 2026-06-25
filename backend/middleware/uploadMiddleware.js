const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fallback to local storage if Cloudinary not configured
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let imageStorage, docStorage, mediaStorage;

if (useCloudinary) {
  imageStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'atlasway/avatars', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }] },
  });
  docStorage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: 'atlasway/documents',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
    }),
  });
  mediaStorage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: 'atlasway/media',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov'],
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    }),
  });
} else {
  // Fallback: local disk storage
  const fs = require('fs');
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, unique + path.extname(file.originalname));
    },
  });
  imageStorage = diskStorage;
  docStorage = diskStorage;
  mediaStorage = diskStorage;
}

const imageFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Seules les images jpeg/jpg/png/webp sont acceptées.'));
};

const docFilter = (_req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|webp|pdf/;
  const allowedMime = /jpeg|jpg|png|webp|pdf/;
  const ok = allowedExt.test(path.extname(file.originalname).toLowerCase()) && allowedMime.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Format accepté : image ou PDF.'));
};

const mediaFilter = (_req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|webp|gif|mp4|mov|webm/;
  const allowedMime = /image\/(jpeg|jpg|png|webp|gif)|video\/(mp4|quicktime|webm)/;
  const ok = allowedExt.test(path.extname(file.originalname).toLowerCase()) && allowedMime.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Format accepté : image ou vidéo.'));
};

const upload = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
upload.docs  = multer({ storage: docStorage,   fileFilter: docFilter,   limits: { fileSize: 10 * 1024 * 1024 } });
upload.media = multer({ storage: mediaStorage, fileFilter: mediaFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// Helper: get URL from uploaded file (works for both Cloudinary and local)
upload.getFileUrl = (file) => {
  if (!file) return null;
  if (file.path && file.path.startsWith('http')) return file.path; // Cloudinary URL
  return file.path || `/uploads/${file.filename}`; // Local path
};

module.exports = upload;
