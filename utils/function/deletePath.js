const { existsSync, mkdirSync, readdirSync } = require('fs');
const { rm } = require('fs/promises');
const { join } = require('path');

async function deletePath(path) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
    return 0;
  }

  let files = readdirSync(path);
  for (let file of files) {
    await rm(join(path, file), { recursive: true, force: true, retryDelay: 100, maxRetries: 10 });
  }

  return files.length;
}

module.exports = deletePath;