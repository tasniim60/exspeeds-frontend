import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { Invoice } from "@/lib/adminData";
import { requireAdmin, getAuthenticatedUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const invoices = ServerStore.getInvoices();

    // If customer, only return their invoices
    if (user.role !== "admin") {
      const userEmail = (user.email || "").toLowerCase().trim();
      const userName = (user.name || "").toLowerCase().trim();
      const filtered = invoices.filter((inv) => {
        const cName = (inv.customerName || inv.companyName || "").toLowerCase().trim();
        return cName.includes(userName) || cName.includes(userEmail);
      });
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body: Invoice = await request.json();
    if (!body.invoiceNumber) {
      body.invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!body.id) {
      body.id = `inv-${Date.now()}`;
    }
    if (!body.date) {
      body.date = new Date().toISOString().split("T")[0];
    }
    if (!body.status) {
      body.status = "Pending";
    }

    const saved = ServerStore.addInvoice(body);

    ServerStore.addNotification({
      id: `notif-${Date.now()}`,
      title: "Commercial Invoice Issued",
      message: `Invoice ${saved.invoiceNumber} generated for ${saved.companyName || saved.customerName} (${saved.totalAmount} ${saved.currency || "EGP"}).`,
      severity: "info",
      category: "invoice",
      timestamp: "Just now",
      isRead: false,
      targetTab: "invoices",
      referenceId: saved.invoiceNumber,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invoice" },
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
      return NextResponse.json({ success: false, error: "Missing invoice ID" }, { status: 400 });
    }
    const updated = ServerStore.updateInvoice(id, patch);

    if (patch.status === "Paid") {
      ServerStore.addNotification({
        id: `notif-${Date.now()}`,
        title: "Payment Received",
        message: `Invoice ${updated?.invoiceNumber || id} marked as Paid (${updated?.totalAmount} ${updated?.currency || "EGP"}).`,
        severity: "success",
        category: "invoice",
        timestamp: "Just now",
        isRead: false,
        targetTab: "invoices",
        referenceId: updated?.invoiceNumber,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update invoice" },
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
      return NextResponse.json({ success: false, error: "Missing invoice ID" }, { status: 400 });
    }
    ServerStore.deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
