const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pool = require('../mysql/models/imageModel');
const { generateHash } = require('../utils/hashGenerator');
const { resizeImage } = require('../utils/imageProcessor');
const { saveFileInfo } = require('../sql/file');


const UPLOAD_DIR = process.env.UPLOAD_DIR;

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided.' });

    const fileHash = generateHash(req.file.originalname);
    const filePath = path.join(UPLOAD_DIR, req.file.filename);

    // Determine the image status using a boolean flag (true = resized, false = original)
    let isResized = false;  // Default status is original
    if (req.file.mimetype.startsWith('image/') && req.body.resize) {
      isResized = true; // If image was resized, set isResized to true
    }

    // Use the saveFileInfo function to insert file data into the database
    await saveFileInfo(fileHash, req.file.originalname, filePath, isResized);

    // Respond with the file hash, name, and status
    res.json({ hash: fileHash, fileName: req.file.originalname, isResized });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};






// exports.viewImage = async (req, res) => {
//   const { hash } = req.params;
//   const { width, height, quality } = req.query;

//   try {
//     // Fetch the image from the database
//     const [rows] = await pool.query('SELECT * FROM images WHERE hash = ?', [hash]);
//     if (rows.length === 0) return res.status(404).json({ error: 'Image not found.' });

//     const image = rows[0];
//     const originalFilePath =`${image.folder_path}/${image.file_path}`;
// console.log('originalFilePath:',originalFilePath)
//     let filePath = originalFilePath;

//     if (width || height || quality) {
//       // Resize and save the image to the temporary directory
//       filePath = await resizeImage(originalFilePath, +width || null, +height || null, +quality || 80);
//     }

//     // Send the resized or original image file
//     res.sendFile(filePath);
//   } catch (err) {
//     console.error('Error viewing image:', err);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// };