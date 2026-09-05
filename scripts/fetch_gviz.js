const https = require('https');

function fetchGviz(gid) {
  const url = `https://docs.google.com/spreadsheets/d/1wTLcx6HRR7Rc2uIq83g-DL0qI9uFVG1rgOyrmkIgzRU/gviz/tq?tqx=out:csv&gid=${gid}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`\n=================== GID ${gid} (Status: ${res.statusCode}) ===================`);
      const lines = data.split('\n');
      console.log(`Lines count: ${lines.length}`);
      lines.slice(0, 10).forEach((l, i) => console.log(`Line ${i+1}: ${l.slice(0, 150)}`));
    });
  });
}

fetchGviz(1846649110);
fetchGviz(1278970975);
fetchGviz(1325188462);
