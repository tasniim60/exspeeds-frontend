import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { ShipmentRequest } from "@/lib/adminData";
import { requireAdmin, getAuthenticatedUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    const requests = ServerStore.getShipmentRequests();

    // If authenticated user is a normal customer, return their authorized requests
    if (authUser && authUser.role !== "admin") {
      const userEmail = (authUser.email || "").toLowerCase().trim();
      const userName = (authUser.name || "").toLowerCase().trim();
      const userPhone = (authUser.phone || "").replace(/[^0-9]/g, "");

      const userRequests = requests.filter((r) => {
        const reqEmail = (r.email || "").toLowerCase().trim();
        const reqCustId = (r.customerId || "").toLowerCase().trim();
        const reqName = (r.customerName || "").toLowerCase().trim();
        const reqPhone = (r.phone || r.whatsapp || "").replace(/[^0-9]/g, "");

        const matchesEmail = Boolean(userEmail && (reqEmail === userEmail || reqCustId === userEmail));
        const matchesName = Boolean(userName && reqName && (reqName === userName || reqName.includes(userName) || userName.includes(reqName)));
        const matchesPhone = Boolean(userPhone && reqPhone && (reqPhone.includes(userPhone) || userPhone.includes(reqPhone)));

        return matchesEmail || matchesName || matchesPhone;
      });
      return NextResponse.json({ success: true, data: userRequests });
    }

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch shipment requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    const body: ShipmentRequest = await request.json();

    if (authUser && authUser.role !== "admin") {
      body.customerId = authUser.email;
      body.customerName = body.customerName || authUser.name;
      body.email = body.email || authUser.email;
      body.companyName = body.companyName || authUser.company || "";
      body.phone = body.phone || authUser.phone || "";
    }

    if (!body.requestNumber) {
      body.requestNumber = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    if (!body.id) {
      body.id = `req-${Date.now()}`;
    }
    if (!body.status) {
      body.status = "New";
    }
    if (!body.createdAt) {
      body.createdAt = new Date().toISOString();
    }
    if (!body.updatedAt) {
      body.updatedAt = new Date().toISOString();
    }

    const saved = ServerStore.addShipmentRequest(body);

    // Trigger Notification for Admin
    ServerStore.addNotification({
      id: `notif-${Date.now()}`,
      title: "New Shipment Request Received",
      message: `Inbound request #${saved.requestNumber} from ${saved.customerName || saved.companyName} (${saved.packageCount || 1} pkg to ${saved.deliveryCountry || saved.deliveryCity}).`,
      severity: "warning",
      category: "shipment",
      timestamp: "Just now",
      isRead: false,
      targetTab: "requests",
      referenceId: saved.requestNumber,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit request" },
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
      return NextResponse.json({ success: false, error: "Missing request ID" }, { status: 400 });
    }
    if (!patch.updatedAt) {
      patch.updatedAt = new Date().toISOString();
    }
    if ((patch.status === "Approved" || patch.agreedPrice) && !patch.approvedAt) {
      patch.approvedAt = new Date().toISOString();
    }
    if (patch.status === "Converted to Shipment") {
      if (!patch.convertedAt) patch.convertedAt = new Date().toISOString();
      if (!patch.approvedAt) patch.approvedAt = patch.convertedAt;
    }
    const updated = ServerStore.updateShipmentRequest(id, patch);

    if (patch.status === "Approved") {
      ServerStore.addNotification({
        id: `notif-${Date.now()}`,
        title: "Request Approved & Priced",
        message: `Request #${updated?.requestNumber || id} approved with agreed price ${patch.quotedPrice || patch.agreedPrice || ""} ${patch.currency || "EGP"}.`,
        severity: "success",
        category: "shipment",
        timestamp: "Just now",
        isRead: false,
        targetTab: "requests",
        referenceId: updated?.requestNumber || id,
      });
    } else if (patch.status === "Converted to Shipment") {
      ServerStore.addNotification({
        id: `notif-${Date.now()}`,
        title: "Request Converted to Live Shipment",
        message: `Request #${updated?.requestNumber || id} successfully converted into AWB ${patch.linkedAwb || "Waybill"}.`,
        severity: "success",
        category: "shipment",
        timestamp: "Just now",
        isRead: false,
        targetTab: "shipments",
        referenceId: patch.linkedAwb,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update request" },
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
      return NextResponse.json({ success: false, error: "Missing request ID" }, { status: 400 });
    }
    ServerStore.deleteShipmentRequest(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete request" },
      { status: 500 }
    );
  }
}
