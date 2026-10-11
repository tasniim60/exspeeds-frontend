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
  costPrice?: number;
  transExpense?: number;
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
  carrier: "SMSA Express" | "Express" | "FedEx Express" | "Aramex" | "UPS" | "TNT Express" | "DB Schenker USA" | "Air Cargo" | "Post/EMS (with USPS)" | "Container Tracking" | "Bill Of Lading (B/L)" | string;
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

/**
 * Carrier Invoice Reconciliation Record (مراجعة وتدقيق فواتير شركات الشحن)
 * Matches the Google Sheet "مراجعه الفواتير"
 */
export interface CarrierInvoiceItem {
  id: string;
  awb: string;                  // رقم البوليصة (AWB)
  invoiceNumber: string;        // رقم الفاتورة (e.g. ACC-SINV-2026-03416)
  invoiceDate?: string;         // تاريخ الفاتورة
  carrier: string;              // الشركة الناقلة (SMSA, Aramex, etc.)
  billedWeight: number;         // الوزن المفوتر
  billedCost: number;           // التكلفة المفوترة
  clientName: string;           // اسم العميل
  systemWeight: number;         // وزن السيستم
  systemCost: number;           // تكلفة السيستم
  weightDiff: number;           // فرق الوزن (الوزن المفوتر - وزن السيستم)
  costDiff: number;             // الفرق/الخسارة (التكلفة المفوترة - تكلفة السيستم)
  shipmentStatus: string;       // حالة الشحنة (Delivered, Clearance Delay, RTO, In Transit, etc.)
  notes?: string;               // ملاحظات
  createdAt: string;            // تاريخ التسجيل
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
 * ── Carrier Partner / Broker Entity (شركة شحن أو وسيط معتمد) ──
 */
export interface CarrierPartner {
  id: string;
  name: string;
  type: "Carrier" | "Broker";
  contactPerson?: string;
  phone?: string;
  email?: string;
  defaultCurrency?: "EGP" | string;
  notes?: string;
  createdAt?: string;
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
  currency: "EGP" | string;
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
 * Calculates Carrier & Broker Balances dynamically from real shipments, recorded transfers, and registered partners:
 * Net Cost = Total Cost - RTO Cost
 * Due Balance = Net Cost - Total Paid (Carrier Transfers)
 */
export function calculateCarrierBalances(
  shipments: Shipment[] = [],
  transfers: CarrierTransfer[] = [],
  carrierPartners: CarrierPartner[] = []
): CarrierBalanceDetails[] {
  const carrierNames = new Set<string>();
  const brokerSet = new Set<string>(MASTER_BROKERS.map((b) => b.toLowerCase().trim()));

  // 1. Registered Carrier Partners
  for (const cp of carrierPartners) {
    if (cp.name && cp.name.trim()) {
      const trimmed = cp.name.trim();
      carrierNames.add(trimmed);
      if (cp.type === "Broker") {
        brokerSet.add(trimmed.toLowerCase());
      }
    }
  }

  // 2. Distinct carriers & brokers from actual shipments
  for (const s of shipments) {
    if (s.carrier && s.carrier.trim()) {
      carrierNames.add(s.carrier.trim());
    }
    if (s.broker && s.broker.trim()) {
      const bTrimmed = s.broker.trim();
      carrierNames.add(bTrimmed);
      brokerSet.add(bTrimmed.toLowerCase());
    }
  }

  // 3. Distinct carriers from recorded transfers
  for (const tr of transfers) {
    if (tr.carrier && tr.carrier.trim()) {
      carrierNames.add(tr.carrier.trim());
    }
  }

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

    // Filter out inactive entries unless there are shipments, transfers, or explicit partner registrations
    const isExplicitPartner = carrierPartners.some((p) => p.name.toLowerCase().trim() === nameNorm);
    if (matchedShipments.length === 0 && totalPaid === 0 && !isExplicitPartner) {
      continue;
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
  transferOfficer?: string; // اسم المحول (المسؤول) from legacy form
  paymentMethod?: string; // طريقة التحويل from legacy form
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


// Initial Datasets (Empty by default; populated purely from backend API endpoints)
export const initialShipments: Shipment[] = [];
export const initialCustomers: Customer[] = [];
export const initialOrders: Order[] = [];
export const initialInvoices: Invoice[] = [];
export const initialCarrierInvoices: CarrierInvoiceItem[] = [];
export const initialWarehouseItems: WarehouseItem[] = [];
export const initialNotifications: NotificationItem[] = [];
export const initialShipmentRequests: ShipmentRequest[] = [];
export const initialCarrierPartners: CarrierPartner[] = [];
export const initialCarrierTransfers: CarrierTransfer[] = [];
export const initialInternalTransfers: InternalTransfer[] = [];
export const initialSalaries: SalaryPayment[] = [];
export const initialInvoiceLosses: InvoiceLoss[] = [];
export const initialWarehouses: WarehouseFacility[] = [];
export const initialBlogPosts: BlogPost[] = [];
export const initialExpenses: BusinessExpense[] = [];

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
      if (r.id !== id && r.requestNumber !== id) return r;

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
    return this.get<Shipment[]>("xspeed_admin_shipments", initialShipments);
  }
  static saveShipments(data: Shipment[]) {
    this.save("xspeed_admin_shipments", data);
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent("shipments_updated", { detail: data }));
    }
  }
  static updateShipment(id: string, patch: Partial<Shipment>): Shipment | null {
    const shipments = this.getShipments();
    let updatedShipment: Shipment | null = null;
    const updated = shipments.map((s) => {
      if (s.id === id || s.awb === id) {
        updatedShipment = { ...s, ...patch };
        return updatedShipment;
      }
      return s;
    });
    this.saveShipments(updated);
    return updatedShipment;
  }
  static addShipment(shipment: Shipment): Shipment {
    const current = this.getShipments();
    const updated = [shipment, ...current.filter((s) => s.id !== shipment.id && s.awb !== shipment.awb)];
    this.saveShipments(updated);
    return shipment;
  }
  static deleteShipment(id: string): boolean {
    const current = this.getShipments();
    const filtered = current.filter((s) => s.id !== id && s.awb !== id);
    this.saveShipments(filtered);
    return true;
  }

  static getOrders(): Order[] {
    return this.get("xspeed_admin_orders", initialOrders);
  }
  static saveOrders(data: Order[]) {
    this.save("xspeed_admin_orders", data);
  }

  static getCustomers(): Customer[] {
    return this.get<Customer[]>("xspeed_admin_customers", initialCustomers);
  }
  static saveCustomers(data: Customer[]) {
    this.save("xspeed_admin_customers", data);
  }

  static getCollections(): CustomerCollection[] {
    return this.get<CustomerCollection[]>("xspeed_admin_collections", []);
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

  // Carrier Invoices Reconciliation (مراجعة وتدقيق فواتير شركات الشحن)
  static getCarrierInvoices(): CarrierInvoiceItem[] {
    return this.get<CarrierInvoiceItem[]>("xspeed_admin_carrier_invoices", initialCarrierInvoices);
  }
  static saveCarrierInvoices(data: CarrierInvoiceItem[]) {
    this.save("xspeed_admin_carrier_invoices", data);
  }
  static addCarrierInvoice(item: CarrierInvoiceItem) {
    const current = this.getCarrierInvoices();
    const updated = [item, ...current];
    this.saveCarrierInvoices(updated);
    return item;
  }
  static addCarrierInvoices(items: CarrierInvoiceItem[]) {
    const current = this.getCarrierInvoices();
    const updated = [...items, ...current];
    this.saveCarrierInvoices(updated);
    return updated;
  }
  static updateCarrierInvoice(id: string, patch: Partial<CarrierInvoiceItem>) {
    const current = this.getCarrierInvoices();
    const updated = current.map((item) => (item.id === id ? { ...item, ...patch } : item));
    this.saveCarrierInvoices(updated);
    return updated;
  }
  static deleteCarrierInvoice(id: string) {
    const current = this.getCarrierInvoices();
    const updated = current.filter((i) => i.id !== id);
    this.saveCarrierInvoices(updated);
    return updated;
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

  // Carrier Partners & Brokers (دليل شركات الشحن والوسطاء)
  static getCarrierPartners(): CarrierPartner[] {
    return this.get("xspeed_admin_carrier_partners", initialCarrierPartners);
  }
  static saveCarrierPartners(data: CarrierPartner[]) {
    this.save("xspeed_admin_carrier_partners", data);
  }
  static addCarrierPartner(partner: CarrierPartner) {
    const current = this.getCarrierPartners();
    const updated = [partner, ...current.filter((p) => p.id !== partner.id)];
    this.saveCarrierPartners(updated);
    return partner;
  }
  static deleteCarrierPartner(id: string) {
    const current = this.getCarrierPartners();
    const updated = current.filter((p) => p.id !== id);
    this.saveCarrierPartners(updated);
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
  "SMSA Express",
  "Express",
  "FedEx Express",
  "Aramex",
  "UPS",
  "TNT Express",
  "DB Schenker USA",
  "Air Cargo",
  "Post/EMS (with USPS)",
  "Container Tracking",
  "Bill Of Lading (B/L)",
] as const;

export const MASTER_BROKERS = [
  "sonbola",
  "XSPEED",
  "Azab",
  "NOK",
];

export const MASTER_SHIPMENT_STATUSES = [
  "In Transit",
  "Delivered",
  "Deliverd",
  "Out for Delivery",
  "Cairo airport",
  "Clerance",
  "destination",
  "in transit",
  "departed",
  "out for delivery",
  "in the way",
  "Information recived",
  "not picked",
  "Clearance Delay",
  "Delayed",
  "Exception",
  "RTO",
  "refused to recive",
  "Re export",
  "destroied",
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
