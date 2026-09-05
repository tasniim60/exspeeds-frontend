const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.log('[standalone] .next/standalone does not exist yet. Run next build first.');
  process.exit(0);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('[standalone] Syncing assets for Hostinger standalone deployment...');

// 1. Copy public directory to standalone/public
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc)) {
  copyRecursiveSync(publicSrc, publicDest);
  console.log('  -> Copied public/ to .next/standalone/public/');
}

// 2. Copy .next/static to standalone/.next/static
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  copyRecursiveSync(staticSrc, staticDest);
  console.log('  -> Copied .next/static/ to .next/standalone/.next/static/');
}

// 3. Copy .data directory to standalone/.data
const dataSrc = path.join(rootDir, '.data');
const dataDest = path.join(standaloneDir, '.data');
if (fs.existsSync(dataSrc)) {
  copyRecursiveSync(dataSrc, dataDest);
  console.log('  -> Copied .data/ to .next/standalone/.data/');
}

console.log('[standalone] Completed successfully! Standalone server is ready for Hostinger.');
