import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { WarehouseItem } from "@/lib/adminData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = ServerStore.getWarehouseItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch warehouse items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: WarehouseItem = await request.json();
    if (!body.sku) {
      body.sku = `SKU-PAL-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!body.id) {
      body.id = `wh-item-${Date.now()}`;
    }
    if (!body.inboundDate) {
      body.inboundDate = new Date().toISOString().split("T")[0];
    }
    if (!body.status) {
      body.status = "Stored";
    }

    const saved = ServerStore.addWarehouseItem(body);

    ServerStore.addNotification({
      id: `notif-${Date.now()}`,
      title: "Warehouse Inbound Received",
      message: `Consignment ${saved.sku} (${saved.name}) allocated to ${saved.bayLocation || saved.zone} at ${saved.warehouseId}.`,
      severity: "info",
      category: "warehouse",
      timestamp: "Just now",
      isRead: false,
      targetTab: "warehouse",
      referenceId: saved.sku,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add warehouse item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing warehouse item ID" }, { status: 400 });
    }
    const updated = ServerStore.updateWarehouseItem(id, patch);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update warehouse item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing item ID" }, { status: 400 });
    }
    ServerStore.deleteWarehouseItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete warehouse item" },
      { status: 500 }
    );
  }
}
