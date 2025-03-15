const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

const {
  getAllUncommitedFileData,
  getFileDataByFileHash,
  deleteFileDataByFileHash,
  isFileCommitted,
  commitFile,
  saveFileInfo,
  fetchImageFromDatabase,
  isFileMarkedAsToBeDeleted,
  markFileAsToBeDeleted_sql,
  getAllFileDataToBeDeleted,
} = require("../sql/file");
const { generateHash } = require("../utils/hashGenerator");
const { resizeImage } = require("../utils/imageProcessor");

const UPLOAD_DIR = process.env.UPLOAD_DIR; // Default to 'public/uploads' if the env variable is not set

const uploadImage_srv = async (file, folderPath) => {
  try {
    if (!file) {
      return { status: 400, message: "No file uploaded" };
    }

    // Set up the final upload directory
    const finalUploadDir = path.join(UPLOAD_DIR, folderPath || "");
    console.log("finalUploadDir:", finalUploadDir);

    // Ensure the directory exists
    try {
      await fs.mkdir(finalUploadDir, { recursive: true });
    } catch (mkdirError) {
      console.error("Error creating directory:", mkdirError);
      return { status: 500, message: "Failed to create upload directory" };
    }

    // Generate file hash
    const fileHash = generateHash(file.originalname);

    // Construct resized image path
    const timestamp = Date.now();
    const resizedImagePath = path.join(
      finalUploadDir,
      `${timestamp}-${file.originalname}`
    );

    // Resize and crop the image using Sharp
    try {
      await sharp(file.buffer)
        .resize(512, 512, {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        })
        .toFile(resizedImagePath);
    } catch (sharpError) {
      console.error("Error processing image with Sharp:", sharpError);
      return { status: 500, message: "Image processing failed" };
    }

    // Save file info in the database
    try {
      console.log("folderPathhhhhhhhhhhhh:", folderPath, file.originalname);
      const filePath = path.join(
        folderPath,
        `${timestamp}-${file.originalname}`
      );

      const folderPath_toFowardSlash = UPLOAD_DIR.replace(/\//g, "\\");
      await saveFileInfo(
        fileHash,
        file.originalname,
        filePath,
        folderPath_toFowardSlash,
        true
      );
    } catch (dbError) {
      console.error("Error saving file info to database:", dbError);
      return { status: 500, message: "Failed to save file information" };
    }

    // Return success response
    return {
      status: 200,
      data: {
        fileName: file.originalname,
        folderPath,
        hash: fileHash,
        resizedImagePath,
        isResized: true,
      },
    };
  } catch (error) {
    console.error("Unexpected error during image processing:", error);
    return { status: 500, message: "Unexpected error occurred" };
  }
};

const deleteFile = async (fileHash) => {
  try {
    // Retrieve file details from the database
    const file = await getFileDataByFileHash(fileHash);

    if (!file) {
      return { exception: "File not found" };
    }

    console.log("getFileDataByFileHash:", file);

    try {
      const file_path = `${file.folder_path}\\${file.file_path}`;
      const filePath = path.resolve(file_path);

      console.log("Resolved file path:", filePath);

      // Check if the file exists before deleting
      try {
        await fs.access(filePath);
      } catch (accessError) {
        console.error(`File does not exist or cannot be accessed: ${filePath}`);
        return {
          warning: "File record deleted, but file was not found on disk.",
        };
      }

      // Delete the file from the file system
      await fs.unlink(filePath);

      console.log(`File deleted successfully: ${filePath}`);

      await deleteFileDataByFileHash(file.hash);

      return { message: "File deleted successfully", deletedFile: filePath };
    } catch (fileError) {
      console.error(
        `Error deleting file ${file.file_path}:`,
        fileError.message
      );
      return {
        error: `Error deleting file from the file system: ${fileError.message}`,
      };
    }
  } catch (err) {
    console.error("Error during file deletion:", err.message);
    throw new Error("Error deleting file: " + err.message);
  }
};

const deleteUncommittedFiles = async () => {
  try {
    const files = await getAllUncommitedFileData();
    console.log("files", files);
    if (files.length === 0) {
      return { exception: "No uncommittedFiles found." };
    }
    let deletedFiles = [];

    for (const file of files) {
      try {
        const file_path = `${file.folder_path}\\${file.file_path}`;
        const filePath = path.resolve(file_path);
        console.log("filePath", filePath);

        await fs.unlink(filePath);

        await deleteFileDataByFileHash(file.hash);

        deletedFiles.push(filePath);
      } catch (fileError) {
        console.error(fileError.message);
        return { error: "Internal Server Error" };
      }
    }

    return { message: "Deleted uncommitted files.", deletedFiles };
  } catch (err) {
    console.error(err.message);
    return { error: "Internal Server Error" };
  }
};

const commitFile_srv = async (fileHash) => {
  try {
    const isCommitted = await isFileCommitted(fileHash);

    if (isCommitted) {
      return { status: 200, message: "File is already committed" };
    }

    const result = await commitFile(fileHash);

    if (result.exception) {
      return { status: 400, message: result.exception };
    }

    console.log("Commit result:", result);
    return { status: 200, message: "File committed successfully" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Error committing file" };
  }
};

const markFileAsTobeDeleted_srv = async (fileHash) => {
  try {
    const isCommitted = await isFileMarkedAsToBeDeleted(fileHash);

    if (isCommitted) {
      return {
        status: 200,
        message: "File is already marked as to be deleted.",
      };
    }

    const result = await markFileAsToBeDeleted_sql(fileHash);

    if (result.exception) {
      return { status: 400, message: result.exception };
    }

    return { status: 200, message: "File marked as to be deleted" };
  } catch (error) {
    console.error(error);
    return { status: 500, error };
  }
};

const deleteFilesMarkedAsToBeDeleted_srv = async () => {
  try {
    const files = await getAllFileDataToBeDeleted();
    console.log("files", files);
    if (files.length === 0) {
      return { exception: "No files to be deleted found." };
    }
    let deletedFiles = [];

    for (const file of files) {
      try {
        const file_path = `${file.folder_path}\\${file.file_path}`;
        const filePath = path.resolve(file_path);
        console.log("filePath", filePath);

        await fs.unlink(filePath);

        await deleteFileDataByFileHash(file.hash);

        deletedFiles.push(filePath);
      } catch (fileError) {
        console.error(fileError.message);
        return { error: fileError.message };
      }
    }

    return { message: "Deleted uncommitted files.", deletedFiles };
  } catch (err) {
    console.error(err.message);
    return { error: "Internal Server Error" };
  }
};

const processImageRequest_srv = async (hash, width, height, quality) => {
  try {
    // Fetch image from the database
    const imageResponse = await fetchImageFromDatabase(hash);

    if (!imageResponse) {
      return { exception: "No image found." };
    }

    const originalFilePath = `${imageResponse.folder_path}/${imageResponse.file_path}`;

    let filePath = originalFilePath;
    if (width || height || quality) {
      filePath = await resizeImage(
        originalFilePath,
        +width || null,
        +height || null,
        +quality || 80
      );
    }

    return { filePath };
  } catch (err) {
    console.error("Error processing image:", err);
    return { error: "Error processing image" };
  }
};

module.exports = {
  uploadImage_srv,
  deleteFile,
  deleteUncommittedFiles,
  commitFile_srv,
  processImageRequest_srv,
  markFileAsTobeDeleted_srv,
  deleteFilesMarkedAsToBeDeleted_srv,
};
