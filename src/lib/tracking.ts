/**
 * Carrier Tracking & Redirect Utility
 */

export interface CarrierOption {
  id: string;
  name: string;
  displayName: string;
  code: string;
  placeholder?: string;
  isExternal: boolean;
  category?: "courier" | "freight" | "ocean" | "postal";
}

export const CARRIERS: CarrierOption[] = [
  {
    id: "SMSA",
    name: "SMSA Express",
    displayName: "SMSA Express",
    code: "SMSA",
    placeholder: "Enter SMSA Express tracking number...",
    isExternal: true,
    category: "courier",
  },
  {
    id: "DHL",
    name: "Express",
    displayName: "Express",
    code: "Express",
    placeholder: "Enter DHL tracking number...",
    isExternal: true,
    category: "courier",
  },
  {
    id: "FedEx",
    name: "FedEx Express",
    displayName: "FedEx Express",
    code: "FDX",
    placeholder: "Enter FedEx tracking number...",
    isExternal: true,
    category: "courier",
  },
  {
    id: "Aramex",
    name: "Aramex",
    displayName: "Aramex",
    code: "ARX",
    placeholder: "Enter Aramex tracking number...",
    isExternal: true,
    category: "courier",
  },
  {
    id: "UPS",
    name: "UPS",
    displayName: "UPS",
    code: "UPS",
    placeholder: "Enter UPS tracking number...",
    isExternal: true,
    category: "courier",
  },
  {
    id: "TNT",
    name: "TNT Express",
    displayName: "TNT Express",
    code: "TNT",
    placeholder: "Enter TNT tracking number...",
    isExternal: true,
    category: "courier",
  },
  {
    id: "DBSchenker",
    name: "DB Schenker USA",
    displayName: "DB Schenker USA",
    code: "DBS",
    placeholder: "Enter DB Schenker tracking number...",
    isExternal: true,
    category: "freight",
  },
  {
    id: "AirCargo",
    name: "Air Cargo",
    displayName: "Air Cargo",
    code: "AC",
    placeholder: "Enter Air Cargo AWB (e.g. 074-12345675)...",
    isExternal: true,
    category: "freight",
  },
  {
    id: "PostEMS",
    name: "Post/EMS (with USPS)",
    displayName: "Post/EMS (with USPS)",
    code: "EMS",
    placeholder: "Enter Post / EMS / USPS tracking number...",
    isExternal: true,
    category: "postal",
  },
  {
    id: "Container",
    name: "Container Tracking",
    displayName: "Container Tracking",
    code: "CONT",
    placeholder: "Enter Container number (e.g. MSCU1234567)...",
    isExternal: true,
    category: "ocean",
  },
  {
    id: "BillOfLading",
    name: "Bill Of Lading (B/L)",
    displayName: "Bill Of Lading (B/L)",
    code: "BL",
    placeholder: "Enter Bill of Lading (B/L) number...",
    isExternal: true,
    category: "ocean",
  },
];

export const CARRIER_URL_TEMPLATES: Record<string, string> = {
  SMSA: "https://www.smsaexpress.com/trackingdetails?tracknumbers%5B0%5D={AWB}",
  DHL: "https://www.dhl.com/eg-en/home/tracking/tracking-express.html?submit=1&tracking-id={AWB}",
  Express: "https://www.dhl.com/eg-en/home/tracking/tracking-express.html?submit=1&tracking-id={AWB}",
  UPS: "https://www.ups.com/track?tracknum={AWB}",
  TNT: "https://www.tnt.com/express/en_gc/site/shipping-tools/tracking.html?cons={AWB}",
  FedEx: "https://www.fedex.com/fedextrack/?trknbr={AWB}",
  Aramex: "https://www.aramex.com/track/results?mode=0&ShipmentNumber={AWB}",
  AramexAir: "https://www.aramex.com/track/results?mode=0&ShipmentNumber={AWB}",
  DBSchenker: "https://eschenker.dbschenker.com/nges-portal/public/en-US_US/#!/tracking/customer-search?query={AWB}",
  AirCargo: "https://www.track-trace.com/aircargo?number={AWB}",
  PostEMS: "https://tools.usps.com/go/TrackConfirmAction?tLabels={AWB}",
  Container: "https://www.track-trace.com/container?number={AWB}",
  BillOfLading: "https://www.track-trace.com/bol?number={AWB}",
};

/**
 * Trims whitespace and spaces from AWB tracking string
 */
export function cleanAwbNumber(rawAwb: string): string {
  if (!rawAwb) return "";
  return rawAwb.replace(/\s+/g, "").trim();
}

/**
 * Normalizes carrier name into standard carrier key
 */
export function getCarrierKey(carrierInput?: string | null): string {
  if (!carrierInput) return "SMSA";
  const c = carrierInput.toUpperCase().trim();
  if (c === "SMSA" || c.includes("SMSA")) return "SMSA";
  if (c === "DHL" || c === "EXPRESS" || c.includes("DHL")) return "DHL";
  if (c === "UPS" || c.includes("UPS")) return "UPS";
  if (c === "TNT" || c.includes("TNT")) return "TNT";
  if (c === "FEDEX" || c.includes("FEDEX") || c === "FDX") return "FedEx";
  if (c === "ARAMEX" || c.includes("ARAMEX") || c === "ARX") return "Aramex";
  if (c.includes("SCHENKER") || c === "DBS" || c.includes("DBS")) return "DBSchenker";
  if (c.includes("CARGO") || c.includes("AIR") || c === "AC") return "AirCargo";
  if (c.includes("POST") || c.includes("EMS") || c.includes("USPS")) return "PostEMS";
  if (c.includes("CONTAINER") || c === "CONT" || c.includes("CONT")) return "Container";
  if (c.includes("LADING") || c.includes("BILL") || c.includes("B/L") || c === "BL") return "BillOfLading";
  return "SMSA";
}

/**
 * Gets the official external tracking URL for a given carrier and AWB
 */
export function getExternalTrackingUrl(carrierInput: string, rawAwb: string): string | null {
  const cleanAwb = cleanAwbNumber(rawAwb);
  if (!cleanAwb) return null;

  const key = getCarrierKey(carrierInput);
  const template = CARRIER_URL_TEMPLATES[key];
  if (!template) return null;

  return template.replace("{AWB}", encodeURIComponent(cleanAwb));
}

export interface TrackResult {
  success: boolean;
  isExternal: boolean;
  carrierKey: string;
  carrierName: string;
  cleanAwb: string;
  redirectUrl: string | null;
  error?: string;
}

/**
 * Handles tracking execution:
 * Opens official tracking page in a new window for the specified carrier.
 */
export function trackShipment(carrierInput: string, rawAwb: string): TrackResult {
  const cleanAwb = cleanAwbNumber(rawAwb);
  if (!cleanAwb) {
    return {
      success: false,
      isExternal: false,
      carrierKey: "",
      carrierName: "",
      cleanAwb: "",
      redirectUrl: null,
      error: "empty_awb",
    };
  }

  const carrierKey = getCarrierKey(carrierInput);
  const carrierObj = CARRIERS.find((c) => c.id === carrierKey) || CARRIERS[0];
  const redirectUrl = getExternalTrackingUrl(carrierKey, cleanAwb);

  if (redirectUrl && typeof window !== "undefined") {
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
  }

  return {
    success: true,
    isExternal: true,
    carrierKey,
    carrierName: carrierObj.name,
    cleanAwb,
    redirectUrl,
  };
}

/**
 * Returns direct WhatsApp support URL with prefilled message
 */
export function getWhatsAppSupportUrl(carrierName?: string, awb?: string): string {
  const phone = "201208027171";
  let message = "مرحباً، أحتاج إلى مساعدة بشأن تتبع شحنتي على إكس سبيد.";
  if (carrierName && awb) {
    message = `مرحباً، أحتاج إلى مساعدة في تتبع الشحنة رقم (${awb}) على شركة (${carrierName}).`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
