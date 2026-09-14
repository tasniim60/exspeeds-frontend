import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { BusinessExpense } from "@/lib/adminData";
import { requireAdmin } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const expenses = ServerStore.getExpenses();
    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await req.json();
    if (!body.title || !body.amount) {
      return NextResponse.json(
        { success: false, error: "Missing required expense fields (title, amount)" },
        { status: 400 }
      );
    }

    const newExpense: BusinessExpense = {
      id: body.id || `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: body.title.trim(),
      category: body.category || "Other",
      amount: Number(body.amount),
      currency: body.currency || "EGP",
      date: body.date || new Date().toISOString().split("T")[0],
      payingAccount: body.payingAccount || "CIB account",
      recorder: body.recorder || "مصطفي",
      paymentMethod: body.paymentMethod || "نقدي (كاش)",
      notes: body.notes ? body.notes.trim() : undefined,
      receiptNumber: body.receiptNumber ? body.receiptNumber.trim() : undefined,
      allocatedClient: body.allocatedClient ? body.allocatedClient.trim() : undefined,
      linkedAwb: body.linkedAwb ? body.linkedAwb.trim() : undefined,
      expenseNature: body.expenseNature || "general",
    };

    const saved = ServerStore.addExpense(newExpense);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create expense" },
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

    ServerStore.deleteExpense(id);
    return NextResponse.json({ success: true, message: `Expense ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}

