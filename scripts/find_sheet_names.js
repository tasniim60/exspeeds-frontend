const fs = require('fs');

const content = fs.readFileSync('C:/Users/TAMER/.gemini/antigravity/brain/24eae2e2-04a2-45dd-afcb-21cf3726525f/.system_generated/steps/175/content.md', 'utf8');

// Look for gids or sheet names
const gids = [...content.matchAll(/gid[=\":](\d+)/g)].map(m => m[1]);
const uniqueGids = Array.from(new Set(gids));
console.log('Found GIDs:', uniqueGids);

// Look for Arabic or English sheet names near gid
const regex = /\[\d+,\"([^\"]+)\",\d+,\d+,\d+,\d+,\d+\]/g;
const matches = [...content.matchAll(regex)];
console.log('Matches:', matches.map(m => m[1]));

// Search for any occurrence of "sheet" or tab titles
const titles = [...content.matchAll(/\"([^\"]+)\",\s*\[\s*\"[^\"]*\"\s*\]/g)];
console.log('Titles count:', titles.length);
