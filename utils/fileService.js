// fileService.js
const pool = require('../mysql/models/imageModel');

// Function to save file information into the database
const saveFileInfo = async (fileHash, fileName, filePath, folderPath, isResized = false) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO images (hash, file_name, file_path, folder_path, is_resized) VALUES (?, ?, ?, ?, ?)',
      [fileHash, fileName, filePath, folderPath, isResized]
    );
    return result;
  } catch (err) {
    throw new Error('Error saving file info to database: ' + err.message);
  }
};

// Function to save file information into the database
const commitFile = async (fileHash) => {
  try {
    // Check if the hash exists in the table
    const [existing] = await pool.query(
      'SELECT COUNT(*) AS count FROM images WHERE hash = ?',
      [fileHash]
    );

    if (existing[0].count === 0) {
      return {exception:'File hash does not exist in the database.'};
    }

    // Proceed with updating if the hash exists
    const [result] = await pool.query(
      'UPDATE images SET isCommitted = 1 WHERE hash = ?',
      [fileHash]
    );

    return result;
  } catch (err) {
    throw new Error('Error committing file: ' + err.message);
  }
};


module.exports = {
  saveFileInfo,
  commitFile
};
