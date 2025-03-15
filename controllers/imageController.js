const {
  deleteUncommittedFiles,
  deleteFile,
  commitFile_srv,
  uploadImage_srv,
  processImageRequest_srv,
  markFileAsTobeDeleted_srv,
  deleteFilesMarkedAsToBeDeleted_srv,
  restartService,
} = require("../service/files");

exports.uploadImage = async (req, res) => {
  const { file } = req;
  const folderPath = req.body.folderPath || "";

  const response = await uploadImage_srv(file, folderPath);
  return res
    .status(response.status)
    .json(response.data || { error: response.message });
};

exports.commitFileUpload = async (req, res) => {
  try {
    const { fileHash } = req.body;

    console.log("fileHash:", fileHash);

    if (!fileHash) {
      return res.status(400).json({ error: "fileHash is required" });
    }

    // Handle the file commit process
    const response = await commitFile_srv(fileHash);

    return res.status(response.status).json({ message: response.message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.markFileAsTobeDeleted_ctrl = async (req, res) => {
  try {
    const { fileHash } = req.body;

    console.log("fileHash:", fileHash);

    if (!fileHash) {
      return res.status(400).json({ error: "fileHash is required" });
    }

    // Handle the file commit process
    const response = await markFileAsTobeDeleted_srv(fileHash);

    return res.status(response.status).json({ message: response.message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
};

exports.deleteFilesMarkedAsToBeDeleted_ctrl = async (req, res) => {
  try {
    const result = await deleteFilesMarkedAsToBeDeleted_srv();

    // Handle specific error cases
    if (result.exception) {
      return res.status(400).json({ exception: result.exception });
    }

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    console.log("result", result);
    return res.json(result);
  } catch (error) {
    console.error("Errorrrrrrrrr : ", error);
    return res.status(500).json(error.message);
  }
};

exports.deleteUncommittedFiles_ctrl = async (req, res) => {
  try {
    const result = await deleteUncommittedFiles();

    // Handle specific error cases
    if (result.exception) {
      return res.status(400).json({ exception: result.exception });
    }

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    console.log("result", result);
    return res.json(result);
  } catch (error) {
    console.error("Errorrrrrrrrr : ", error);
    return res.status(500).json(error.message);
  }
};

exports.deleteFile_ctrl = async (req, res) => {
  try {
    const { fileHash } = req.query;

    if (!fileHash) {
      return res.status(400).json({ error: "fileHash is required" });
    }

    const result = await deleteFile(fileHash);

    if (result.exception) {
      return res.status(404).json({ message: result.exception });
    }

    return res.json(result);
  } catch (error) {
    console.error("Error during file deletion:", error);
    return res.status(500).json({ error: "Error processing the request" });
  }
};

exports.viewImage = async (req, res) => {
  const { hash } = req.params;
  const { width, height, quality } = req.query;

  // Process the image request (resize if necessary)
  const processedImage = await processImageRequest_srv(
    hash,
    width,
    height,
    quality
  );
  console.log("processedImage:", processedImage);

  if (processedImage.exception) {
    return res.status(400).json({ message: processedImage.exception });
  }

  // Send the image file
  return res.sendFile(processedImage.filePath);
};

// exports.uploadImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Retrieve the custom folder path from the request body
//     const customFolderPath = req.body.folderPath || '';
//     const finalUploadDir = path.join(UPLOAD_DIR, customFolderPath);

//     console.log('finalUploadDir:', finalUploadDir);

//     // Ensure the final directory exists
//     try {
//       await fs.mkdir(finalUploadDir, { recursive: true });
//     } catch (mkdirError) {
//       console.error('Error creating directory:', mkdirError);
//       return res.status(500).json({ error: 'Failed to create upload directory' });
//     }

//     // Generate a file hash for the uploaded file
//     const fileHash = generateHash(req.file.originalname);

//     // Construct the path for the resized image
//     const timestamp = Date.now();
//     const resizedImagePath = path.join(finalUploadDir, `${timestamp}-${req.file.originalname}`);

//     // Resize and crop the image using sharp
//     try {
//       await sharp(req.file.buffer)
//         .resize(512, 512, {
//           fit: sharp.fit.cover, // Ensure cropping occurs to maintain aspect ratio
//           position: sharp.strategy.entropy, // Crop from the most interesting area of the image
//         })
//         .toFile(resizedImagePath);
//     } catch (sharpError) {
//       console.error('Error processing image with Sharp:', sharpError);
//       return res.status(500).json({ error: 'Image processing failed' });
//     }

//     // Save the file info in the database
//     try {
//       await saveFileInfo(fileHash, req.file.originalname, resizedImagePath, true);
//     } catch (dbError) {
//       console.error('Error saving file info to database:', dbError);
//       return res.status(500).json({ error: 'Failed to save file information' });
//     }

//     // Respond with the path and hash of the saved image
//     return res.json({
//       fileName: req.file.originalname,
//       folderPath: customFolderPath,
//       hash: fileHash,
//       resizedImagePath,
//       isResized: true,
//     });

//   } catch (error) {
//     console.error('Unexpected error during image processing:', error);
//     return res.status(500).json({ error: 'Unexpected error occurred' });
//   }
// };

// Controller function

// exports.commitFileUpload = async (req, res) => {
//   try {
//    const {fileHash}=req.body;

//    console.log('filehash',fileHash);
//    if(!fileHash)
//    {
//       return res.status(400).json({ error: 'fileHash is required' });
//     }
//    const isCommitted= await isFileCommitted(fileHash)
//    if(isCommitted)
//     {
//        return res.status(200).json({ message: 'File is already committed' });
//     }

//    const result=await commitFile(fileHash);
// if(result.exception){
//   return res.status(400).json({ error: result.exception });
// }
//    console.log('result',result);
//    return res.json({message: 'File committed successfully' });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(error);
//   }
// };

// exports.deleteFile_ctrl = async (req, res) => {
//   try {
//     const {fileHash}=req.body;
//    const result= await deleteFile(fileHash);

//    console.log('result',result);
//    return res.json(result);

//   } catch (error) {
//     console.error('Error during image processing:', error);
//     return res.status(500).json({ error: 'Error processing the image' });
//   }
// };

// Function to delete uncommitted files

// const deleteFile = async (fileHash) => {
//   try {
//     const file = await getFileDataByFileHash(fileHash);
//     let deletedFiles = [];
//     console.log('getFileDataByFileHash', file);

//       try {
//         // Ensure the file path is safe
//         const filePath = path.resolve(file.file_path);

//         // Delete the file from the file system using the correct method
//         await fs.unlink(filePath);

//         // Remove file record from the database
//         await pool.query('DELETE FROM images WHERE hash = ?', [file.hash]);

//       } catch (fileError) {
//         console.error(`Error deleting file ${file.file_path}:`, fileError.message);
//       }

//     return { message: 'Deleted file.', deletedFiles };
//   } catch (err) {
//     throw new Error('Error deleting file: ' + err.message);
//   }
// };
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
