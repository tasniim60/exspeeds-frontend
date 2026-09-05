const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/1wTLcx6HRR7Rc2uIq83g-DL0qI9uFVG1rgOyrmkIgzRU/edit';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Search for sheet names and gids in bootstrap data
    const matches = [...data.matchAll(/\"([^\"]+)\",\d+,\d+,\d+,\"[^\"]*\",(\d+)/g)];
    console.log('Matches count:', matches.length);
    matches.forEach(m => console.log('Sheet Name:', m[1], 'GID:', m[2]));

    // Also search for sheetData or sheet names directly
    const sheetNames = [...data.matchAll(/\"name\":\"([^\"]+)\"/g)];
    console.log('Sheet names found:', sheetNames.map(s => s[1]));
    
    // Search for tab names in HTML/script
    const tabMatches = [...data.matchAll(/\[\d+,\d+,\"([^\"]+)\",\d+/g)];
    console.log('Tab matches:', tabMatches.map(t => t[1]));
  });
}).on('error', (e) => {
  console.error(e);
});
