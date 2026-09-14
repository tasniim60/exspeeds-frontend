import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { SalaryPayment } from "@/lib/adminData";
import { requireAdmin } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const salaries = ServerStore.getSalaries();
    return NextResponse.json({ success: true, data: salaries });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch salaries" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await req.json();
    if (!body.employeeName || !body.amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (employeeName, amount)" },
        { status: 400 }
      );
    }

    const newPayment: SalaryPayment = {
      id: body.id || `sal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeName: body.employeeName.trim(),
      type: body.type || "salary",
      amount: Number(body.amount),
      currency: body.currency || "EGP",
      date: body.date || new Date().toISOString().split("T")[0],
      payingAccount: body.payingAccount || "CIB account",
      period: body.period || new Date().toISOString().slice(0, 7),
      recordedBy: body.recordedBy || "ضبش",
      notes: body.notes ? body.notes.trim() : undefined,
    };

    const saved = ServerStore.addSalary(newPayment);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record salary payment" },
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

    ServerStore.deleteSalary(id);
    return NextResponse.json({ success: true, message: `Salary payment ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete salary payment" },
      { status: 500 }
    );
  }
}

