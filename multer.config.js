const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./utils/cloudinary');  

// Cloudinary storage setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Folder name in Cloudinary
        format: async (req, file) => {
            const format = file.mimetype.split('/')[1];
            return format === 'jpeg' ? 'jpg' : format; // Convert jpeg to jpg
        },
        public_id: (req, file) => {
            const email = req.body.email || 'user';
            const date = new Date().toISOString().replace(/:/g, '-');
            return `${email}-${date}`; // Unique public ID for the image
        },
    },
});

// File type validation
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    console.log("File MIME type:", file.mimetype); // Log the MIME type
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};


// Multer setup
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 6 }, // Limit to 6MB
    fileFilter: fileFilter
});

module.exports = upload;
