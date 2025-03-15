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


const markFileAsToBeDeleted_sql = async (fileHash) => {
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
      'UPDATE images SET toBeDeleted = 1 WHERE hash = ?',
      [fileHash]
    );

    return result;
  } catch (err) {
    throw new Error('Error committing file: ' + err.message);
  }
};


const isFileCommitted = async (fileHash) => {
  const [result] = await pool.query(
    'SELECT COUNT(*) AS count FROM images WHERE hash = ? AND isCommitted = 1',
    [fileHash]
  );

  return result[0].count > 0;
};

const isFileMarkedAsToBeDeleted = async (fileHash) => {
  const [result] = await pool.query(
    'SELECT COUNT(*) AS count FROM images WHERE hash = ? AND toBeDeleted = 1',
    [fileHash]
  );

  return result[0].count > 0;
};


const getAllUncommitedFileData = async () => {
  try {
   // Get all uncommitted files
   const [files] = await pool.query(
    'SELECT hash, file_path,folder_path FROM images WHERE isCommitted = 0'
  );

  // if (files.length === 0) {
  //   return { message: 'No uncommitted files to delete.' };
  // }

 return files;
  } catch (err) {
    throw new Error('Error committing file: ' + err.message);
  }
};


const getAllFileDataToBeDeleted = async () => {
  try {
   // Get all uncommitted files
   const [files] = await pool.query(
    'SELECT hash, file_path,folder_path FROM images WHERE toBeDeleted =1'
  );

  // if (files.length === 0) {
  //   return { message: 'No uncommitted files to delete.' };
  // }

 return files;
  } catch (err) {
    throw new Error('Error committing file: ' + err.message);
  }
};



const getFileDataByFileHash = async (fileHash) => {
  try {
    const [files] = await pool.query(
      'SELECT hash, file_path,folder_path FROM images WHERE hash = ?',
      [fileHash]
    );


    return files[0]; // Return the first matching record
  } catch (err) {
    throw new Error('Error retrieving file data: ' + err.message);
  }
};

const deleteFileDataByFileHash = async (fileHash) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM images WHERE hash = ?',
      [fileHash]
    );

    if (result.affectedRows === 0) {
      return { message: 'No records found to delete.' };
    }

    return { message: 'File record deleted successfully.' };
  } catch (err) {
    throw new Error('Error deleting file record: ' + err.message);
  }
};
const fetchImageFromDatabase = async (hash) => {
  try {
    const [rows] = await pool.query('SELECT * FROM images WHERE hash = ?', [hash]);

    const image = rows[0];

    return image;
  } catch (err) {
    console.error('Database error while fetching image:', err);
    return { status: 500, message: 'Internal server error' };
  }
};



module.exports = {
  saveFileInfo,
  commitFile,
  getAllUncommitedFileData,
  getFileDataByFileHash,
  deleteFileDataByFileHash,
  isFileCommitted,
  fetchImageFromDatabase,
  getAllFileDataToBeDeleted,
  markFileAsToBeDeleted_sql,
  isFileMarkedAsToBeDeleted
};
