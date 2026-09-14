export interface ShipmentRequest {
  id: string;
  requestNumber: string; // e.g. REQ-10254
  customerId?: string;
  customerName: string;
  companyName: string;
  serviceId?: string;
  serviceTitle?: string;
  phone: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;
  address: string;
  
  // Pickup Info
  pickupCountry: string;
  pickupCity: string;
  pickupAddress: string;
  pickupContactName: string;
  pickupContactPhone: string;
  preferredPickupDate: string;
  pickupNotes?: string;
  
  // Delivery Info
  deliveryCountry: string;
  deliveryCity: string;
  deliveryShortAddress?: string;
  deliveryAddress: string;
  consigneeName: string;
  consigneePhone: string;
  deliveryNotes?: string;

  // Shipment Info
  shipmentType: "Documents" | "Parcel" | "Commercial Goods" | "Other";
  contents: string;
  packageCount: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  declaredValue?: number;
  isFragile?: boolean;
  isTemperatureControlled?: boolean;
  specialInstructions?: string;

  // Pricing & Status (Broker Model: Admin sets agreed price and currency upon approval)
  agreedPrice?: string | number;
  quotedPrice?: string; // Kept for backwards compatibility
  currency?: "EGP" | "USD" | "EUR" | "SAR" | "AED" | "GBP" | string;
  status: "New" | "Contacted" | "Approved" | "Converted to Shipment" | "Cancelled" | "Price Sent" | "Awaiting Customer Response" | "Customer Confirmed";
  createdAt: string;
  updatedAt: string;
  internalNotes?: string;
  linkedAwb?: string;

  // Audit Trail Timestamps
  contactedAt?: string;
  approvedAt?: string;
  priceSentAt?: string;
  customerConfirmedAt?: string;
  convertedAt?: string;
}

export interface Shipment {
  id: string;
  awb: string;
  date: string;
  account: string;
  company: string;
  senderName: string;
  senderCity: string;
  receiverName: string;
  receiverCity: string;
  country: string;
  carrier: "XSPEED Express" | "DHL Express" | "FedEx Priority" | "Aramex Air" | "UPS Worldwide" | "SMSA Express" | string;
  broker?: string; // e.g. XSpeed, NOK
  weight: number; // Final Chargeable Weight in kg
  actualWeight?: number;
  length: number;
  width: number;
  height: number;
  volumetricWeight: number;
  dim: string;
  priceEgp: number;
  priceUsd: number;
  costPrice?: number;
  sellingPrice?: number;
  transExpense?: number;
  netProfit?: number;
  agentName?: string; // Created By (مصطفي / بسمة / ...)
  opNote?: string; // Operational alert note
  contents?: string; // Shipment contents / package description
  status: "In Transit" | "Delivered" | "Out for Delivery" | "Delayed" | "Exception" | "Pending Pickup" | string;
  originHub: string;
  destinationHub: string;
  currentLocation: string;
  serviceType: "Next-Day Air" | "Same-Day Courier" | "Express Cargo" | "Economy Ground";
  driverName?: string;
  driverPhone?: string;
  driverPlate?: string;
  temperature?: number;
  notes?: string;
  timeline: {
    status: string;
    location: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
    note?: string;
  }[];
}

/**
 * Calculates Volumetric Weight: (Length * Width * Height) / 5000
 */
export function calculateVolumetricWeight(l: number = 0, w: number = 0, h: number = 0): number {
  if (!l || !w || !h) return 0;
  return Math.round(((l * w * h) / 5000) * 10) / 10;
}

/**
 * Calculates Final Chargeable Weight: Max(Actual Weight, Volumetric Weight)
 */
export function calculateChargeableWeight(actual: number = 0, volumetric: number = 0): number {
  return Math.max(actual || 0, volumetric || 0);
}

/**
 * Calculates Net Operating Profit: Selling Price - Cost Price - Trans Expense
 */
export function calculateNetProfit(sellingPrice: number = 0, costPrice: number = 0, transExpense: number = 0): number {
  return (sellingPrice || 0) - (costPrice || 0) - (transExpense || 0);
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  companyName: string;
  date: string;
  targetDeliveryDate: string;
  items: {
    name: string;
    qty: number;
    weight: number;
  }[];
  totalWeight: number;
  totalAmount: number;
  currency: "USD" | "EGP";
  status: "New Bookings" | "Processing" | "Ready for Dispatch" | "In-Transit" | "Delivered" | "Cancelled";
  priority: "High Priority" | "Express 24H" | "Standard 48H" | "Economy";
  paymentStatus: "Paid" | "Unpaid" | "COD" | "Net 30";
  pickupAddress: string;
  deliveryAddress: string;
  linkedAwb?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  tier: "Enterprise VIP" | "Corporate Partner" | "Standard Shipper";
  creditLimit: number;
  currentBalance: number;
  totalShipments: number;
  lifetimeSpend: number;
  taxRegistrationNumber: string;
  assignedManager: string;
  activeContracts: number;
  joinedDate: string;
  status: "Active" | "Under Review" | "Suspended";
}

export interface WarehouseItem {
  id: string;
  sku: string;
  name: string;
  category: "Electronics" | "Automotive Parts" | "Pharmaceuticals" | "Apparel" | "Industrial" | "Documents";
  quantity: number;
  unitWeight: number;
  totalWeight: number;
  warehouseId: "cairo" | "alexandria" | "dubai" | "riyadh";
  zone: string;
  bayLocation: string; // e.g. "Rack A-04 / Shelf 3"
  inboundDate: string;
  dwellDays: number;
  status: "Stored" | "In Staging" | "Dispatched" | "Quarantined" | "Reserved";
  temperatureZone: "Ambient" | "Cold Chain (2-8°C)" | "Frozen (-20°C)" | "Secure Vault";
}

export interface WarehouseFacility {
  id: "cairo" | "alexandria" | "dubai" | "riyadh";
  name: string;
  city: string;
  country: string;
  totalCapacitySqM: number;
  capacityUtilizationPct: number;
  activePallets: number;
  totalBays: number;
  occupiedBays: number;
  temperatureCelsius: number;
  activeStaff: number;
  dockDoors: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  companyName: string;
  customerTaxNumber: string;
  linkedAwbs: string[];
  subtotal: number;
  fuelSurcharge: number;
  customsDuties: number;
  vatRate: number; // 14%
  vatAmount: number;
  discount: number;
  totalAmount: number;
  currency: "USD" | "EGP";
  status: "Paid" | "Pending" | "Overdue" | "Draft" | "Refunded";
  paymentMethod?: "Bank Wire" | "Corporate Credit" | "Cash on Delivery" | "Credit Card";
  paidDate?: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "success" | "info";
  category: "shipment" | "order" | "warehouse" | "invoice" | "system";
  timestamp: string;
  isRead: boolean;
  targetTab: string;
  referenceId?: string;
}

export interface BusinessExpense {
  id: string;
  title: string;
  category: "Rent & Facilities" | "Salaries & Operations" | "Fuel & Linehaul" | "Packaging & Supplies" | "Customs & Port Demurrage" | "Software & Marketing" | "Other" | string;
  amount: number;
  currency: "EGP" | "USD";
  date: string; // ISO date string e.g. "2026-08-15"
  notes?: string;
  receiptNumber?: string;
  payingAccount?: string; // e.g. "CIB account", "speedex wallet", "el rawy", "hussein", "dabash"
  recorder?: string; // e.g. "مصطفى", "بسمة", "ضبش", "الراوي", "حسين"
  paymentMethod?: string; // e.g. "نقدي", "تحويل بنكي", "محفظة إلكترونية", "بطاقة"
  allocatedClient?: string; // e.g. Client name for client split
  linkedAwb?: string; // e.g. Linked AWB for extra shipment surcharge
  expenseNature?: "general" | "shipment_extra"; // General operational expense vs Extra shipment fee
}

/**
 * Customer Collection Record (سند تحصيل عميل)
 * Records cash/wire/wallet collections received from a client, credited to a specific treasury account.
 * Crucial for calculating real-time customer balance and treasury inflows.
 */
export interface CustomerCollection {
  id: string;
  customerId?: string;
  clientName: string; // matches customer account / company / name
  amount: number;
  currency: "EGP" | "USD";
  date: string; // ISO date string e.g. "2026-08-20"
  receivingAccount: string; // One of MASTER_FINANCIAL_ACCOUNTS: CIB account, speedex wallet, el rawy, hussein, dabash
  paymentMethod: string; // Cash, Bank Wire, Wallet, Card
  receiptNumber?: string;
  recordedBy: string; // One of MASTER_AGENTS: مصطفي, بسمة, ضبش, الراوي, حسين
  notes?: string;
}

export interface CustomerBalanceDetails {
  totalSales: number;
  extraExpenses: number;
  rtoSales: number;
  totalCollected: number;
  netBalance: number;
  shipmentCount: number;
  rtoCount: number;
}

/**
 * Calculates Customer Balance according to legacy Google Apps Script sheet (00_مراقبة_العملاء_والشركات):
 * Balance (Charge) = (Total Sales of all shipments + Extra expenses linked to client)
 *                  - (Total Sales of RTO shipments only)
 *                  - (Total Collections actually received from client)
 */
export function calculateCustomerBalance(
  customerIdentifier: { id?: string; name?: string; company?: string; code?: string } | string,
  shipments: Shipment[] = [],
  expenses: BusinessExpense[] = [],
  collections: CustomerCollection[] = []
): CustomerBalanceDetails {
  const candidateNames = new Set<string>();

  if (typeof customerIdentifier === "string") {
    const trimmed = customerIdentifier.trim().toLowerCase();
    if (trimmed) candidateNames.add(trimmed);
  } else if (customerIdentifier) {
    if (customerIdentifier.id) candidateNames.add(customerIdentifier.id.trim().toLowerCase());
    if (customerIdentifier.name) candidateNames.add(customerIdentifier.name.trim().toLowerCase());
    if (customerIdentifier.company) candidateNames.add(customerIdentifier.company.trim().toLowerCase());
    if (customerIdentifier.code) candidateNames.add(customerIdentifier.code.trim().toLowerCase());
  }

  const isMatching = (val?: string) => {
    if (!val) return false;
    const v = val.trim().toLowerCase();
    return candidateNames.has(v);
  };

  // 1. Shipments belonging to this customer
  const matchedShipments = shipments.filter((s) => {
    return isMatching(s.account) || isMatching(s.company) || isMatching(s.senderName);
  });

  const matchedAwbs = new Set(matchedShipments.map((s) => s.awb.trim()));

  let totalSales = 0;
  let rtoSales = 0;
  let rtoCount = 0;

  for (const s of matchedShipments) {
    const salePrice = Number(s.sellingPrice !== undefined ? s.sellingPrice : (s.priceEgp || 0));
    totalSales += salePrice;

    const statusNorm = (s.status || "").trim().toUpperCase();
    if (
      statusNorm === "RTO" ||
      statusNorm === "RETURN TO ORIGIN" ||
      statusNorm === "RETURNED" ||
      statusNorm === "REFUSED TO RECIVE" ||
      statusNorm === "REFUSED TO RECEIVE" ||
      statusNorm === "RE EXPORT"
    ) {
      rtoSales += salePrice;
      rtoCount++;
    }
  }

  // 2. Extra expenses linked to customer directly or via matched AWB
  let extraExpenses = 0;
  for (const exp of expenses) {
    const matchesClient = isMatching(exp.allocatedClient);
    const matchesAwb = exp.linkedAwb && matchedAwbs.has(exp.linkedAwb.trim());
    if (matchesClient || matchesAwb) {
      extraExpenses += Number(exp.amount || 0);
    }
  }

  // 3. Collections recorded for this customer
  let totalCollected = 0;
  for (const col of collections) {
    const matchesClient = isMatching(col.clientName) || (col.customerId && isMatching(col.customerId));
    if (matchesClient) {
      totalCollected += Number(col.amount || 0);
    }
  }

  const netBalance = Math.round(((totalSales + extraExpenses) - rtoSales - totalCollected) * 100) / 100;

  return {
    totalSales: Math.round(totalSales * 100) / 100,
    extraExpenses: Math.round(extraExpenses * 100) / 100,
    rtoSales: Math.round(rtoSales * 100) / 100,
    totalCollected: Math.round(totalCollected * 100) / 100,
    netBalance,
    shipmentCount: matchedShipments.length,
    rtoCount,
  };
}

/**
 * ── Carrier & Broker Transfer (سند سداد لشركة شحن أو وسيط) ──
 * Records payments made to linehaul carriers (FEDEX, Aramex, Express, SMSA, sonbola, Azab, NOK)
 * from company vaults/accounts. Crucial for Carrier Balance Ledger (Columns H:O in legacy sheets).
 */
export interface CarrierTransfer {
  id: string;
  carrier: string; // e.g. "Express", "FEDEX", "Aramex", "SMSA Express", "sonbola", "Azab", "NOK"
  amount: number;
  currency: "EGP" | "USD";
  date: string; // ISO date string e.g. "2026-08-18"
  payingAccount: string; // One of MASTER_FINANCIAL_ACCOUNTS: CIB account, speedex wallet, el rawy, hussein, dabash
  paymentMethod: string; // Bank Wire, Cash, Wallet, Check
  referenceNumber?: string;
  recordedBy: string; // One of MASTER_AGENTS
  notes?: string;
}

export interface CarrierBalanceDetails {
  carrier: string;
  isBroker: boolean;
  shipmentCount: number;
  rtoCount: number;
  totalCost: number;
  rtoCost: number;
  netCost: number; // totalCost - rtoCost
  totalPaid: number;
  dueBalance: number; // netCost - totalPaid
}

/**
 * Calculates Carrier & Broker Balances according to legacy Excel sheet columns H:O:
 * Net Cost = Total Cost - RTO Cost
 * Due Balance = Net Cost - Total Paid (Carrier Transfers)
 */
export function calculateCarrierBalances(
  shipments: Shipment[] = [],
  transfers: CarrierTransfer[] = []
): CarrierBalanceDetails[] {
  // Aggregate all distinct carriers & brokers from MASTER lists and shipments
  const carrierNames = new Set<string>();
  MASTER_CARRIERS.forEach((c) => carrierNames.add(c));
  MASTER_BROKERS.forEach((b) => carrierNames.add(b));

  for (const s of shipments) {
    if (s.carrier && s.carrier.trim()) carrierNames.add(s.carrier.trim());
    if (s.broker && s.broker.trim()) carrierNames.add(s.broker.trim());
  }

  const brokerSet = new Set(MASTER_BROKERS.map((b) => b.toLowerCase().trim()));

  const results: CarrierBalanceDetails[] = [];

  for (const name of Array.from(carrierNames)) {
    const nameNorm = name.toLowerCase().trim();
    if (!nameNorm || nameNorm === "other" || nameNorm === "null" || nameNorm === "undefined") continue;

    // Shipments where carrier or broker matches
    const matchedShipments = shipments.filter((s) => {
      const c = (s.carrier || "").toLowerCase().trim();
      const b = (s.broker || "").toLowerCase().trim();
      return c === nameNorm || b === nameNorm;
    });

    let totalCost = 0;
    let rtoCost = 0;
    let rtoCount = 0;

    for (const s of matchedShipments) {
      const cost = Number(s.costPrice || 0);
      totalCost += cost;

      const st = (s.status || "").toUpperCase().trim();
      if (
        st === "RTO" ||
        st === "RETURN TO ORIGIN" ||
        st === "RETURNED" ||
        st === "REFUSED TO RECIVE" ||
        st === "REFUSED TO RECEIVE" ||
        st === "RE EXPORT"
      ) {
        rtoCost += cost;
        rtoCount++;
      }
    }

    // Transfers paid to this carrier
    let totalPaid = 0;
    for (const tr of transfers) {
      if ((tr.carrier || "").toLowerCase().trim() === nameNorm) {
        totalPaid += Number(tr.amount || 0);
      }
    }

    const netCost = Math.round((totalCost - rtoCost) * 100) / 100;
    const dueBalance = Math.round((netCost - totalPaid) * 100) / 100;

    results.push({
      carrier: name,
      isBroker: brokerSet.has(nameNorm),
      shipmentCount: matchedShipments.length,
      rtoCount,
      totalCost: Math.round(totalCost * 100) / 100,
      rtoCost: Math.round(rtoCost * 100) / 100,
      netCost,
      totalPaid: Math.round(totalPaid * 100) / 100,
      dueBalance,
    });
  }

  // Sort by highest due balance descending
  return results.sort((a, b) => b.dueBalance - a.dueBalance);
}

/**
 * ── Internal Vault Transfer (مناقلة داخلية بين الخزائن والعهد) ──
 * Moves liquid money from one company account/custody to another (e.g. CIB -> el rawy custody).
 */
export interface InternalTransfer {
  id: string;
  fromAccount: string; // Source account from MASTER_FINANCIAL_ACCOUNTS
  toAccount: string; // Destination account from MASTER_FINANCIAL_ACCOUNTS
  amount: number;
  currency: "EGP" | "USD";
  date: string;
  fee?: number; // Wire / processing fee deducted from source
  referenceNumber?: string;
  recordedBy: string;
  notes?: string;
}

/**
 * ── Salary & Staff Advance (سند صرف مرتبات وسلف العاملين) ──
 */
export interface SalaryPayment {
  id: string;
  employeeName: string; // e.g. "مصطفي", "بسمة", "ضبش", "الراوي", "حسين"
  type: "salary" | "advance" | "bonus" | "deduction";
  amount: number;
  currency: "EGP" | "USD";
  date: string;
  payingAccount: string; // Account paid from
  period?: string; // e.g. "2026-08"
  recordedBy: string;
  notes?: string;
}

/**
 * ── Invoice Loss / Claim (خسارة فاتورة / مطالبة شحنة) ──
 * Attributed directly to the month/date of the original AWB shipment to ensure accurate P&L.
 */
export interface InvoiceLoss {
  id: string;
  awb: string;
  clientName: string;
  lossAmount: number;
  currency: "EGP" | "USD";
  lossDate: string; // Date loss was recorded
  shipmentDate: string; // Date of the original AWB shipment (critical for Monthly P&L)
  reason: "damage" | "loss" | "customs_confiscation" | "penalty" | "pricing_error" | string;
  status: "deducted" | "pending_review" | "recovered";
  recordedBy?: string;
  notes?: string;
}

/**
 * Treasury & Multi-Vault State Summary (0_الخزينة_والميزانية)
 */
export interface TreasuryVaultSummary {
  accountName: string;
  accountType: "bank" | "wallet" | "custody";
  initialFloat: number;
  collectionsIn: number;
  transfersIn: number;
  expensesOut: number;
  carrierPaymentsOut: number;
  salariesOut: number;
  transfersOut: number;
  totalInflows: number;
  totalOutflows: number;
  currentBalance: number;
}

export interface CompanyTreasuryState {
  vaults: TreasuryVaultSummary[];
  totalCompanyCash: number;
  totalInflows: number;
  totalOutflows: number;
}

export const INITIAL_VAULT_FLOATS: Record<string, { type: "bank" | "wallet" | "custody"; float: number }> = {
  "CIB account": { type: "bank", float: 50000 },
  "speedex wallet": { type: "wallet", float: 15000 },
  "el rawy": { type: "custody", float: 10000 },
  "hussein": { type: "custody", float: 10000 },
  "dabash": { type: "custody", float: 10000 },
};

export function calculateTreasuryState(
  collections: CustomerCollection[] = [],
  carrierTransfers: CarrierTransfer[] = [],
  expenses: BusinessExpense[] = [],
  internalTransfers: InternalTransfer[] = [],
  salaries: SalaryPayment[] = []
): CompanyTreasuryState {
  const vaults: TreasuryVaultSummary[] = [];
  let totalCompanyCash = 0;
  let totalInflowsCombined = 0;
  let totalOutflowsCombined = 0;

  for (const acc of MASTER_FINANCIAL_ACCOUNTS) {
    const accNorm = acc.toLowerCase().trim();
    const config = INITIAL_VAULT_FLOATS[acc] || { type: "custody", float: 0 };

    // Inflow: Collections received into this vault
    let colIn = 0;
    for (const c of collections) {
      if ((c.receivingAccount || "").toLowerCase().trim() === accNorm) {
        colIn += Number(c.amount || 0);
      }
    }

    // Inflow: Internal transfers received into this vault
    let trIn = 0;
    for (const tr of internalTransfers) {
      if ((tr.toAccount || "").toLowerCase().trim() === accNorm) {
        trIn += Number(tr.amount || 0);
      }
    }

    // Outflow: Expenses paid from this vault
    let expOut = 0;
    for (const e of expenses) {
      if ((e.payingAccount || "").toLowerCase().trim() === accNorm) {
        expOut += Number(e.amount || 0);
      }
    }

    // Outflow: Carrier payments paid from this vault
    let carOut = 0;
    for (const ct of carrierTransfers) {
      if ((ct.payingAccount || "").toLowerCase().trim() === accNorm) {
        carOut += Number(ct.amount || 0);
      }
    }

    // Outflow: Salaries & advances paid from this vault
    let salOut = 0;
    for (const sal of salaries) {
      if ((sal.payingAccount || "").toLowerCase().trim() === accNorm) {
        salOut += Number(sal.amount || 0);
      }
    }

    // Outflow: Internal transfers sent out of this vault (+ transfer fees)
    let trOut = 0;
    for (const tr of internalTransfers) {
      if ((tr.fromAccount || "").toLowerCase().trim() === accNorm) {
        trOut += Number(tr.amount || 0) + Number(tr.fee || 0);
      }
    }

    const totalInflows = Math.round((colIn + trIn) * 100) / 100;
    const totalOutflows = Math.round((expOut + carOut + salOut + trOut) * 100) / 100;
    const currentBalance = Math.round((config.float + totalInflows - totalOutflows) * 100) / 100;

    totalCompanyCash += currentBalance;
    totalInflowsCombined += totalInflows;
    totalOutflowsCombined += totalOutflows;

    vaults.push({
      accountName: acc,
      accountType: config.type,
      initialFloat: config.float,
      collectionsIn: colIn,
      transfersIn: trIn,
      expensesOut: expOut,
      carrierPaymentsOut: carOut,
      salariesOut: salOut,
      transfersOut: trOut,
      totalInflows,
      totalOutflows,
      currentBalance,
    });
  }

  return {
    vaults,
    totalCompanyCash: Math.round(totalCompanyCash * 100) / 100,
    totalInflows: Math.round(totalInflowsCombined * 100) / 100,
    totalOutflows: Math.round(totalOutflowsCombined * 100) / 100,
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  date: string;
  status: "published" | "draft" | "scheduled" | "pending_translation";
  views: number;
  seoScore: number; // Rank Math SEO Score (0-100)
  focusKeyword: string;
  wordCount: number;
  wpEditUrl: string;
  content?: string;
  excerpt?: string;
  imageUrl?: string;
  lang?: "ar" | "en";
  translationOf?: string;
  translations?: Record<string, string | number>;
  deeplStatus?: "translated" | "pending_translation" | "failed" | "none";
  deeplError?: string;
}

// Real Initial Datasets (Empty by default for true operational data)
export const initialShipments: Shipment[] = [
  {
    "id": "shp-user-1",
    "awb": "875202433089",
    "date": "8/2/2026",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Manal shouiab elazmi",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 0.5,
    "actualWeight": 2,
    "length": 36,
    "width": 31,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "36x31x10 cm",
    "priceEgp": 2900,
    "priceUsd": 94,
    "costPrice": 2143,
    "sellingPrice": 2900,
    "transExpense": 0,
    "netProfit": 704,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "incense",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/2/2026",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-2",
    "awb": "875202548831",
    "date": "8/2/2026",
    "account": "sohib",
    "company": "sohib",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Md.Ifran Hossain",
    "receiverCity": "Bangladesh",
    "country": "Bangladesh",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 2.5,
    "actualWeight": 19,
    "length": 53,
    "width": 23,
    "height": 43,
    "volumetricWeight": 0.2,
    "dim": "53x23x43 cm",
    "priceEgp": 10995,
    "priceUsd": 355,
    "costPrice": 9559,
    "sellingPrice": 10995,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "2 metal key + Curtin",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Bangladesh Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/2/2026",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-3",
    "awb": "3079790173",
    "date": "8/2/2026 23:06:58",
    "account": "sohib",
    "company": "sohib",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Damko Sylla",
    "receiverCity": "France",
    "country": "France",
    "carrier": "DHL",
    "broker": "NOK",
    "weight": 0.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1700,
    "priceUsd": 55,
    "costPrice": 700,
    "sellingPrice": 1700,
    "transExpense": 0,
    "netProfit": 704,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Deliverd",
    "contents": "Yellow Metal Chain+box",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "France Central Hub",
    "currentLocation": "Deliverd to Consignee",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Deliverd",
        "location": "France",
        "timestamp": "8/2/2026 23:06:58",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-4",
    "awb": "3359649263",
    "date": "8/3/2026 13:24:20",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Mona Mahmoud Mohamed Wahba",
    "receiverCity": "Qatar",
    "country": "Qatar",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 0.5,
    "actualWeight": 2.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 2365,
    "priceUsd": 76,
    "costPrice": 1615,
    "sellingPrice": 2365,
    "transExpense": 0,
    "netProfit": 704,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Metal Accessories",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Qatar Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/3/2026 13:24:20",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-5",
    "awb": "6189130651",
    "date": "8/3/2026 13:26:47",
    "account": "amr dam8a",
    "company": "amr dam8a",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Laila Elqourashi",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 2.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1665,
    "priceUsd": 54,
    "costPrice": 1064,
    "sellingPrice": 1665,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Plastic rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/3/2026 13:26:47",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-6",
    "awb": "3359601383",
    "date": "8/3/2026 13:29:55",
    "account": "amr dam8a",
    "company": "amr dam8a",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Rasha abdallah",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 2.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1665,
    "priceUsd": 54,
    "costPrice": 1065,
    "sellingPrice": 1665,
    "transExpense": 0,
    "netProfit": 702,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Plastic Chain and pendant",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/3/2026 13:29:55",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-7",
    "awb": "6189115962",
    "date": "8/3/2026 13:34:19",
    "account": "amr dam8a",
    "company": "amr dam8a",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Bouhaja nadia",
    "receiverCity": "France",
    "country": "France",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 1.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1850,
    "priceUsd": 60,
    "costPrice": 1248,
    "sellingPrice": 1850,
    "transExpense": 0,
    "netProfit": 810,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Plastic rosarry",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "France Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/3/2026 13:34:19",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-8",
    "awb": "464982470",
    "date": "8/3/2026 13:36:15",
    "account": "amr dam8a",
    "company": "amr dam8a",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Nouf moufreh elkhaldi",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 4.7,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.612,
    "dim": "10x10x10 cm",
    "priceEgp": 1665,
    "priceUsd": 54,
    "costPrice": 1064,
    "sellingPrice": 1665,
    "transExpense": 0,
    "netProfit": 753,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Plastic hanging",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/3/2026 13:36:15",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-9",
    "awb": "875226966677",
    "date": "8/3/2026 14:40:26",
    "account": "7bat elzikr",
    "company": "7bat elzikr",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Mr. Hussein Al-Alawi",
    "receiverCity": "Bahrain",
    "country": "Bahrain",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 4.7,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.612,
    "dim": "10x10x10 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 893,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 753,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "7 rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Bahrain Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/3/2026 14:40:26",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-10",
    "awb": "9643961913",
    "date": "8/4/2026 16:39:56",
    "account": "amr dam8a",
    "company": "amr dam8a",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Mariem ali",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 1.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1614,
    "priceUsd": 52,
    "costPrice": 1063,
    "sellingPrice": 1614,
    "transExpense": 0,
    "netProfit": 810,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Information recived",
    "contents": "Silver necklace- plastic bracelet",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/4/2026 16:39:56",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-11",
    "awb": "1047962355",
    "date": "8/4/2026 16:41:25",
    "account": "amr dam8a",
    "company": "amr dam8a",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Fisal mohameed",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 4.7,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.612,
    "dim": "10x10x10 cm",
    "priceEgp": 1613,
    "priceUsd": 52,
    "costPrice": 1063,
    "sellingPrice": 1613,
    "transExpense": 0,
    "netProfit": 753,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Information recived",
    "contents": "Silver necklace- metal bracelet",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/4/2026 16:41:25",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-12",
    "awb": "1047971234",
    "date": "8/4/2026 16:43:08",
    "account": "amr dam8a",
    "company": "amr dam8a",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Jouanah elmotiri",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 4.7,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.612,
    "dim": "10x10x10 cm",
    "priceEgp": 1613,
    "priceUsd": 52,
    "costPrice": 1063,
    "sellingPrice": 1613,
    "transExpense": 0,
    "netProfit": 753,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Information recived",
    "contents": "Silver necklace",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/4/2026 16:43:08",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-13",
    "awb": "9644016152",
    "date": "8/4/2026 16:56:57",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Souad aldoujdaji",
    "receiverCity": "Italy",
    "country": "Italy",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 2,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1860,
    "priceUsd": 60,
    "costPrice": 1208,
    "sellingPrice": 1860,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Italy Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/4/2026 16:56:57",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-14",
    "awb": "9644008894",
    "date": "8/4/2026 17:12:39",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Hifa slman",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 1.638,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.7644,
    "dim": "10x10x10 cm",
    "priceEgp": 1715,
    "priceUsd": 55,
    "costPrice": 1064,
    "sellingPrice": 1715,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/4/2026 17:12:39",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-15",
    "awb": "1048006223",
    "date": "8/4/2026 17:14:42",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "nadia oubaid eloutabi",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "sonbola",
    "weight": 3,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 1.638,
    "dim": "10x10x10 cm",
    "priceEgp": 1715,
    "priceUsd": 55,
    "costPrice": 1064,
    "sellingPrice": 1715,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/4/2026 17:14:42",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-16",
    "awb": "9643976602",
    "date": "8/4/2026 17:24:12",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "johar soumia",
    "receiverCity": "USA",
    "country": "U.S.A.- UNITED STATES OF AMERICA",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 0.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 2205,
    "priceUsd": 71,
    "costPrice": 1555,
    "sellingPrice": 2205,
    "transExpense": 0,
    "netProfit": 601,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "USA Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/4/2026 17:24:12",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-17",
    "awb": "875294890661",
    "date": "8/4/2026 17:28:19",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "maysoon adnan",
    "receiverCity": "UAE",
    "country": "United Arab Emirates",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 3.1,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1380,
    "priceUsd": 45,
    "costPrice": 676,
    "sellingPrice": 1380,
    "transExpense": 0,
    "netProfit": 750,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "1 silver Rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "UAE Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/4/2026 17:28:19",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-18",
    "awb": "875354611160-DEL",
    "date": "8/5/2026 20:31:51",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Qusay Taih",
    "receiverCity": "Sweden",
    "country": "Sweden",
    "carrier": "DHL",
    "broker": "NOK",
    "weight": 3,
    "actualWeight": 2.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 1.638,
    "dim": "10x10x10 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 1653,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Deliverd",
    "contents": "Rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Sweden Central Hub",
    "currentLocation": "Deliverd to Consignee",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Deliverd",
        "location": "Sweden",
        "timestamp": "8/5/2026 20:31:51",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-19",
    "awb": "875354611160",
    "date": "8/5/2026 20:33:56",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Qusay Taih",
    "receiverCity": "Sweden",
    "country": "Sweden",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 0.5,
    "actualWeight": 2.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 2355,
    "priceUsd": 76,
    "costPrice": 1653,
    "sellingPrice": 2355,
    "transExpense": 0,
    "netProfit": 601,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Sweden Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/5/2026 20:33:56",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-20",
    "awb": "8267064094",
    "date": "8/6/2026 10:24:07",
    "account": "moamen",
    "company": "moamen",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Nouf alajlan",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 0.5,
    "actualWeight": 1.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 2035,
    "priceUsd": 66,
    "costPrice": 1225,
    "sellingPrice": 2035,
    "transExpense": 0,
    "netProfit": 601,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "departed",
    "contents": "Women loose dress",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "departed",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "departed",
        "location": "Cairo Airport",
        "timestamp": "8/6/2026 10:24:07",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-21",
    "awb": "875292259552",
    "date": "8/6/2026 10:37:28",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Qusay taih",
    "receiverCity": "Sweden",
    "country": "Sweden",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 3.1,
    "actualWeight": 4.7,
    "length": 14,
    "width": 30,
    "height": 43,
    "volumetricWeight": 0.2,
    "dim": "14x30x43 cm",
    "priceEgp": 3630,
    "priceUsd": 117,
    "costPrice": 2877,
    "sellingPrice": 3630,
    "transExpense": 0,
    "netProfit": 750,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Information recived",
    "contents": "Sticks & rosarry",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Sweden Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 10:37:28",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-22",
    "awb": "875292259552-DUP",
    "date": "8/6/2026 10:37:52",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Qusay taih",
    "receiverCity": "Sweden",
    "country": "Sweden",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 5,
    "actualWeight": 4.7,
    "length": 14,
    "width": 30,
    "height": 43,
    "volumetricWeight": 3.1,
    "dim": "14x30x43 cm",
    "priceEgp": 3630,
    "priceUsd": 117,
    "costPrice": 2877,
    "sellingPrice": 3630,
    "transExpense": 0,
    "netProfit": 133,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Information recived",
    "contents": "Sticks & rosarry",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Sweden Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 10:37:52",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-23",
    "awb": "875405552596",
    "date": "8/6/2026 13:33:36",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "manal shouiab elazmi",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 1.638,
    "actualWeight": 2,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.7644,
    "dim": "10x10x10 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 1847,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "3 incense 3 + herbs",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 13:33:36",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-24",
    "awb": "875401781240",
    "date": "8/6/2026 15:03:30",
    "account": "Sabaan",
    "company": "Sabaan",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Andrea Di Napoli",
    "receiverCity": "Italy",
    "country": "Italy",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 3,
    "actualWeight": 1.5,
    "length": 26,
    "width": 21,
    "height": 7,
    "volumetricWeight": 1.638,
    "dim": "26x21x7 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 1128,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "1x Ems800 automotive engine controller",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Italy Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 15:03:30",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-25",
    "awb": "875401977275",
    "date": "8/6/2026 15:06:34",
    "account": "Sabaan",
    "company": "Sabaan",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Mohamed alkhayaly",
    "receiverCity": "Jordan",
    "country": "Jordan",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 0.5,
    "actualWeight": 3,
    "length": 26,
    "width": 21,
    "height": 15,
    "volumetricWeight": 0.2,
    "dim": "26x21x15 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 1851,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 601,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "1xEMS400 Automotive Engine Controller + harness",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Jordan Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 15:06:34",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-26",
    "awb": "875407245360",
    "date": "8/6/2026 17:33:33",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Ayan Mohammed Al-Masrati",
    "receiverCity": "Libya",
    "country": "Libya",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 3.1,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1265,
    "priceUsd": 41,
    "costPrice": 664,
    "sellingPrice": 1265,
    "transExpense": 0,
    "netProfit": 750,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "herbs",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Libya Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 17:33:33",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-27",
    "awb": "32972285706",
    "date": "8/6/2026 17:36:39",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "jony mathla",
    "receiverCity": "Australia",
    "country": "Australia",
    "carrier": "Aramex",
    "broker": "Azab",
    "weight": 5,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.1,
    "dim": "10x10x10 cm",
    "priceEgp": 3000,
    "priceUsd": 97,
    "costPrice": 2250,
    "sellingPrice": 3000,
    "transExpense": 0,
    "netProfit": 133,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Australia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 17:36:39",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-28",
    "awb": "32972285662",
    "date": "8/6/2026 17:40:00",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "soheir hannalla",
    "receiverCity": "USA",
    "country": "U.S.A.- UNITED STATES OF AMERICA",
    "carrier": "Aramex",
    "broker": "NOK",
    "weight": 6.5,
    "actualWeight": 5,
    "length": 31,
    "width": 25,
    "height": 20,
    "volumetricWeight": 3.1,
    "dim": "31x25x20 cm",
    "priceEgp": 5200,
    "priceUsd": 168,
    "costPrice": 5067,
    "sellingPrice": 5200,
    "transExpense": 0,
    "netProfit": 1229,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Information recived",
    "contents": "metal acssesories",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "USA Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 17:40:00",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-29",
    "awb": "32972285721",
    "date": "8/6/2026 17:41:49",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "eriny saweres",
    "receiverCity": "USA",
    "country": "U.S.A.- UNITED STATES OF AMERICA",
    "carrier": "Aramex",
    "broker": "NOK",
    "weight": 7,
    "actualWeight": 6.5,
    "length": 31,
    "width": 25,
    "height": 20,
    "volumetricWeight": 0.2,
    "dim": "31x25x20 cm",
    "priceEgp": 7200,
    "priceUsd": 232,
    "costPrice": 5971,
    "sellingPrice": 7200,
    "transExpense": 0,
    "netProfit": 751,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Information recived",
    "contents": "metal acssesories",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "USA Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/6/2026 17:41:49",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-30",
    "awb": "215205446528",
    "date": "8/7/2026 23:52:37",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Shimaa elsherbini",
    "receiverCity": "UAE",
    "country": "United Arab Emirates",
    "carrier": "SMSA Express",
    "broker": "XSPEED",
    "weight": 3.1,
    "actualWeight": 7,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 4553,
    "priceUsd": 147,
    "costPrice": 3802,
    "sellingPrice": 4553,
    "transExpense": 0,
    "netProfit": 750,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Decorative stones hanging",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "UAE Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/7/2026 23:52:37",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-31",
    "awb": "215205496295",
    "date": "8/8/2026 00:06:47",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Rasheed Al-Hubail",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "SMSA Express",
    "broker": "XSPEED",
    "weight": 5,
    "actualWeight": 3,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.1,
    "dim": "10x10x10 cm",
    "priceEgp": 2900,
    "priceUsd": 94,
    "costPrice": 2000,
    "sellingPrice": 2900,
    "transExpense": 0,
    "netProfit": 133,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/8/2026 00:06:47",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-32",
    "awb": "7501232281",
    "date": "8/8/2026 00:12:43",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Mahmoud lrsheid",
    "receiverCity": "UAE",
    "country": "United Arab Emirates",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 6.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.1,
    "dim": "10x10x10 cm",
    "priceEgp": 1700,
    "priceUsd": 55,
    "costPrice": 1064,
    "sellingPrice": 1700,
    "transExpense": 0,
    "netProfit": 1229,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "1 silver Rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "UAE Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/8/2026 00:12:43",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-33",
    "awb": "4049032271",
    "date": "8/8/2026 23:57:54",
    "account": "United engineer",
    "company": "United engineer",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Hamad Abdullah Al-Huwaiss",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 5,
    "actualWeight": 2.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.1,
    "dim": "10x10x10 cm",
    "priceEgp": 2600,
    "priceUsd": 84,
    "costPrice": 1615,
    "sellingPrice": 2600,
    "transExpense": 0,
    "netProfit": 133,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Kit shaft seal spare part for water pumb",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/8/2026 23:57:54",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-34",
    "awb": "4049041006",
    "date": "8/9/2026 13:01:13",
    "account": "moamen",
    "company": "moamen",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Wadha al-hajraf",
    "receiverCity": "Kuwait",
    "country": "Kuwait",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 6.5,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.1,
    "dim": "10x10x10 cm",
    "priceEgp": 1300,
    "priceUsd": 42,
    "costPrice": 1220,
    "sellingPrice": 1300,
    "transExpense": 0,
    "netProfit": 1229,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Cairo airport",
    "contents": "Women loose dress",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Kuwait Central Hub",
    "currentLocation": "Cairo airport",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Cairo airport",
        "location": "Cairo Airport Terminal",
        "timestamp": "8/9/2026 13:01:13",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-35",
    "awb": "4233091041",
    "date": "8/10/2026 11:11:45",
    "account": "moamen",
    "company": "moamen",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "widad gabry",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 3.1,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1745,
    "priceUsd": 56,
    "costPrice": 1261,
    "sellingPrice": 1745,
    "transExpense": 0,
    "netProfit": 750,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "women loose dress",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/10/2026 11:11:45",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-36",
    "awb": "875538001302",
    "date": "8/10/2026 14:05:56",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "John Minas",
    "receiverCity": "USA",
    "country": "U.S.A.- UNITED STATES OF AMERICA",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 5,
    "actualWeight": 4,
    "length": 20,
    "width": 15,
    "height": 25,
    "volumetricWeight": 3.1,
    "dim": "20x15x25 cm",
    "priceEgp": 4740,
    "priceUsd": 153,
    "costPrice": 4033,
    "sellingPrice": 4740,
    "transExpense": 0,
    "netProfit": 133,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "USA Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/10/2026 14:05:56",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-37",
    "awb": "7466913646",
    "date": "8/10/2026 22:52:40",
    "account": "sohib",
    "company": "sohib",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Damko Sylla",
    "receiverCity": "France",
    "country": "France",
    "carrier": "DHL",
    "broker": "NOK",
    "weight": 6.5,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.1,
    "dim": "10x10x10 cm",
    "priceEgp": 1770,
    "priceUsd": 57,
    "costPrice": 1184,
    "sellingPrice": 1770,
    "transExpense": 0,
    "netProfit": 1229,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "refused to recive",
    "contents": "box+necklace",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "France Central Hub",
    "currentLocation": "refused to recive",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "refused to recive",
        "location": "France Hub",
        "timestamp": "8/10/2026 22:52:40",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-38",
    "awb": "875603849719",
    "date": "8/11/2026 12:53:11",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "manal shouiab elazmi",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 7,
    "actualWeight": 2,
    "length": 35,
    "width": 24,
    "height": 16,
    "volumetricWeight": 0.2,
    "dim": "35x24x16 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 2394,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 751,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "3 incense + 3 herbs",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/11/2026 12:53:11",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-39",
    "awb": "215205825550",
    "date": "8/12/2026 10:34:56",
    "account": "Ahmed Helmy",
    "company": "Ahmed Helmy",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Mishal bin abdullah Alqourashi",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "SMSA Express",
    "broker": "XSPEED",
    "weight": 3.1,
    "actualWeight": 4.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 0,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 900,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/12/2026 10:34:56",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-40",
    "awb": "875660081072",
    "date": "8/12/2026 11:43:44",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Rashid Horani",
    "receiverCity": "Sweden",
    "country": "Sweden",
    "carrier": "FEDEX",
    "broker": "XSPEED",
    "weight": 3.1,
    "actualWeight": 3.5,
    "length": 30,
    "width": 24,
    "height": 20,
    "volumetricWeight": 0.2,
    "dim": "30x24x20 cm",
    "priceEgp": 3155,
    "priceUsd": 102,
    "costPrice": 2152,
    "sellingPrice": 3155,
    "transExpense": 0,
    "netProfit": 636,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Sweden Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/12/2026 11:43:44",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-41",
    "awb": "875660316525",
    "date": "8/12/2026 12:01:51",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Adnan Mohammed",
    "receiverCity": "UAE",
    "country": "United Arab Emirates",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 3.1,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1530,
    "priceUsd": 49,
    "costPrice": 876,
    "sellingPrice": 1530,
    "transExpense": 0,
    "netProfit": 985,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "UAE Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/12/2026 12:01:51",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-42",
    "awb": "6629301335",
    "date": "8/12/2026 23:25:11",
    "account": "moamen",
    "company": "moamen",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Sabah amour",
    "receiverCity": "Morocco",
    "country": "Morocco",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 3.1,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 2100,
    "priceUsd": 68,
    "costPrice": 1448,
    "sellingPrice": 2100,
    "transExpense": 0,
    "netProfit": 80,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "departed",
    "contents": "Women loose dress",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Morocco Central Hub",
    "currentLocation": "departed",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "departed",
        "location": "Cairo Airport Terminal",
        "timestamp": "8/12/2026 23:25:11",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-43",
    "awb": "6048422855",
    "date": "8/13/2026 14:41:41",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "giuggia hanane",
    "receiverCity": "France",
    "country": "France",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 3,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 1.638,
    "dim": "10x10x10 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 1266,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rosary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "France Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/13/2026 14:41:41",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-44",
    "awb": "3212503766",
    "date": "8/13/2026 14:44:22",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Ashwaq elautabi",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 0.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1830,
    "priceUsd": 59,
    "costPrice": 1079,
    "sellingPrice": 1830,
    "transExpense": 0,
    "netProfit": 601,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rosary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/13/2026 14:44:22",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-45",
    "awb": "875829941760",
    "date": "8/16/2026 12:45:16",
    "account": "Soliman store",
    "company": "Soliman store",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Dia Al Tamimi",
    "receiverCity": "Austria",
    "country": "Austria",
    "carrier": "FEDEX",
    "broker": "XSPEED",
    "weight": 2,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1040,
    "priceUsd": 34,
    "costPrice": 667,
    "sellingPrice": 1040,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Austria Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/16/2026 12:45:16",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-46",
    "awb": "875848157362",
    "date": "8/17/2026 11:54:49",
    "account": "sohib",
    "company": "sohib",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Avatar Institut fur Metaphysik GmbH",
    "receiverCity": "Germany",
    "country": "Germany",
    "carrier": "FEDEX",
    "broker": "XSPEED",
    "weight": 1.638,
    "actualWeight": 1.5,
    "length": 31,
    "width": 15,
    "height": 10,
    "volumetricWeight": 0.7644,
    "dim": "31x15x10 cm",
    "priceEgp": 2125,
    "priceUsd": 69,
    "costPrice": 1122,
    "sellingPrice": 2125,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Marble",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Germany Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/17/2026 11:54:49",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-47",
    "awb": "7919486912",
    "date": "8/17/2026 12:38:50",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "amina mohamed bn ahmed",
    "receiverCity": "Morocco",
    "country": "Morocco",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 3,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 1.638,
    "dim": "10x10x10 cm",
    "priceEgp": 1935,
    "priceUsd": 62,
    "costPrice": 1281,
    "sellingPrice": 1935,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rosary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Morocco Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/17/2026 12:38:50",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-48",
    "awb": "7919479212",
    "date": "8/17/2026 12:40:57",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "howida hassan yaqoub",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 0.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1745,
    "priceUsd": 56,
    "costPrice": 1092,
    "sellingPrice": 1745,
    "transExpense": 0,
    "netProfit": 601,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rosary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "8/17/2026 12:40:57",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-49",
    "awb": "875916794533",
    "date": "2026-08-18",
    "account": "Soliman store",
    "company": "Soliman store",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "khaled mansour",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "FEDEX",
    "broker": "sonbola",
    "weight": 3.1,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 0,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 750,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "2 rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-18",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-50",
    "awb": "32972311164",
    "date": "2026-08-19",
    "account": "Cash",
    "company": "Cash",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Jony Mathla",
    "receiverCity": "Australia",
    "country": "Australia",
    "carrier": "Aramex",
    "broker": "Azab",
    "weight": 3.612,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1430,
    "priceUsd": 46,
    "costPrice": 0,
    "sellingPrice": 1430,
    "transExpense": 0,
    "netProfit": 550,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Cairo airport",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Australia Central Hub",
    "currentLocation": "Cairo airport",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Cairo airport",
        "location": "Cairo Airport Terminal",
        "timestamp": "2026-08-19",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-51",
    "awb": "875913383385",
    "date": "2026-08-19",
    "account": "Cash",
    "company": "Cash",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "mahmoud mohamed elsayed",
    "receiverCity": "Egypt",
    "country": "Egypt",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 0.5,
    "actualWeight": 0.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 1266,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 652,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "parcel",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Egypt Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-19",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-52",
    "awb": "875924231603",
    "date": "2026-08-19",
    "account": "sohib",
    "company": "sohib",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Avatar Institut fur Metaphysik GmbH",
    "receiverCity": "Germany",
    "country": "Germany",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 0.7644,
    "actualWeight": 1.5,
    "length": 31,
    "width": 15,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "31x15x10 cm",
    "priceEgp": 1700,
    "priceUsd": 55,
    "costPrice": 1121,
    "sellingPrice": 1700,
    "transExpense": 0,
    "netProfit": 651,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Marble",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Germany Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-19",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-53",
    "awb": "875923803500",
    "date": "2026-08-19",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "saad delly",
    "receiverCity": "USA",
    "country": "U.S.A.- UNITED STATES OF AMERICA",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 1.638,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 2405,
    "priceUsd": 78,
    "costPrice": 1652,
    "sellingPrice": 2405,
    "transExpense": 0,
    "netProfit": 651,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Rosarry",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "USA Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-19",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-54",
    "awb": "875923113502",
    "date": "2026-08-19",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Amani Abba",
    "receiverCity": "Canada",
    "country": "Canada",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 0.5,
    "actualWeight": 3.5,
    "length": 29,
    "width": 24,
    "height": 13,
    "volumetricWeight": 0.2,
    "dim": "29x24x13 cm",
    "priceEgp": 4610,
    "priceUsd": 149,
    "costPrice": 3610,
    "sellingPrice": 4610,
    "transExpense": 0,
    "netProfit": 650,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Canada Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-19",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-55",
    "awb": "875983406294",
    "date": "2026-08-19",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Rashid Horani",
    "receiverCity": "Sweden",
    "country": "Sweden",
    "carrier": "FEDEX",
    "broker": "NOK",
    "weight": 0.5,
    "actualWeight": 3,
    "length": 32,
    "width": 23,
    "height": 14,
    "volumetricWeight": 0.2,
    "dim": "32x23x14 cm",
    "priceEgp": 3050,
    "priceUsd": 98,
    "costPrice": 2050,
    "sellingPrice": 3050,
    "transExpense": 0,
    "netProfit": 704,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "wooden box & rossary",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Sweden Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-19",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-56",
    "awb": "3699999074",
    "date": "2026-08-20",
    "account": "moamen",
    "company": "moamen",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Manal sandouka",
    "receiverCity": "UAE",
    "country": "United Arab Emirates",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 2.5,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 0,
    "priceUsd": 0,
    "costPrice": 1252,
    "sellingPrice": 0,
    "transExpense": 0,
    "netProfit": 0,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Women loose dress",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "UAE Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-20",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-57",
    "awb": "3700092841",
    "date": "2026-08-20",
    "account": "moamen",
    "company": "moamen",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Abdullatif sijantan",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 2.5,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 1743,
    "priceUsd": 56,
    "costPrice": 0,
    "sellingPrice": 1743,
    "transExpense": 0,
    "netProfit": 702,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "Women loose dress",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-20",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-58",
    "awb": "32972313275",
    "date": "2026-08-22",
    "account": "nour saied",
    "company": "nour saied",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "mona mahmoud mohamed wahba",
    "receiverCity": "Qatar",
    "country": "Qatar",
    "carrier": "Aramex",
    "broker": "XSPEED",
    "weight": 1.5,
    "actualWeight": 2.5,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 0.2,
    "dim": "10x10x10 cm",
    "priceEgp": 2330,
    "priceUsd": 75,
    "costPrice": 1500,
    "sellingPrice": 2330,
    "transExpense": 0,
    "netProfit": 810,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "metal accessories",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Qatar Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-22",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-59",
    "awb": "5554868432",
    "date": "2026-08-22",
    "account": "moamen",
    "company": "moamen",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "maymouah zaitoni",
    "receiverCity": "Saudi Arabia",
    "country": "Saudi Arabia",
    "carrier": "DHL",
    "broker": "XSPEED",
    "weight": 4.7,
    "actualWeight": 1,
    "length": 10,
    "width": 10,
    "height": 10,
    "volumetricWeight": 3.612,
    "dim": "10x10x10 cm",
    "priceEgp": 1743,
    "priceUsd": 56,
    "costPrice": 1252,
    "sellingPrice": 1743,
    "transExpense": 0,
    "netProfit": 753,
    "agentName": "بسمة",
    "opNote": "",
    "status": "Information recived",
    "contents": "women loose dress",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Saudi Arabia Central Hub",
    "currentLocation": "Information recived",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Information recived",
        "location": "Cairo Gateway",
        "timestamp": "2026-08-22",
        "completed": true,
        "current": true
      }
    ]
  },
  {
    "id": "shp-user-60",
    "awb": "875202433099",
    "date": "2026-08-22",
    "account": "Cash",
    "company": "Cash",
    "senderName": "XSPEED Central Gateway",
    "senderCity": "Cairo, Egypt",
    "receiverName": "Consignee",
    "receiverCity": "Afghanistan",
    "country": "Afghanistan",
    "carrier": "DHL",
    "broker": "sonbola",
    "weight": 4.7,
    "actualWeight": 6,
    "length": 6,
    "width": 6,
    "height": 6,
    "volumetricWeight": 3.612,
    "dim": "6x6x6 cm",
    "priceEgp": 66,
    "priceUsd": 2,
    "costPrice": 66,
    "sellingPrice": 66,
    "transExpense": 0,
    "netProfit": 753,
    "agentName": "مصطفي",
    "opNote": "",
    "status": "Deliverd",
    "contents": "ن",
    "originHub": "Cairo Gateway (CAI)",
    "destinationHub": "Afghanistan Central Hub",
    "currentLocation": "Deliverd",
    "serviceType": "Next-Day Air",
    "timeline": [
      {
        "status": "Deliverd",
        "location": "Afghanistan",
        "timestamp": "2026-08-22",
        "completed": true,
        "current": true
      }
    ]
  }
];
export const initialCustomers: Customer[] = [
  {
    id: "CUST-401",
    code: "ACC-8801",
    name: "nour saied",
    company: "nour saied",
    email: "nour.saied@exspeeds-client.com",
    phone: "+20 100 234 5678",
    country: "Egypt",
    city: "Cairo",
    tier: "Enterprise VIP",
    creditLimit: 50000,
    currentBalance: 0,
    totalShipments: 0,
    lifetimeSpend: 0,
    taxRegistrationNumber: "EG-801-100-200",
    assignedManager: "بسمة",
    activeContracts: 1,
    joinedDate: "2026-01-15",
    status: "Active",
  },
  {
    id: "CUST-402",
    code: "ACC-8802",
    name: "sohib",
    company: "sohib",
    email: "sohib@exspeeds-client.com",
    phone: "+20 101 345 6789",
    country: "Egypt",
    city: "Alexandria",
    tier: "Enterprise VIP",
    creditLimit: 75000,
    currentBalance: 0,
    totalShipments: 0,
    lifetimeSpend: 0,
    taxRegistrationNumber: "EG-802-100-200",
    assignedManager: "مصطفي",
    activeContracts: 1,
    joinedDate: "2026-02-01",
    status: "Active",
  },
  {
    id: "CUST-403",
    code: "ACC-8803",
    name: "Tasniim",
    company: "Tasniim",
    email: "tasniim@exspeeds-client.com",
    phone: "+20 102 456 7890",
    country: "Egypt",
    city: "Giza",
    tier: "Corporate Partner",
    creditLimit: 30000,
    currentBalance: 0,
    totalShipments: 0,
    lifetimeSpend: 0,
    taxRegistrationNumber: "EG-803-100-200",
    assignedManager: "ضبش",
    activeContracts: 1,
    joinedDate: "2026-02-10",
    status: "Active",
  },
  {
    id: "CUST-404",
    code: "ACC-8804",
    name: "Sabaan",
    company: "Sabaan",
    email: "sabaan@exspeeds-client.com",
    phone: "+20 103 567 8901",
    country: "Egypt",
    city: "Cairo",
    tier: "Corporate Partner",
    creditLimit: 40000,
    currentBalance: 0,
    totalShipments: 0,
    lifetimeSpend: 0,
    taxRegistrationNumber: "EG-804-100-200",
    assignedManager: "حسين",
    activeContracts: 1,
    joinedDate: "2026-02-15",
    status: "Active",
  },
  {
    id: "CUST-405",
    code: "ACC-8805",
    name: "Simon Botrous",
    company: "Simon Botrous",
    email: "simon.botrous@exspeeds-client.com",
    phone: "+20 104 678 9012",
    country: "Egypt",
    city: "Alexandria",
    tier: "Standard Shipper",
    creditLimit: 25000,
    currentBalance: 0,
    totalShipments: 0,
    lifetimeSpend: 0,
    taxRegistrationNumber: "EG-805-100-200",
    assignedManager: "الراوي",
    activeContracts: 1,
    joinedDate: "2026-03-01",
    status: "Active",
  },
  {
    id: "CUST-406",
    code: "ACC-8806",
    name: "Ahmed alfar",
    company: "Ahmed alfar",
    email: "ahmed.alfar@exspeeds-client.com",
    phone: "+20 105 789 0123",
    country: "Egypt",
    city: "Cairo",
    tier: "Standard Shipper",
    creditLimit: 25000,
    currentBalance: 0,
    totalShipments: 0,
    lifetimeSpend: 0,
    taxRegistrationNumber: "EG-806-100-200",
    assignedManager: "مصطفي",
    activeContracts: 1,
    joinedDate: "2026-03-10",
    status: "Active",
  },
  {
    id: "CUST-407",
    code: "ACC-8807",
    name: "Soliman store",
    company: "Soliman store",
    email: "soliman.store@exspeeds-client.com",
    phone: "+20 106 890 1234",
    country: "Egypt",
    city: "Giza",
    tier: "Corporate Partner",
    creditLimit: 35000,
    currentBalance: 0,
    totalShipments: 0,
    lifetimeSpend: 0,
    taxRegistrationNumber: "EG-807-100-200",
    assignedManager: "بسمة",
    activeContracts: 1,
    joinedDate: "2026-03-15",
    status: "Active",
  },
  {
    id: "CUST-408",
    code: "ACC-8808",
    name: "Cash",
    company: "Cash Client",
    email: "cash@exspeeds.com",
    phone: "+20 100 000 0000",
    country: "Egypt",
    city: "Cairo",
    tier: "Standard Shipper",
    creditLimit: 0,
    currentBalance: 0,
    totalShipments: 0,
    lifetimeSpend: 0,
    taxRegistrationNumber: "EG-000-000-000",
    assignedManager: "Operations",
    activeContracts: 0,
    joinedDate: "2026-01-01",
    status: "Active",
  }
];
export const initialOrders: Order[] = [];
export const initialInvoices: Invoice[] = [];
export const initialWarehouseItems: WarehouseItem[] = [];
export const initialNotifications: NotificationItem[] = [];
export const initialShipmentRequests: ShipmentRequest[] = [];

export const initialCarrierTransfers: CarrierTransfer[] = [
  {
    id: "ct-1",
    carrier: "Express",
    amount: 15000,
    currency: "EGP",
    date: "2026-08-10",
    payingAccount: "CIB account",
    paymentMethod: "تحويل بنكي CIB",
    referenceNumber: "TR-EXP-801",
    recordedBy: "ضبش",
    notes: "سداد دفعة حساب بوالص خط إكسبريس لشهر أغسطس",
  },
  {
    id: "ct-2",
    carrier: "FEDEX",
    amount: 8000,
    currency: "EGP",
    date: "2026-08-15",
    payingAccount: "CIB account",
    paymentMethod: "تحويل بنكي CIB",
    referenceNumber: "TR-FDX-802",
    recordedBy: "ضبش",
    notes: "دفعة تحت الحساب لشحنات فيديكس الدولية",
  },
  {
    id: "ct-3",
    carrier: "sonbola",
    amount: 6500,
    currency: "EGP",
    date: "2026-08-20",
    payingAccount: "speedex wallet",
    paymentMethod: "محفظة إلكترونية",
    referenceNumber: "TR-SNB-803",
    recordedBy: "مصطفي",
    notes: "سداد مستحقات وسيط سنبلة",
  },
];

export const initialInternalTransfers: InternalTransfer[] = [
  {
    id: "it-1",
    fromAccount: "CIB account",
    toAccount: "el rawy",
    amount: 12000,
    currency: "EGP",
    date: "2026-08-05",
    fee: 35,
    referenceNumber: "WIT-CIB-01",
    recordedBy: "ضبش",
    notes: "تغذية عهدة كاش الراوي لمصاريف التشغيل والاستلام",
  },
  {
    id: "it-2",
    fromAccount: "CIB account",
    toAccount: "speedex wallet",
    amount: 10000,
    currency: "EGP",
    date: "2026-08-12",
    fee: 0,
    referenceNumber: "WIT-CIB-02",
    recordedBy: "بسمة",
    notes: "شحن محفظة سبيدكس لسداد فواتير الوسطاء السريعة",
  },
];

export const initialSalaries: SalaryPayment[] = [
  {
    id: "sal-1",
    employeeName: "مصطفي",
    type: "salary",
    amount: 12000,
    currency: "EGP",
    date: "2026-08-01",
    payingAccount: "CIB account",
    period: "2026-08",
    recordedBy: "ضبش",
    notes: "راتب شهر أغسطس",
  },
  {
    id: "sal-2",
    employeeName: "الراوي",
    type: "advance",
    amount: 2500,
    currency: "EGP",
    date: "2026-08-15",
    payingAccount: "el rawy",
    period: "2026-08",
    recordedBy: "الراوي",
    notes: "سلفة نقدية على راتب أغسطس",
  },
];

export const initialInvoiceLosses: InvoiceLoss[] = [
  {
    id: "loss-1",
    awb: "875202433089",
    clientName: "nour saied",
    lossAmount: 850,
    currency: "EGP",
    lossDate: "2026-08-28",
    shipmentDate: "2026-08-01",
    reason: "customs_confiscation",
    status: "deducted",
    recordedBy: "مصطفي",
    notes: "غرامة جمركية تم تحميلها على تكلفة شهر الشحنة الأصلي",
  },
];

export const initialWarehouses: WarehouseFacility[] = [
  {
    id: "cairo",
    name: "Cairo Mega Hub (CAI)",
    city: "Cairo",
    country: "Egypt",
    totalCapacitySqM: 45000,
    capacityUtilizationPct: 78,
    activePallets: 3200,
    totalBays: 120,
    occupiedBays: 94,
    temperatureCelsius: 21,
    activeStaff: 48,
    dockDoors: 16,
  },
  {
    id: "alexandria",
    name: "Alexandria Port Terminal (ALY)",
    city: "Alexandria",
    country: "Egypt",
    totalCapacitySqM: 28000,
    capacityUtilizationPct: 62,
    activePallets: 1850,
    totalBays: 80,
    occupiedBays: 50,
    temperatureCelsius: 22,
    activeStaff: 32,
    dockDoors: 10,
  },
  {
    id: "dubai",
    name: "Dubai Cargo Village (DXB)",
    city: "Dubai",
    country: "UAE",
    totalCapacitySqM: 60000,
    capacityUtilizationPct: 84,
    activePallets: 4600,
    totalBays: 160,
    occupiedBays: 135,
    temperatureCelsius: 19,
    activeStaff: 64,
    dockDoors: 24,
  },
  {
    id: "riyadh",
    name: "Riyadh Express Depot (RUH)",
    city: "Riyadh",
    country: "Saudi Arabia",
    totalCapacitySqM: 35000,
    capacityUtilizationPct: 70,
    activePallets: 2400,
    totalBays: 95,
    occupiedBays: 67,
    temperatureCelsius: 20,
    activeStaff: 38,
    dockDoors: 12,
  },
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: "post-1",
    title: "Automated Courier Dispatching: Accelerating Next-Day Freight Speed in 2026",
    slug: "automated-courier-dispatching-speed",
    author: "Omar Farouk",
    category: "Technology & Logistics",
    date: "2026-08-10T10:00:00Z",
    status: "published",
    views: 1420,
    seoScore: 94,
    focusKeyword: "automated courier dispatching",
    wordCount: 1850,
    wpEditUrl: "/wp-admin/post.php?post=101&action=edit",
    imageUrl: "/assets/xspeed_about_showcase.jpg",
    excerpt: "Discover how AI-driven courier route algorithms, dynamic geofencing, and automated sorting centers reduce middle-mile transit time by up to 52%.",
    content: `
      <p class="lead">In the high-stakes world of global logistics and express air cargo, milliseconds translate directly into delivery benchmarks. As shipping volumes grow, legacy manual dispatch systems are rapidly falling behind.</p>
      
      <h2>The Modern Architecture of Express Dispatching</h2>
      <p>Today's logistics networks rely on distributed telemetry nodes, algorithmic vehicle load balancing, and predictive delivery route clustering to deliver parcels faster, safer, and with zero manual friction.</p>

      <h3>Key Architectural Pillars:</h3>
      <ul>
        <li><strong>Dynamic Geofencing:</strong> Instant assignment based on live courier GPS proximity and current trunk capacity.</li>
        <li><strong>Predictive Traffic Heuristics:</strong> Routing around bottlenecks across Cairo, Alexandria, Dubai, and Riyadh highway corridors.</li>
        <li><strong>Automated AWB Scanning:</strong> Zero manual data entry with instant RF barcode generation at receiving bays.</li>
      </ul>
    `,
  },
  {
    id: "post-2",
    title: "Cold-Chain Pharma Logistics: Real-Time Telemetry Best Practices",
    slug: "cold-chain-pharma-logistics-telemetry",
    author: "Dr. Karim Mansour",
    category: "Supply Chain & Healthcare",
    date: "2026-08-04T14:30:00Z",
    status: "published",
    views: 980,
    seoScore: 91,
    focusKeyword: "cold chain pharma logistics",
    wordCount: 2100,
    wpEditUrl: "/wp-admin/post.php?post=102&action=edit",
    imageUrl: "/assets/xspeed_cold_chain.jpg",
    excerpt: "Maintaining unbroken 2-8°C cold chains for pharmaceutical shipments across Middle East climates using live IoT sensors and active thermal packaging.",
    content: `
      <p class="lead">Transporting sensitive biologicals, vaccines, and high-value pharmaceuticals across ambient desert temperatures exceeding 45°C demands uncompromising cold-chain rigor.</p>

      <h2>Continuous Satellite Temperature Monitoring</h2>
      <p>At XSPEED, our cold-chain consignments are outfitted with real-time IoT temperature and tilt sensors that transmit telemetry updates every 60 seconds directly into our operations radar.</p>

      <h3>Zero-Excursion Quality Standards:</h3>
      <ul>
        <li><strong>Chamber Calibration:</strong> Dedicated 2°C to 8°C cold vaults and -20°C deep freeze chambers at all regional gateways.</li>
        <li><strong>Automated Deviation Alerts:</strong> Instant SMS and webhook notifications triggered if temperature fluctuates by more than ±0.5°C.</li>
      </ul>
    `,
  },
  {
    id: "post-3",
    title: "Egypt-GCC Freight Corridors: Customs Clearance Optimization in 2026",
    slug: "egypt-gcc-freight-customs-optimization",
    author: "Tamer Soliman",
    category: "International Trade",
    date: "2026-07-28T09:15:00Z",
    status: "published",
    views: 2450,
    seoScore: 96,
    focusKeyword: "egypt gcc freight customs",
    wordCount: 2400,
    wpEditUrl: "/wp-admin/post.php?post=103&action=edit",
    imageUrl: "/assets/xspeed_customs_clearance.jpg",
    excerpt: "Navigating cross-border trade between Egypt, Saudi Arabia, and the UAE with expedited pre-clearance, digital documentation, and unified tariffs.",
    content: `
      <p class="lead">Cross-border freight trade between Egypt and the GCC represents one of the fastest-growing logistics corridors globally. Understanding pre-clearance protocols is essential for avoiding border friction.</p>

      <h2>Accelerated Customs Pre-Clearance</h2>
      <p>By synchronizing digital commercial invoices, certificates of origin, and packing lists directly with regional customs authorities prior to flight departure, XSPEED clears over 94% of consignments while in-flight.</p>
    `,
  },
  {
    id: "post-4",
    title: "Smart Warehousing: Minimizing Dwell Time with Automated Staging",
    slug: "smart-warehousing-dwell-time-reduction",
    author: "Logistics Operations Team",
    category: "Warehouse Management",
    date: "2026-07-15T11:00:00Z",
    status: "draft",
    views: 0,
    seoScore: 86,
    focusKeyword: "smart warehousing dwell time",
    wordCount: 1620,
    wpEditUrl: "/wp-admin/post.php?post=104&action=edit",
    imageUrl: "/assets/bg-home-BYMxMBP3.jpg",
    excerpt: "How high-density pallet racking, RFID bin location tracking, and rapid cross-docking doors eliminate warehouse storage bottlenecks.",
    content: `
      <p class="lead">Modern supply chains succeed when cargo is kept in continuous motion rather than idling in static storage racks.</p>
    `,
  },
  {
    id: "post-5",
    title: "Fast Freight Solutions: Egypt & GCC Trade Corridors in 2026",
    slug: "fast-freight-solutions-egypt-gcc-2026",
    author: "XSPEED Operations & Logistics Team",
    category: "International Trade",
    date: "2026-08-15T09:00:00Z",
    status: "published",
    views: 3180,
    seoScore: 97,
    focusKeyword: "fast freight solutions egypt gcc",
    wordCount: 2250,
    wpEditUrl: "/wp-admin/post.php?post=105&action=edit",
    imageUrl: "/assets/xspeed_plane.jpg",
    excerpt: "Comprehensive logistics strategies, air & sea express linehauls, and accelerated customs pre-clearance connecting Egypt with Saudi Arabia, UAE, and the wider GCC.",
    content: `
      <p class="lead">The trade highway connecting the Arab Republic of Egypt with the Gulf Cooperation Council (GCC) economies has entered a transformative era in 2026.</p>
    `,
  },
];

export const initialExpenses: BusinessExpense[] = [
  {
    id: "exp-1",
    title: "إيجار مستودع قرية البضائع - مطار القاهرة",
    category: "Rent & Facilities",
    amount: 4500,
    currency: "EGP",
    date: "2026-08-01",
    payingAccount: "CIB account",
    recorder: "ضبش",
    paymentMethod: "تحويل بنكي CIB",
    notes: "الإيجار الشهري لمساحة المناولة الجمركية",
    receiptNumber: "REC-2026-0801",
    expenseNature: "general",
  },
  {
    id: "exp-2",
    title: "وقود وصيانة شاحنات النقل البري",
    category: "Fuel & Linehaul",
    amount: 2800,
    currency: "EGP",
    date: "2026-08-10",
    payingAccount: "el rawy",
    recorder: "الراوي",
    paymentMethod: "عهدة نقدية كاش",
    notes: "كروت وقود أسطول السويس والإسكندرية",
    receiptNumber: "REC-2026-0810",
    expenseNature: "general",
  },
  {
    id: "exp-3",
    title: "مستلزمات تغليف وبوالص AWB وبطاقات تتبع",
    category: "Packaging & Supplies",
    amount: 1250,
    currency: "EGP",
    date: "2026-08-18",
    payingAccount: "speedex wallet",
    recorder: "مصطفي",
    paymentMethod: "محفظة إلكترونية",
    notes: "كراتين مضلعة وبلاستيك هوائي وملصقات حرارية",
    receiptNumber: "REC-2026-0818",
    expenseNature: "general",
  },
  {
    id: "exp-4",
    title: "اشتراك سحابي لنظام نافذة وتتبع الشحنات",
    category: "Software & Marketing",
    amount: 1080,
    currency: "EGP",
    date: "2026-08-25",
    payingAccount: "CIB account",
    recorder: "بسمة",
    paymentMethod: "بطاقة ائتمان بنكية",
    notes: "تراخيص منصة التتبع الرقمية وتشفير البيانات",
    receiptNumber: "REC-2026-0825",
    expenseNature: "general",
  },
];

// Local Storage Helper & Store API
export class AdminStorage {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // In-memory cache to avoid repeated JSON.parse
  private static cache: Record<string, any> = {};
  private static get<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.cache[key] = parsed;
        return parsed;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }

  private static save<T>(key: string, data: T): void {
    if (!this.isBrowser()) return;
    this.cache[key] = data;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  }

  static getShipmentRequests(): ShipmentRequest[] {
    return this.get("xspeed_admin_shipment_requests", initialShipmentRequests);
  }
  static saveShipmentRequests(data: ShipmentRequest[]) {
    this.save("xspeed_admin_shipment_requests", data);
  }
  static addShipmentRequest(request: ShipmentRequest) {
    const requests = this.getShipmentRequests();
    const updated = [request, ...requests];
    this.saveShipmentRequests(updated);
    return request;
  }
  static updateShipmentRequest(id: string, patch: Partial<ShipmentRequest>) {
    const requests = this.getShipmentRequests();
    const nowIso = new Date().toISOString();
    const updated = requests.map((r) => {
      if (r.id !== id) return r;

      const newStatus = patch.status || r.status;
      const autoTimestamps: Partial<ShipmentRequest> = {};

      if (patch.status && patch.status !== r.status) {
        if (newStatus === "Contacted" && !r.contactedAt) {
          autoTimestamps.contactedAt = nowIso;
        } else if (newStatus === "Price Sent" && !r.priceSentAt) {
          autoTimestamps.priceSentAt = nowIso;
        } else if (newStatus === "Awaiting Customer Response") {
          autoTimestamps.priceSentAt = r.priceSentAt || nowIso;
        } else if (newStatus === "Customer Confirmed") {
          autoTimestamps.customerConfirmedAt = nowIso;
        } else if (newStatus === "Converted to Shipment") {
          autoTimestamps.convertedAt = nowIso;
        }
      }

      return {
        ...r,
        ...patch,
        ...autoTimestamps,
        updatedAt: nowIso,
      };
    });
    this.saveShipmentRequests(updated);
  }

  static getShipments(): Shipment[] {
    const list = this.get<Shipment[]>("xspeed_admin_shipments", initialShipments);
    if (!list || list.length === 0 || !list.some((s) => s.awb === "875202433089")) {
      this.saveShipments(initialShipments);
      return initialShipments;
    }
    return list;
  }
  static saveShipments(data: Shipment[]) {
    this.save("xspeed_admin_shipments", data);
  }

  static getOrders(): Order[] {
    return this.get("xspeed_admin_orders", initialOrders);
  }
  static saveOrders(data: Order[]) {
    this.save("xspeed_admin_orders", data);
  }

  static getCustomers(): Customer[] {
    const list = this.get<Customer[]>("xspeed_admin_customers", initialCustomers);
    if (!list || list.length === 0 || !list.some((c) => c.code === "ACC-8801")) {
      this.saveCustomers(initialCustomers);
      return initialCustomers;
    }
    return list;
  }
  static saveCustomers(data: Customer[]) {
    this.save("xspeed_admin_customers", data);
  }

  static getCollections(): CustomerCollection[] {
    return this.get<CustomerCollection[]>("xspeed_admin_collections", [
      {
        id: "col-1",
        clientName: "nour saied",
        amount: 2500,
        currency: "EGP",
        date: "2026-08-15",
        receivingAccount: "CIB account",
        paymentMethod: "تحويل بنكي CIB",
        receiptNumber: "COL-801",
        recordedBy: "بسمة",
        notes: "دفعة نقدية تحت حساب شحنات شهر أغسطس",
      },
      {
        id: "col-2",
        clientName: "sohib",
        amount: 5000,
        currency: "EGP",
        date: "2026-08-22",
        receivingAccount: "speedex wallet",
        paymentMethod: "محفظة إلكترونية",
        receiptNumber: "COL-802",
        recordedBy: "مصطفي",
        notes: "سداد جزئي بوليصة 875202548831",
      },
    ]);
  }
  static saveCollections(data: CustomerCollection[]) {
    this.save("xspeed_admin_collections", data);
  }
  static addCollection(collection: CustomerCollection) {
    const current = this.getCollections();
    const updated = [collection, ...current];
    this.saveCollections(updated);
    return collection;
  }
  static deleteCollection(id: string) {
    const current = this.getCollections();
    const updated = current.filter((c) => c.id !== id);
    this.saveCollections(updated);
  }

  static getInvoices(): Invoice[] {
    return this.get("xspeed_admin_invoices", initialInvoices);
  }
  static saveInvoices(data: Invoice[]) {
    this.save("xspeed_admin_invoices", data);
  }

  static getNotifications(): NotificationItem[] {
    return this.get("xspeed_admin_notifications", initialNotifications);
  }
  static saveNotifications(data: NotificationItem[]) {
    this.save("xspeed_admin_notifications", data);
  }

  static getWarehouseItems(): WarehouseItem[] {
    return this.get("xspeed_admin_warehouse_items", initialWarehouseItems);
  }
  static saveWarehouseItems(data: WarehouseItem[]) {
    this.save("xspeed_admin_warehouse_items", data);
  }

  static getBlogPosts(): BlogPost[] {
    return this.get("xspeed_admin_posts", initialBlogPosts);
  }
  static saveBlogPosts(data: BlogPost[]) {
    this.save("xspeed_admin_posts", data);
  }

  static getExpenses(): BusinessExpense[] {
    return this.get("xspeed_admin_expenses", initialExpenses);
  }
  static saveExpenses(data: BusinessExpense[]) {
    this.save("xspeed_admin_expenses", data);
  }
  static addExpense(expense: BusinessExpense) {
    const current = this.getExpenses();
    const updated = [expense, ...current];
    this.saveExpenses(updated);
    return expense;
  }
  static deleteExpense(id: string) {
    const current = this.getExpenses();
    const updated = current.filter((e) => e.id !== id);
    this.saveExpenses(updated);
  }

  // Carrier Transfers (سندات سداد شركات الشحن والوسطاء)
  static getCarrierTransfers(): CarrierTransfer[] {
    return this.get("xspeed_admin_carrier_transfers", initialCarrierTransfers);
  }
  static saveCarrierTransfers(data: CarrierTransfer[]) {
    this.save("xspeed_admin_carrier_transfers", data);
  }
  static addCarrierTransfer(transfer: CarrierTransfer) {
    const current = this.getCarrierTransfers();
    const updated = [transfer, ...current];
    this.saveCarrierTransfers(updated);
    return transfer;
  }
  static deleteCarrierTransfer(id: string) {
    const current = this.getCarrierTransfers();
    const updated = current.filter((t) => t.id !== id);
    this.saveCarrierTransfers(updated);
  }

  // Internal Vault Transfers (مناقلات بين الخزائن والعهد)
  static getInternalTransfers(): InternalTransfer[] {
    return this.get("xspeed_admin_internal_transfers", initialInternalTransfers);
  }
  static saveInternalTransfers(data: InternalTransfer[]) {
    this.save("xspeed_admin_internal_transfers", data);
  }
  static addInternalTransfer(transfer: InternalTransfer) {
    const current = this.getInternalTransfers();
    const updated = [transfer, ...current];
    this.saveInternalTransfers(updated);
    return transfer;
  }
  static deleteInternalTransfer(id: string) {
    const current = this.getInternalTransfers();
    const updated = current.filter((t) => t.id !== id);
    this.saveInternalTransfers(updated);
  }

  // Salary Payments (سندات صرف المرتبات والسلف)
  static getSalaries(): SalaryPayment[] {
    return this.get("xspeed_admin_salaries", initialSalaries);
  }
  static saveSalaries(data: SalaryPayment[]) {
    this.save("xspeed_admin_salaries", data);
  }
  static addSalary(salary: SalaryPayment) {
    const current = this.getSalaries();
    const updated = [salary, ...current];
    this.saveSalaries(updated);
    return salary;
  }
  static deleteSalary(id: string) {
    const current = this.getSalaries();
    const updated = current.filter((s) => s.id !== id);
    this.saveSalaries(updated);
  }

  // Invoice Losses (خسائر الفواتير المنسوبة لتاريخ البوليصة)
  static getInvoiceLosses(): InvoiceLoss[] {
    return this.get("xspeed_admin_invoice_losses", initialInvoiceLosses);
  }
  static saveInvoiceLosses(data: InvoiceLoss[]) {
    this.save("xspeed_admin_invoice_losses", data);
  }
  static addInvoiceLoss(loss: InvoiceLoss) {
    const current = this.getInvoiceLosses();
    const updated = [loss, ...current];
    this.saveInvoiceLosses(updated);
    return loss;
  }
  static deleteInvoiceLoss(id: string) {
    const current = this.getInvoiceLosses();
    const updated = current.filter((l) => l.id !== id);
    this.saveInvoiceLosses(updated);
  }
}

// ── Master Option Lists for Filters and Form Dropdowns ──
export const MASTER_CLIENT_ACCOUNTS = [
  "Cash",
  "Sabaan",
  "Simon Botrous",
  "sohib",
  "nour saied",
  "amr dam8a",
  "Mina Badr",
  "osama jentel",
  "dima",
  "moamen",
  "On line",
  "Office",
  "Ahmed Helmy",
  "Mohamed aramex",
  "Ahmed alfar",
  "Manar l haj",
  "Soliman store",
  "United engineer",
  "7bat elzikr",
];

export const MASTER_AGENTS = [
  "مصطفي",
  "بسمة",
  "ضبش",
  "الراوي",
  "حسين",
];

export const MASTER_CARRIERS = [
  "Express",
  "FEDEX",
  "Aramex",
  "SMSA Express",
  "XSPEED Express",
  "sonbola",
  "NOK",
  "Other",
];

export const MASTER_BROKERS = [
  "sonbola",
  "XSPEED",
  "Azab",
  "NOK",
];

export const MASTER_SHIPMENT_STATUSES = [
  "Deliverd",
  "RTO",
  "Cairo airport",
  "Clerance",
  "not picked",
  "destination",
  "in transit",
  "departed",
  "out for delivery",
  "in the way",
  "Information recived",
  "Clearance Delay",
  "destroied",
  "refused to recive",
  "Re export",
];

export const MASTER_EXTRA_EXPENSES = [
  "Duty & Taxes",
  "Address Correction",
  "Ice Box",
  "Packing",
  "Remote Area Surcharge",
  "Oversize Fee",
  "Return Fee",
  "Matrial safety data sheet",
  "dam8a",
  "Other",
];

export const MASTER_EXPENSE_ITEMS = [
  "إعلانات ممولة",
  "إيجار المكتب",
  "مشاوير وتنقلات",
  "أدوات ومستلزمات مكتبية",
  "بنزين وصيانة",
  "مصاريف تحويلات وبنكية",
  "أخرى",
  "AI & FB Mark",
];

export const MASTER_FINANCIAL_ACCOUNTS = [
  "CIB account",
  "speedex wallet",
  "el rawy",
  "hussein",
  "dabash",
];

export const MASTER_COUNTRIES = [
  "Egypt",
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Oman",
  "Bahrain",
  "United States of America",
  "United Kingdom (Great Britain)",
  "Afghanistan",
  "Albania",
  "Algeria",
  "American Samoa",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antigua & Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahama",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia",
  "Bonaire Sint Eustatius and Saba",
  "Bosnia-Herzegovina",
  "Botswana",
  "Brazil",
  "British Virgin Islands",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Cayman Islands",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Congo",
  "Cook Islands",
  "Costa Rica",
  "Croatia",
  "Curacao",
  "Cyprus",
  "Czech Republic",
  "Côte D'ivoire (Ivory Coast)",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "El Salvador",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Faeroe Islands",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guadeloupe",
  "Guam",
  "Guatemala",
  "Guinea",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hong Kong SAR, China",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macau SAR, China",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Martinique",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Monaco",
  "Mongolia",
  "Monserrat",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Nepal",
  "Netherlands",
  "Netherlands Antilles",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Northern Mariana Islands",
  "Norway",
  "Pakistan",
  "Palau",
  "Palestine Autonomous",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Phillipines",
  "Poland",
  "Portugal",
  "Republic of Moldova",
  "Romania",
  "Russian Federation",
  "Rwanda",
  "Réunion",
  "Saint Lucia",
  "Samoa",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "St. Kitts and Nevis",
  "St. Maarten",
  "St. Martin",
  "St. Vincent & the Grenadines",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syrian Arab Republic",
  "Taiwan",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad & Tobago",
  "Tunisia",
  "Turkey",
  "Turks & Caicos Islands",
  "U.S. Virgin Islands",
  "Uganda",
  "Ukraine",
  "United Republic of Tanzania",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Wallis & Futuna",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];
