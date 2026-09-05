const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function getAllFiles(dir, exts = ['.tsx']) {
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

const files = getAllFiles(srcDir).filter(f => !f.includes('ui/'));

const commonWords = [
  "Submit", "Save", "Cancel", "Delete", "Edit", "Create", "Search", "Filter", "All",
  "Back", "Next", "Close", "Refresh", "Actions", "Status", "Date", "Details", "Export",
  "Download", "Upload", "View", "Print", "Loading...", "Please wait...", "Success",
  "Error", "Pending", "Active", "Completed", "Delivered", "Cancelled", "In Transit",
  "Origin", "Destination", "Carrier", "Tracking Number", "Weight", "Volume", "Dimensions",
  "Total", "Subtotal", "Discount", "Tax", "Price", "Amount", "Paid", "Unpaid", "Overdue"
];

const results = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file);

  // Check for common words directly inside JSX tags e.g. >Submit< or > Cancel <
  for (const word of commonWords) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`>\\s*(${escaped})\\s*<`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      results.push({ file: relPath, line: lineNum, word, type: 'JSX Text' });
    }
  }
}

console.log(`Deep scan found ${results.length} hardcoded common UI words across ${files.length} components:\n`);
results.forEach(r => console.log(`- [${r.type}] ${r.file}:${r.line} -> "${r.word}"`));
