import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { InternalTransfer } from "@/lib/adminData";
import { requireAdmin } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const transfers = ServerStore.getInternalTransfers();
    return NextResponse.json({ success: true, data: transfers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch internal transfers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await req.json();
    if (!body.fromAccount || !body.toAccount || !body.amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (fromAccount, toAccount, amount)" },
        { status: 400 }
      );
    }

    const newTransfer: InternalTransfer = {
      id: body.id || `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fromAccount: body.fromAccount.trim(),
      toAccount: body.toAccount.trim(),
      amount: Number(body.amount),
      currency: body.currency || "EGP",
      date: body.date || new Date().toISOString().split("T")[0],
      fee: Number(body.fee || 0),
      referenceNumber: body.referenceNumber ? body.referenceNumber.trim() : undefined,
      recordedBy: body.recordedBy || "ضبش",
      notes: body.notes ? body.notes.trim() : undefined,
    };

    const saved = ServerStore.addInternalTransfer(newTransfer);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create internal transfer" },
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

    ServerStore.deleteInternalTransfer(id);
    return NextResponse.json({ success: true, message: `Internal transfer ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete internal transfer" },
      { status: 500 }
    );
  }
}

