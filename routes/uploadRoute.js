const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadFile, viewImage } = require('../controllers/uploadController');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadFile);


module.exports = router;
