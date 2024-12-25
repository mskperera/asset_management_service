const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { generateHash } = require('../utils/hashGenerator');
const { saveFileInfo } = require('../utils/fileService');

const UPLOAD_DIR = process.env.UPLOAD_DIR; // Default to 'public/uploads' if the env variable is not set

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Retrieve the custom folder path from the headers
    const customFolderPath = req.body.folderPath || '';
    const finalUploadDir = path.join(UPLOAD_DIR, customFolderPath);

    console.log('finalUploadDir',finalUploadDir)
    // Ensure the final directory exists
    if (!fs.existsSync(finalUploadDir)) {
      fs.mkdirSync(finalUploadDir, { recursive: true });
    }

    // Generate a file hash for the uploaded file
    const fileHash = generateHash(req.file.originalname);

    // Construct the path for the resized image
    const resizedImagePath = path.join(finalUploadDir, `${Date.now()}-${req.file.originalname}`);

    // Resize and crop the image using sharp
    await sharp(req.file.buffer)
      .resize(512, 512, {
        fit: sharp.fit.cover, // Ensure cropping occurs to maintain aspect ratio
        position: sharp.strategy.entropy, // Crop from the most interesting area of the image
      })
      .toFile(resizedImagePath);

    // Save the file info in the database
    await saveFileInfo(fileHash, req.file.originalname, resizedImagePath, true);

    // Respond with the path and hash of the saved image
    return res.json({
      fileName: req.file.originalname,
      folderPath: customFolderPath,
      hash: fileHash,
      resizedImagePath,
      isResized: true,
    });
  } catch (error) {
    console.error('Error during image processing:', error);
    return res.status(500).json({ error: 'Error processing the image' });
  }
};


// exports.uploadImage = async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//       }
  
//       // Log the upload directory to verify the path
//       console.log('Upload Directory:', UPLOAD_DIR);
  
//       // Ensure the upload directory exists
//       if (!fs.existsSync(UPLOAD_DIR)) {
//         console.log('Creating directory:', UPLOAD_DIR);
//         fs.mkdirSync(UPLOAD_DIR, { recursive: true });
//       }
  
//       // Generate a file hash for the uploaded file
//       const fileHash = generateHash(req.file.originalname);
  
//       // Construct the path for the resized image
//       const resizedImagePath = path.join(UPLOAD_DIR, `${Date.now()}-${req.file.originalname}`);
//       console.log('Resized Image Path:', resizedImagePath);
  
//       // Resize and crop the image using sharp
//       await sharp(req.file.buffer)
//         .resize(512, 512, {
//           fit: sharp.fit.cover,  // Ensure cropping occurs to maintain aspect ratio
//           position: sharp.strategy.entropy,  // Crop from the most interesting area of the image
//         })
//         .toFile(resizedImagePath);
  
//       // Save the file info in the database (with isResized = true)
//       await saveFileInfo(fileHash, req.file.originalname, resizedImagePath, true);
  
//       // Respond with the path and hash of the saved image
//       return res.json({
//         fileName: req.file.originalname,
//         hash: fileHash,  // Include the hash for the file
//         isResized:true
//       });
//     } catch (error) {
//       console.error('Error during image processing:', error);
//       return res.status(500).json({ error: 'Error processing the image' });
//     }
//   };