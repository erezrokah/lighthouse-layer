const path = require('path');
const zlib = require('zlib');
const fs = require('fs');

async function decompress() {
  return new Promise((resolve, reject) => {
    const chromeDirectory = path.join(
      __dirname,
      'node_modules',
      'chrome-aws-lambda',
      'bin',
    );
    const chromeFile = fs
      .readdirSync(chromeDirectory)
      .find(file => file.match(/chromium.+?\.br/));
    const compressed = path.join(chromeDirectory, chromeFile);
    console.log('Found compressed chrome file', compressed);
    const decompress = zlib.createBrotliDecompress();
    const input = fs.createReadStream(compressed);
    const target = path.join(chromeDirectory, 'chromium');
    const output = fs.createWriteStream(target);

    input.pipe(decompress).pipe(output);
    output.on('finish', () => {
      fs.chmodSync(target, 0o765);
      resolve();
    });
    output.on('error', ex => {
      reject(ex);
    });
  });
}

(async () => {
  console.log('decompress chrome binary');
  await decompress();
  console.log('done');
})();
