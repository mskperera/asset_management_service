const crypto = require('crypto');

exports.generateHash = (fileName) => {
  return crypto.createHash('md5').update(fileName + Date.now()).digest('hex');
};
