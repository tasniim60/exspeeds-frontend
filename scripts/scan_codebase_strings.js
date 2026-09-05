const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function getAllFiles(dir, exts = ['.tsx', '.ts', '.jsx', '.js']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const allSrcFiles = getAllFiles(srcDir).filter(f => !f.includes('locales') && !f.includes('types'));

console.log(`Scanning ${allSrcFiles.length} source files for hardcoded English UI strings...`);

// Patterns to look for in TSX/JSX
const suspectPatterns = [
  { name: 'Hardcoded Placeholder', regex: /placeholder=["']([A-Z][a-zA-Z\s,./?!-]+)["']/g },
  { name: 'Hardcoded Loading Text', regex: />\s*(Loading\.\.\.|Please wait\.\.\.)\s*</gi },
  { name: 'Hardcoded Common Buttons', regex: />\s*(Submit|Cancel|Next|Back|Save|Delete|Edit|Confirm|Close|Search|View All|Details|Learn More|Get Started)\s*</gi },
  { name: 'Hardcoded Nav/Dashboard Labels', regex: />\s*(Dashboard|Shipments|Settings|Profile|Logout|Sign In|Sign Out|Overview|Customers|Invoices|Orders|Warehouse|Tracking|Reports|Notifications)\s*</gi },
];

let issuesFound = 0;

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file);

  for (const pattern of suspectPatterns) {
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      // Ignore if in comments or test code
      const lineNum = content.substring(0, match.index).split('\n').length;
      console.log(`[${pattern.name}] in ${relPath}:${lineNum} -> "${match[0]}"`);
      issuesFound++;
    }
  }
}

console.log(`\nScan complete: Found ${issuesFound} suspect hardcoded patterns.`);
