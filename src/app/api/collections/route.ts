import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { CustomerCollection } from "@/lib/adminData";
import { requireAdmin } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const collections = ServerStore.getCollections();
    return NextResponse.json({ success: true, data: collections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await req.json();
    if (!body.clientName || !body.amount) {
      return NextResponse.json(
        { success: false, error: "Missing required collection fields (clientName, amount)" },
        { status: 400 }
      );
    }

    const newCollection: CustomerCollection = {
      id: body.id || `col-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: body.customerId,
      clientName: body.clientName.trim(),
      amount: Number(body.amount),
      currency: body.currency || "EGP",
      date: body.date || new Date().toISOString().split("T")[0],
      receivingAccount: body.receivingAccount || "CIB account",
      paymentMethod: body.paymentMethod || "نقدي (كاش)",
      receiptNumber: body.receiptNumber ? body.receiptNumber.trim() : undefined,
      recordedBy: body.recordedBy || "مصطفي",
      notes: body.notes ? body.notes.trim() : undefined,
    };

    const saved = ServerStore.addCollection(newCollection);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create collection" },
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
      return NextResponse.json({ success: false, error: "Missing collection id" }, { status: 400 });
    }

    const ok = ServerStore.deleteCollection(id);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete collection" },
      { status: 500 }
    );
  }
}

