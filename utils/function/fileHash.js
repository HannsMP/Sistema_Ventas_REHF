const { createHash } = require('crypto');
const { readFileSync } = require('fs');

/** @param {string} filePath @returns {string} */
function fileHash(filePath) {
  let fileBuffer = readFileSync(filePath);
  return createHash('sha256').update(fileBuffer).digest('hex');
}

module.exports = fileHash;