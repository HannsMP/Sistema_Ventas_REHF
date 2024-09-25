const { existsSync, mkdirSync, readdirSync } = require('fs');
const { rm } = require('fs/promises');
const { join } = require('path');

async function deletePath(path) {
  if (!existsSync(path)) return;
  const files = readdirSync(path);
  for (const file of files) {
    await rm(join(path, file), { recursive: true, force: true, retryDelay: 100, maxRetries: 10 });
  }
}

module.exports = deletePath;