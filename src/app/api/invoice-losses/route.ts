import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { InvoiceLoss } from "@/lib/adminData";
import { requireAdmin } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const losses = ServerStore.getInvoiceLosses();
    return NextResponse.json({ success: true, data: losses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invoice losses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await req.json();
    if (!body.awb || !body.lossAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (awb, lossAmount)" },
        { status: 400 }
      );
    }

    const newLoss: InvoiceLoss = {
      id: body.id || `loss-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      awb: body.awb.trim(),
      clientName: (body.clientName || "").trim(),
      lossAmount: Number(body.lossAmount),
      currency: body.currency || "EGP",
      lossDate: body.lossDate || new Date().toISOString().split("T")[0],
      shipmentDate: body.shipmentDate || body.lossDate || new Date().toISOString().split("T")[0],
      reason: body.reason || "other",
      status: body.status || "deducted",
      recordedBy: body.recordedBy || "مصطفي",
      notes: body.notes ? body.notes.trim() : undefined,
    };

    const saved = ServerStore.addInvoiceLoss(newLoss);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record invoice loss" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }

    ServerStore.deleteInvoiceLoss(id);
    return NextResponse.json({ success: true, message: `Invoice loss ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete invoice loss" },
      { status: 500 }
    );
  }
}

