const fs = require('fs');
const path = require('path');

const csvPath = 'C:/Users/TAMER/.gemini/antigravity/brain/24eae2e2-04a2-45dd-afcb-21cf3726525f/.system_generated/steps/135/content.md';
const content = fs.readFileSync(csvPath, 'utf8');

const lines = content.split('\n').filter(l => l.trim().length > 0);
// Skip title/description headers up to column header line
const headerIdx = lines.findIndex(l => l.includes('التاريخ') && l.includes('رقم البوليصة'));
if (headerIdx === -1) {
  console.error('Header not found');
  process.exit(1);
}

const dataLines = lines.slice(headerIdx + 1);

const shipments = [];

dataLines.forEach((line, idx) => {
  const cols = line.split(',').map(c => c.trim());
  if (cols.length < 5 || !cols[2]) return;

  const date = cols[0] || '2026-08-01';
  const statusRaw = cols[1] || 'Delivered';
  const awb = cols[2];
  const account = cols[3] || 'General';
  const receiverName = cols[4] || 'Valued Customer';
  const contents = cols[5] || 'Package';
  const country = cols[6] || 'Saudi Arabia';
  const carrierRaw = cols[7] || 'FEDEX';
  const broker = cols[8] || 'NOK';
  const actualWeight = parseFloat(cols[9]) || 1.0;
  const length = parseFloat(cols[10]) || 10;
  const width = parseFloat(cols[11]) || 10;
  const height = parseFloat(cols[12]) || 10;
  const volumetricWeight = parseFloat(cols[13]) || Math.round((length * width * height / 5000) * 10) / 10;
  const finalWeight = parseFloat(cols[14]) || Math.max(actualWeight, volumetricWeight);
  const costPrice = parseFloat(cols[15]) || 0;
  const sellingPrice = parseFloat(cols[16]) || costPrice;
  const transExpense = parseFloat(cols[17]) || 0;
  const netProfit = parseFloat(cols[18]) || (sellingPrice - costPrice - transExpense);
  const agentName = cols[19] || 'System';
  const opNote = cols[23] || cols[22] || '';

  // Map carrier
  let carrier = 'FedEx Priority';
  const cUpper = carrierRaw.toUpperCase();
  if (cUpper.includes('SMSA')) carrier = 'SMSA Express';
  else if (cUpper.includes('FEDEX')) carrier = 'FedEx Priority';
  else if (cUpper.includes('DHL')) carrier = 'DHL Express';
  else if (cUpper.includes('ARAMEX')) carrier = 'Aramex Air';
  else if (cUpper.includes('LAND')) carrier = 'XSPEED Express';

  // Map status
  let status = 'Delivered';
  const sUpper = statusRaw.toUpperCase();
  if (sUpper.includes('RTO')) status = 'Exception';
  else if (sUpper.includes('CLEARANCE') || sUpper.includes('CLERANCE')) status = 'Delayed';
  else if (sUpper.includes('DELIVERD') || sUpper.includes('DELIVERED')) status = 'Delivered';
  else if (sUpper.includes('RE EXPORT')) status = 'Exception';

  shipments.push({
    id: `shp-sheet-${idx + 1}`,
    awb,
    date,
    account,
    company: account,
    senderName: 'XSPEED Central Gateway',
    senderCity: 'Cairo, Egypt',
    receiverName,
    receiverCity: country.split(' ')[0] || 'Main City',
    country,
    carrier,
    broker,
    weight: finalWeight,
    actualWeight,
    length,
    width,
    height,
    volumetricWeight,
    dim: `${length}x${width}x${height} cm`,
    priceEgp: sellingPrice,
    priceUsd: Math.round(sellingPrice / 31),
    costPrice,
    sellingPrice,
    transExpense,
    netProfit,
    agentName,
    opNote,
    status,
    contents,
    originHub: 'Cairo Gateway (CAI)',
    destinationHub: `${country} Central Hub`,
    currentLocation: status === 'Delivered' ? 'Delivered to Consignee' : 'In Transit via Carrier Network',
    serviceType: 'Next-Day Air',
    timeline: [
      { status: 'Shipment Created', location: 'Cairo Gateway', timestamp: date, completed: true },
      { status: status === 'Delivered' ? 'Delivered to Consignee' : 'In Transit', location: country, timestamp: date, completed: status === 'Delivered', current: true },
    ]
  });
});

console.log(`Parsed ${shipments.length} shipments.`);
fs.writeFileSync(path.join(__dirname, 'parsed_shipments.json'), JSON.stringify(shipments, null, 2));
