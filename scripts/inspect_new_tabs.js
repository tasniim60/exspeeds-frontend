const https = require('https');

function fetchFollow(url, cb) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      fetchFollow(res.headers.location, cb);
    } else {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => cb(res.statusCode, data));
    }
  });
}

const gids = [1846649110, 1278970975, 1325188462];

gids.forEach(gid => {
  const url = `https://docs.google.com/spreadsheets/d/1wTLcx6HRR7Rc2uIq83g-DL0qI9uFVG1rgOyrmkIgzRU/export?format=csv&gid=${gid}`;
  fetchFollow(url, (status, data) => {
    console.log(`\n=================== GID ${gid} (Status: ${status}) ===================`);
    if (status === 200 && !data.includes('<!DOCTYPE html>')) {
      const lines = data.split('\n');
      console.log(`Total Rows: ${lines.length}`);
      console.log('--- Header Lines (First 5) ---');
      lines.slice(0, 8).forEach((l, i) => console.log(`Row ${i+1}: ${l.slice(0, 120)}`));
    } else {
      console.log('Failed to fetch CSV or non-public GID:', data.slice(0, 200));
    }
  });
});
