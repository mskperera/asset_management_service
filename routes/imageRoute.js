const express = require('express');
const multer = require('multer');
const { uploadImage, commitFileUpload, deleteUncommittedFiles_ctrl } = require('../controllers/imageController');

// Setup multer for handling file uploads
const upload = multer({
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpg and .png .webp files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size 10MB
});

// Create an Express Router
const router = express.Router();

// Define the upload image endpoint
router.post('/upload-image', upload.single('file'), uploadImage);


router.post('/imageUpload/commitFile',commitFileUpload);

router.post('/imageUpload/commitFile',commitFileUpload);

router.post('/imageUpload/deleteUncommittedFiles',deleteUncommittedFiles_ctrl);

module.exports = router;
