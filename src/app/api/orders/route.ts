import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { Order } from "@/lib/adminData";
import { requireAdmin, getAuthenticatedUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = ServerStore.getOrders();

    // If customer, filter to user orders
    if (user.role !== "admin") {
      const userEmail = (user.email || "").toLowerCase().trim();
      const userName = (user.name || "").toLowerCase().trim();
      const filtered = orders.filter((o) => {
        const cName = (o.customerName || o.companyName || "").toLowerCase().trim();
        return cName.includes(userName) || cName.includes(userEmail);
      });
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body: Order = await request.json();
    if (!body.orderNumber) {
      body.orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!body.id) {
      body.id = `ord-${Date.now()}`;
    }
    if (!body.date) {
      body.date = new Date().toISOString().split("T")[0];
    }
    if (!body.status) {
      body.status = "New Bookings";
    }

    const saved = ServerStore.addOrder(body);

    ServerStore.addNotification({
      id: `notif-${Date.now()}`,
      title: "New Commercial Booking",
      message: `Order ${saved.orderNumber} created for ${saved.companyName || saved.customerName} (${saved.totalWeight} kg).`,
      severity: "info",
      category: "order",
      timestamp: "Just now",
      isRead: false,
      targetTab: "orders",
      referenceId: saved.orderNumber,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing order ID" }, { status: 400 });
    }
    const updated = ServerStore.updateOrder(id, patch);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing order ID" }, { status: 400 });
    }
    ServerStore.deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}
