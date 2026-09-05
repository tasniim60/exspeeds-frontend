const ts = require('typescript');
const fs = require('fs');
const path = require('path');

function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const module = { exports: {} };
  const fn = new Function('module', 'exports', 'require', transpiled);
  fn(module, module.exports, (mod) => {
    if (mod === './en') return loadTsModule(path.join(path.dirname(filePath), 'en.ts'));
    return require(mod);
  });
  return module.exports;
}

const enMod = loadTsModule(path.join(__dirname, '../src/locales/en.ts'));
const arMod = loadTsModule(path.join(__dirname, '../src/locales/ar.ts'));

const en = enMod.en;
const ar = arMod.ar;

console.log("Successfully loaded EN and AR dictionaries!");

function getFlatKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...getFlatKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(getFlatKeys(en));
const arKeys = new Set(getFlatKeys(ar));

console.log(`Total keys in EN: ${enKeys.size}`);
console.log(`Total keys in AR: ${arKeys.size}`);

const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
const missingInEn = [...arKeys].filter(k => !enKeys.has(k));

if (missingInAr.length > 0) {
  console.log("\n❌ Keys in EN but MISSING in AR:", missingInAr);
} else {
  console.log("\n✅ All EN keys exist in AR!");
}

if (missingInEn.length > 0) {
  console.log("\n❌ Keys in AR but MISSING in EN:", missingInEn);
} else {
  console.log("✅ All AR keys exist in EN!");
}
