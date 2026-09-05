const path = require('path');

// We can compile/import the dictionaries directly via TS execution or simple parsing
const fs = require('fs');

const enFilePath = path.join(__dirname, '..', 'src', 'locales', 'en.ts');
const arFilePath = path.join(__dirname, '..', 'src', 'locales', 'ar.ts');

function parseDictKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match all property keys like `foo:` or `"foo":`
  const lines = content.split('\n');
  const keys = [];
  const stack = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
    
    // Check if line opens an object: e.g. "admin: {" or "common: {"
    const objMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*:\s*\{/);
    if (objMatch) {
      stack.push(objMatch[1]);
      continue;
    }
    
    // Check if line closes an object: e.g. "}," or "}"
    if (trimmed.startsWith('}') || trimmed.startsWith('},')) {
      stack.pop();
      continue;
    }

    // Check key value pair: e.g. "title: 'foo'," or "searchPlaceholder: 'bar',"
    const kvMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*:\s*["'`]/);
    if (kvMatch) {
      const fullPath = [...stack, kvMatch[1]].join('.');
      keys.push(fullPath);
    }
  }
  return keys;
}

const enKeys = parseDictKeys(enFilePath);
const arKeys = parseDictKeys(arFilePath);

console.log('==================================================');
console.log('DEEP NESTED LOCALIZATION AUDIT');
console.log('==================================================');
console.log(`Total English Nested Keys: ${enKeys.length}`);
console.log(`Total Arabic Nested Keys:  ${arKeys.length}`);

const missingInAr = enKeys.filter(k => !arKeys.includes(k));
const missingInEn = arKeys.filter(k => !enKeys.includes(k));

if (missingInAr.length > 0) {
  console.error(`❌ ${missingInAr.length} Missing keys in Arabic dictionary:`);
  console.error(missingInAr.slice(0, 20));
  process.exit(1);
} else {
  console.log(`✅ 100% Dictionary Key Parity: All ${enKeys.length} keys exist in Arabic!`);
}

if (missingInEn.length > 0) {
  console.log(`ℹ️ Arabic has ${missingInEn.length} extra keys (if any).`);
}

console.log('==================================================');
console.log('AUDIT RESULT: 100% PASS');
console.log('==================================================');
