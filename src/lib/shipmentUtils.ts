import type { Shipment } from "@/lib/adminData";

export type TimelineEntry = NonNullable<Shipment["timeline"]>[number];

/**
 * Builds an updated timeline array for a shipment status change.
 * Reused across quick status change, status modal, and inspect panel.
 */
export function buildUpdatedTimeline(
  existingTimeline: TimelineEntry[] | undefined,
  newStatus: string,
  newLocation: string,
  note?: string
): TimelineEntry[] {
  const nowFormatted = new Date().toISOString().replace("T", " ").substring(0, 16);

  let validPastTimeline = (existingTimeline || []).filter((t) => t.completed);
  if (validPastTimeline.length === 0 && existingTimeline && existingTimeline.length > 0) {
    validPastTimeline = [existingTimeline[0]];
  }

  const lastItem = validPastTimeline[validPastTimeline.length - 1];

  // Deduplicate: if the last item matches exactly, just update its timestamp
  if (lastItem && lastItem.status === newStatus && lastItem.location === newLocation) {
    return [
      ...validPastTimeline.slice(0, -1),
      { ...lastItem, timestamp: nowFormatted, note: note || lastItem.note, current: true },
    ];
  }

  // Otherwise append a new milestone
  return [
    ...validPastTimeline.map((t) => ({ ...t, current: false })),
    {
      status: newStatus,
      location: newLocation,
      timestamp: nowFormatted,
      completed: true,
      current: true,
      note,
    },
  ];
}

/**
 * Returns a sensible default location string based on the new status.
 */
export function getDefaultLocationForStatus(
  newStatus: string,
  shipment: Pick<Shipment, "currentLocation" | "country" | "receiverCity">
): string {
  const lower = newStatus.toLowerCase();
  if (lower.includes("deliver")) {
    return shipment.country ? `${shipment.country} (Delivered)` : "Destination Consignee";
  }
  if (lower.includes("cairo airport")) {
    return "Cairo International Airport Hub";
  }
  if (lower.includes("clearance") || lower.includes("clerance")) {
    return "Customs Air Port Clearance Terminal";
  }
  if (lower.includes("out for delivery")) {
    return `${shipment.receiverCity || shipment.country || "Destination"} Delivery Vehicle`;
  }
  if (lower.includes("destination")) {
    return `${shipment.country || "Destination"} Sorting Hub`;
  }
  return shipment.currentLocation || "In Transit Gateway";
}
