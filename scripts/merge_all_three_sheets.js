const fs = require('fs');
const https = require('https');

function fetchCsv(gid) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/1wTLcx6HRR7Rc2uIq83g-DL0qI9uFVG1rgOyrmkIgzRU/gviz/tq?tqx=out:csv&gid=${gid}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function mergeAllSheets() {
  const gids = [
    { gid: '1846649110', name: 'In-Transit Manifest' },
    { gid: '1278970975', name: 'Active Client Consignments' },
    { gid: '1325188462', name: 'Master Historical Ledger' }
  ];

  const allShipmentsMap = new Map();
  const accountStats = {};

  for (const item of gids) {
    const csvData = await fetchCsv(item.gid);
    const lines = csvData.split('\n').filter(l => l.trim().length > 0);
    
    // Parse CSV handling quotes
    const parseCsvLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += c;
        }
      }
      result.push(current.trim());
      return result;
    };

    lines.forEach((line, idx) => {
      if (idx === 0) return; // Skip header
      const cols = parseCsvLine(line);
      if (cols.length < 4 || !cols[2]) return;

      const date = cols[0] || '2026-08-01';
      const statusRaw = cols[1] || 'Delivered';
      const awb = cols[2];
      if (allShipmentsMap.has(awb)) return; // Avoid duplicate AWB across sheets

      const account = cols[3] || 'General Client';
      const receiverName = cols[4] || 'Valued Consignee';
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
      const agentName = cols[19] || 'مصطفي';
      const opNote = cols[23] || cols[22] || '';

      // Normalize Carrier
      let carrier = 'FedEx Priority';
      const cUpper = carrierRaw.toUpperCase();
      if (cUpper.includes('SMSA')) carrier = 'SMSA Express';
      else if (cUpper.includes('FEDEX')) carrier = 'FedEx Priority';
      else if (cUpper.includes('DHL')) carrier = 'DHL Express';
      else if (cUpper.includes('ARAMEX')) carrier = 'Aramex Air';
      else if (cUpper.includes('LAND')) carrier = 'XSPEED Express';

      // Normalize Status to exact Sheet terminology or Standard Enum
      let status = 'In Transit';
      const sLower = statusRaw.toLowerCase();
      if (sLower.includes('deliverd') || sLower.includes('delivered')) status = 'Delivered';
      else if (sLower.includes('rto') || sLower.includes('re export')) status = 'Exception';
      else if (sLower.includes('clearance') || sLower.includes('cairo airport')) status = 'Delayed';
      else if (sLower.includes('destination') || sLower.includes('in the way') || sLower.includes('information recived')) status = 'In Transit';

      const shipmentRecord = {
        id: `shp-all-${allShipmentsMap.size + 1}`,
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
        statusRaw,
        contents,
        originHub: 'Cairo Gateway (CAI)',
        destinationHub: `${country} Hub`,
        currentLocation: statusRaw,
        serviceType: 'Next-Day Air',
        timeline: [
          { status: 'Shipment Registered', location: 'Cairo Gateway', timestamp: date, completed: true },
          { status: statusRaw, location: country, timestamp: date, completed: status === 'Delivered', current: true },
        ]
      };

      allShipmentsMap.set(awb, shipmentRecord);

      // Track account stats
      if (!accountStats[account]) {
        accountStats[account] = {
          name: account,
          shipmentsCount: 0,
          totalSpentEgp: 0,
          country: country,
        };
      }
      accountStats[account].shipmentsCount += 1;
      accountStats[account].totalSpentEgp += sellingPrice;
    });
  }

  const allShipments = Array.from(allShipmentsMap.values());

  // Generate Customers from all real sheet accounts
  const customers = Object.keys(accountStats).map((accName, idx) => {
    const stat = accountStats[accName];
    return {
      id: `cust-all-${idx + 1}`,
      name: accName,
      company: accName,
      email: `contact@${accName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: `+20 12${Math.floor(10000000 + Math.random() * 90000000)}`,
      code: `ACC-${8800 + idx + 1}`,
      address: `${stat.country} Main Commercial District`,
      country: stat.country,
      tier: stat.totalSpentEgp > 10000 ? 'VIP Platinum' : 'Enterprise Gold',
      totalShipments: stat.shipmentsCount,
      activeShipments: 0,
      totalSpentUsd: Math.round(stat.totalSpentEgp / 31),
      spentEgp: stat.totalSpentEgp,
      status: 'Active',
      joinDate: '2026-05-01',
      primaryContact: `${accName} Logistics Representative`,
      discountRate: 15,
    };
  });

  // Generate Invoices from all real sheet accounts
  const invoices = Object.keys(accountStats).map((accName, idx) => {
    const stat = accountStats[accName];
    const totalAmount = stat.totalSpentEgp;
    return {
      id: `inv-all-${idx + 1}`,
      invoiceNumber: `INV-2026-${8000 + idx + 1}`,
      customerId: `cust-all-${idx + 1}`,
      companyName: accName,
      issueDate: '2026-08-01',
      dueDate: '2026-08-30',
      amount: Math.round(totalAmount / 1.14),
      vatAmount: Math.round(totalAmount - (totalAmount / 1.14)),
      customsDuties: 0,
      totalAmount: totalAmount,
      currency: 'EGP',
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      shipmentsCount: stat.shipmentsCount,
      downloadUrl: '#',
    };
  });

  console.log(`Merged ${allShipments.length} unique shipments across all 3 sheets.`);
  console.log(`Generated ${customers.length} real client accounts:`, Object.keys(accountStats));

  // Update adminData.ts
  const adminDataTsPath = 'src/lib/adminData.ts';
  let code = fs.readFileSync(adminDataTsPath, 'utf8');

  code = code.replace(/export const initialShipments: Shipment\[\] = \[[\s\S]*?\];\n\nexport const initialOrders/, `export const initialShipments: Shipment[] = ${JSON.stringify(allShipments, null, 2)};\n\nexport const initialOrders`);
  code = code.replace(/export const initialCustomers: Customer\[\] = \[[\s\S]*?\];\n\nexport const initialInvoices/, `export const initialCustomers: Customer[] = ${JSON.stringify(customers, null, 2)};\n\nexport const initialInvoices`);
  code = code.replace(/export const initialInvoices: Invoice\[\] = \[[\s\S]*?\];\n\nexport const initialWarehouseItems/, `export const initialInvoices: Invoice[] = ${JSON.stringify(invoices, null, 2)};\n\nexport const initialWarehouseItems`);

  fs.writeFileSync(adminDataTsPath, code, 'utf8');
  console.log('Successfully updated adminData.ts with consolidated multi-sheet data!');
}

mergeAllSheets();
