import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { CarrierPartner } from "@/lib/adminData";
import { requireAdmin } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const partners = ServerStore.getCarrierPartners();
    return NextResponse.json({ success: true, data: partners });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch carrier partners" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if ("errorResponse" in auth) return auth.errorResponse;

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Missing required field (name)" },
        { status: 400 }
      );
    }

    const newPartner: CarrierPartner = {
      id: body.id || `cp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: body.name.trim(),
      type: body.type === "Broker" ? "Broker" : "Carrier",
      contactPerson: body.contactPerson ? body.contactPerson.trim() : undefined,
      phone: body.phone ? body.phone.trim() : undefined,
      email: body.email ? body.email.trim() : undefined,
      defaultCurrency: body.defaultCurrency || "EGP",
      notes: body.notes ? body.notes.trim() : undefined,
      createdAt: body.createdAt || new Date().toISOString().split("T")[0],
    };

    const saved = ServerStore.addCarrierPartner(newPartner);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create carrier partner" },
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

    ServerStore.deleteCarrierPartner(id);
    return NextResponse.json({ success: true, message: `Carrier partner ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete carrier partner" },
      { status: 500 }
    );
  }
}

