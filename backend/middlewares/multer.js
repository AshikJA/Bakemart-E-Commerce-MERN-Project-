const multer = require('multer');
const path = require('path');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('--- Multer Debug: Processing Upload ---');
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only ${ALLOWED_IMAGE_TYPES.join(', ')} are allowed.`), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

module.exports = upload;
