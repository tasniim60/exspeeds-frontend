const fs = require('fs');
const path = require('path');

const parsedPath = path.join(__dirname, 'parsed_shipments.json');
const parsedShipments = JSON.parse(fs.readFileSync(parsedPath, 'utf8'));

const adminDataTsPath = path.join(__dirname, '../src/lib/adminData.ts');
let adminDataContent = fs.readFileSync(adminDataTsPath, 'utf8');

// Replace Shipment interface to include new AppSheet fields
const oldInterface = `export interface Shipment {
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
  carrier: "XSPEED Express" | "DHL Express" | "FedEx Priority" | "Aramex Air" | "UPS Worldwide";
  weight: number; // in kg
  length: number;
  width: number;
  height: number;
  volumetricWeight: number;
  dim: string;
  priceEgp: number;
  priceUsd: number;
  status: "In Transit" | "Delivered" | "Out for Delivery" | "Delayed" | "Exception" | "Pending Pickup";
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
}`;

const newInterface = `export interface Shipment {
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
  status: "In Transit" | "Delivered" | "Out for Delivery" | "Delayed" | "Exception" | "Pending Pickup";
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
}`;

adminDataContent = adminDataContent.replace(oldInterface, newInterface);

// Replace initialShipments empty array with parsed dataset
const oldInitialShipments = `export const initialShipments: Shipment[] = [];`;
const newInitialShipments = `export const initialShipments: Shipment[] = ${JSON.stringify(parsedShipments, null, 2)};`;

adminDataContent = adminDataContent.replace(oldInitialShipments, newInitialShipments);

fs.writeFileSync(adminDataTsPath, adminDataContent);
console.log('Successfully updated adminData.ts with AppSheet fields and 154 initial shipments.');
