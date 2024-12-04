// fileService.js
const pool = require('../mysql/models/imageModel');

// Function to save file information into the database
const saveFileInfo = async (fileHash, fileName, filePath, isResized = false) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO images (hash, file_name, file_path, is_resized) VALUES (?, ?, ?, ?)',
      [fileHash, fileName, filePath, isResized]
    );
    return result; // You can return the result if needed (e.g., inserted ID)
  } catch (err) {
    throw new Error('Error saving file info to database: ' + err.message);
  }
};

module.exports = {
  saveFileInfo,
};
