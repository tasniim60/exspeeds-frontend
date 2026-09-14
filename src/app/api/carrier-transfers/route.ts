import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { CarrierTransfer } from "@/lib/adminData";
import { requireAdmin } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const transfers = ServerStore.getCarrierTransfers();
    return NextResponse.json({ success: true, data: transfers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch carrier transfers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await req.json();
    if (!body.carrier || !body.amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (carrier, amount)" },
        { status: 400 }
      );
    }

    const newTransfer: CarrierTransfer = {
      id: body.id || `ct-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      carrier: body.carrier.trim(),
      amount: Number(body.amount),
      currency: body.currency || "EGP",
      date: body.date || new Date().toISOString().split("T")[0],
      payingAccount: body.payingAccount || "CIB account",
      paymentMethod: body.paymentMethod || "تحويل بنكي",
      referenceNumber: body.referenceNumber ? body.referenceNumber.trim() : undefined,
      recordedBy: body.recordedBy || "ضبش",
      notes: body.notes ? body.notes.trim() : undefined,
    };

    const saved = ServerStore.addCarrierTransfer(newTransfer);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create carrier transfer" },
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

    ServerStore.deleteCarrierTransfer(id);
    return NextResponse.json({ success: true, message: `Carrier transfer ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete carrier transfer" },
      { status: 500 }
    );
  }
}

