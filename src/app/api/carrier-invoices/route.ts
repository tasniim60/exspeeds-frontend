import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { CarrierInvoiceItem } from "@/lib/adminData";
import { requireAdmin, getAuthenticatedUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const items = ServerStore.getCarrierInvoices();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch carrier invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await request.json();

    // Support single item or bulk array
    if (Array.isArray(body)) {
      const items: CarrierInvoiceItem[] = body.map((item) => ({
        ...item,
        id: item.id || `cinv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        createdAt: item.createdAt || new Date().toISOString(),
      }));
      const saved = ServerStore.addCarrierInvoices(items);
      return NextResponse.json({ success: true, data: saved });
    }

    const item: CarrierInvoiceItem = {
      ...body,
      id: body.id || `cinv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = ServerStore.addCarrierInvoice(item);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create carrier invoice" },
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

    const updated = ServerStore.updateCarrierInvoice(id, patch);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update carrier invoice" },
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

    ServerStore.deleteCarrierInvoice(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete carrier invoice" },
      { status: 500 }
    );
  }
}

