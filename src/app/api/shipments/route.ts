import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { Shipment } from "@/lib/adminData";

export const dynamic = "force-dynamic";

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000/api";

export async function GET() {
  try {
    // 1. Try Laravel DB if available
    try {
      const res = await fetch(`${LARAVEL_API_URL}/admin/shipments`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(600),
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data || json;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: Shipment[] = items.map((item: any) => ({
            id: `shp-${item.id}`,
            awb: item.awb || `XS-${Math.floor(10000000 + Math.random() * 90000000)}`,
            date: item.date || new Date().toISOString().split("T")[0],
            account: item.account || "ACC-8801",
            company: item.company || "Enterprise Partner",
            senderName: item.user?.name || "Sender Office",
            senderCity: "Cairo, Egypt",
            receiverName: item.receiver_name || "Consignee Client",
            receiverCity: item.receiver_city || "Dubai",
            country: item.country || "United Arab Emirates",
            carrier: (item.carrier as any) || "XSPEED Express",
            weight: Number(item.weight) || 5.0,
            length: 40,
            width: 30,
            height: 25,
            volumetricWeight: 6.0,
            dim: item.dim || "40x30x25 cm",
            priceEgp: Number(item.price_egp) || 1200,
            priceUsd: Number(item.usd_rice_co) || 40,
            status: item.status || "In Transit",
            originHub: "Cairo Central Gateway",
            destinationHub: "Regional Hub",
            currentLocation: "Package processed in transit",
            serviceType: "Next-Day Air",
            timeline: [
              { status: "Shipment Created & Label Printed", location: "Origin Hub", timestamp: "Today", completed: true },
              { status: "In Transit to Destination", location: "Cargo Terminal", timestamp: "Now", completed: true, current: true },
            ],
          }));
          return NextResponse.json({ success: true, data: mapped });
        }
      }
    } catch {
      // Fall through to real persistent store
    }

    // 2. Return real persisted store records
    const shipments = ServerStore.getShipments();
    return NextResponse.json({ success: true, data: shipments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: Shipment = await request.json();
    if (!body.awb) {
      body.awb = `XS-${Math.floor(10000000 + Math.random() * 90000000)}`;
    }
    if (!body.id) {
      body.id = `shp-${Date.now()}`;
    }
    if (!body.date) {
      body.date = new Date().toISOString().split("T")[0];
    }

    // Attempt to sync with Laravel DB if accessible
    try {
      const res = await fetch(`${LARAVEL_API_URL}/admin/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          awb: body.awb,
          date: body.date,
          account: body.account || "ACC-8801",
          receiver_name: body.receiverName || "Consignee Client",
          country: body.country || "Egypt",
          carrier: body.carrier || "XSPEED Express",
          weight: body.weight || 1.0,
          dim: body.dim || "30x20x15 cm",
          company: body.company || "Enterprise Partner",
          price_egp: body.priceEgp || 500,
          usd_rice_co: body.priceUsd || 15,
          status: body.status || "Pending",
        }),
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.id) {
          body.id = `shp-${json.data.id}`;
        }
      }
    } catch {
      // Backend offline: keep generated ID and persist locally
    }

    // Save to real persistent store
    const saved = ServerStore.addShipment(body);

    // Also notify real system stream
    ServerStore.addNotification({
      id: `notif-${Date.now()}`,
      title: "New AWB Booked",
      message: `Shipment ${saved.awb} (${saved.serviceType || "Express"}) created for ${saved.company} to ${saved.country}.`,
      severity: "info",
      category: "shipment",
      timestamp: "Just now",
      isRead: false,
      targetTab: "shipments",
      referenceId: saved.awb,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing shipment ID" }, { status: 400 });
    }
    const updated = ServerStore.updateShipment(id, patch);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update shipment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing shipment ID" }, { status: 400 });
    }
    ServerStore.deleteShipment(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete shipment" },
      { status: 500 }
    );
  }
}
