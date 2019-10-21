const path = require('path');
const zlib = require('zlib');
const fs = require('fs-extra');
const { extract } = require('tar-fs');

const bin = path.join(__dirname, '..', 'bin');
const lib = path.join(__dirname, '..', 'lib');

const fontsConfig = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/opt/lib/fonts</dir>
  <dir>~/.fonts</dir>
  <config></config>
</fontconfig>
`;

async function decompressChrome(chromeDirectory) {
  return new Promise((resolve, reject) => {
    const compressed = path.join(chromeDirectory, 'chromium.br');
    console.log('Decompressing chrome file', compressed);
    const decompress = zlib.createBrotliDecompress();
    const input = fs.createReadStream(compressed);
    const target = path.join(chromeDirectory, 'chromium');
    const output = fs.createWriteStream(target);

    input.pipe(decompress).pipe(output);
    output.on('finish', () => {
      fs.chmodSync(target, 0o765);
      fs.ensureDirSync(bin);
      fs.renameSync(target, path.join(bin, 'chromium'));
      resolve();
    });
    output.on('error', ex => {
      reject(ex);
    });
  });
}

async function decompressSharedLibraries(chromeDirectory) {
  return new Promise((resolve, reject) => {
    const compressed = path.join(chromeDirectory, 'aws.tar.br');
    console.log('Decompressing shared libraries file', compressed);
    const decompress = zlib.createBrotliDecompress();
    const input = fs.createReadStream(compressed);
    const target = path.join(chromeDirectory, 'aws.tar');
    const output = extract(target);

    input.pipe(decompress).pipe(output);
    output.on('finish', () => {
      fs.moveSync(path.join(target, 'lib'), lib);
      fs.moveSync(path.join(target, '.fonts'), path.join(lib, 'fonts'));
      fs.writeFileSync(path.join(lib, 'fonts.conf'), fontsConfig);
      fs.removeSync(target);
      resolve();
    });
    output.on('error', ex => {
      reject(ex);
    });
  });
}

async function decompressSwiftShader(chromeDirectory) {
  return new Promise((resolve, reject) => {
    const compressed = path.join(chromeDirectory, 'swiftshader.tar.br');
    console.log('Decompressing swift shader file', compressed);
    const decompress = zlib.createBrotliDecompress();
    const input = fs.createReadStream(compressed);
    const target = path.join(chromeDirectory, 'swiftshader.tar');
    const output = extract(target);

    input.pipe(decompress).pipe(output);
    output.on('finish', () => {
      fs.ensureDirSync(bin);
      fs.readdirSync(target).forEach(file => {
        fs.renameSync(path.join(target, file), path.join(bin, file));
      });
      fs.removeSync(target);
      resolve();
    });
    output.on('error', ex => {
      reject(ex);
    });
  });
}

async function decompress() {
  const chromeDirectory = path.join(
    __dirname,
    'node_modules',
    'chrome-aws-lambda',
    'bin',
  );
  await Promise.all([fs.remove(bin), fs.remove(lib)]);
  await decompressChrome(chromeDirectory);
  await decompressSharedLibraries(chromeDirectory);
  await decompressSwiftShader(chromeDirectory);
}

(async () => {
  console.log('decompress chrome binaries');
  await decompress();
  console.log('done');
})();
