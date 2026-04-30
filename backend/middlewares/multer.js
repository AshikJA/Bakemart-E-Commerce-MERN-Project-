const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

const ALLOWED_IMAGE_TYPES = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
    const mimeSubtype = file.mimetype.split('/')[1]; // e.g. 'jpeg' from 'image/jpeg'
    if (ALLOWED_IMAGE_TYPES.includes(mimeSubtype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only ${ALLOWED_IMAGE_TYPES.join(', ')} are allowed.`), false);
    }
}; 

const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'bakemart/products',
        allowed_formats: ALLOWED_IMAGE_TYPES,
        transformation: [{ width: 500, height: 500, crop: 'fill' }, { quality: 'auto' }, { fetch_format: 'auto' }]
    }
});

const returnStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'bakemart/returns',
        allowed_formats: ALLOWED_IMAGE_TYPES,
        transformation: [{ width: 500, height: 500, crop: 'fill' }, { quality: 'auto' }, { fetch_format: 'auto' }]
    }
});

const bannerStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'bakemart/banners',
        allowed_formats: ALLOWED_IMAGE_TYPES,
        transformation: [{ width: 1920, height: 600, crop: 'fill' }, { quality: 'auto' }, { fetch_format: 'auto' }]
    }
});

// Multer Upload Instances 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const uploadProductImages = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
}).array('images', 5);

const uploadReturnImages = multer({
    storage: returnStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
}).array('images', 5);

const uploadBannerImages = multer({
    storage: bannerStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
}).single('image');

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (!err) {
      return next();
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Max 5 allowed" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Unexpected field name" });
    }
    return res.status(400).json({ message: err.message });
  });
};

// ─── Cloudinary Delete Helper ──────────────────────────────────

const extractPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Handle URLs with transformation params (f_auto,q_auto, etc.)
  // Pattern: .../upload/<transforms>/<folder>/.<ext> OR .../upload/v<ver>/<folder>/.<ext>
  const match = imageUrl.match(/\/upload\/([^/]+)\/([^.]+)/);
  if (match) {
    let publicId = match[2];
    // If first group contains 'v' version, it's already clean
    // If it contains transformations (like f_auto,q_auto), they're in first group but we don't need them
    return publicId;
  }
  
  // Fallback: try splitting by /
  try {
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      // Skip version (v123) or transformation params (f_auto, etc.)
      const startIdx = (/^v\d+$/.test(afterUpload[0]) || /,/.test(afterUpload[0])) ? 1 : 0;
      const publicIdWithExt = afterUpload.slice(startIdx).join('/');
      return publicIdWithExt.replace(/\.[^/.]+$/, '');
    }
  } catch (e) {
    console.error('Failed to extract public_id:', e);
  }
  return null;
};

const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const publicId = extractPublicId(imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
};

// ─── Get Public ID from Uploaded File ──────────────────────────────────
// Returns public_id from multer req.files - use this when saving to DB

const getPublicIdFromFile = (file) => {
  if (!file) return null;
  // file.public_id is set by CloudinaryStorage in the file object
  return file.public_id || extractPublicId(file.path);
};

module.exports = {
  uploadProductImage: handleUpload(uploadProductImages),
  uploadReturnImages: handleUpload(uploadReturnImages),
  uploadBannerImage: handleUpload(uploadBannerImages),
  deleteImage,
  extractPublicId,
  getPublicIdFromFile,
};
