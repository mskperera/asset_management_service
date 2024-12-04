
// exports.resizeImage = async (filePath, width, height, quality) => {
//   const outputFilePath = filePath.replace(/(\.\w+)$/, `_resized$1`);
//   await sharp(filePath)
//     .resize(width, height)
//     .jpeg({ quality })
//     .toFile(outputFilePath);
//   return outputFilePath;
// };

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// TEMP_IMAGE_DIR=F:/Projects/Ongoing_Projects/Legendbit_POS_cloud/lb_cloud_pos/asset_management_service/public/temp
const TEMP_IMAGES_DIR =process.env.TEMP_IMAGE_DIR; //path.join(__dirname, 'public', 'tempImages');

// Ensure the temporary directory exists
if (!fs.existsSync(TEMP_IMAGES_DIR)) {
  fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
}

exports.resizeImage = async (filePath, width, height, quality) => {
  const fileName = path.basename(filePath).replace(/(\.\w+)$/, ''); // Extract file name without extension
  const extension = path.extname(filePath); // Get the file extension
  const tempFilePath = path.join(
    TEMP_IMAGES_DIR,
    `${fileName}_${width || 'auto'}x${height || 'auto'}_q${quality || 80}${extension}`
  );

  // Resize the image and save it to the temporary location
  await sharp(filePath)
    .resize(width, height)
    .jpeg({ quality })
    .toFile(tempFilePath);

  return tempFilePath;
};
