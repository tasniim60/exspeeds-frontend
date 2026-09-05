const fs = require('fs');
const path = require('path');

// Dynamically read en.ts and ar.ts or inspect their object keys
const enContent = fs.readFileSync(path.join(__dirname, '../src/locales/en.ts'), 'utf8');
const arContent = fs.readFileSync(path.join(__dirname, '../src/locales/ar.ts'), 'utf8');

console.log("en.ts length:", enContent.length, "ar.ts length:", arContent.length);
