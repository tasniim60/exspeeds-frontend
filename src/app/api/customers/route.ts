import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";
import { Customer } from "@/lib/adminData";

export const dynamic = "force-dynamic";

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000/api";

export async function GET() {
  try {
    // 1. Try Laravel DB if available
    try {
      const res = await fetch(`${LARAVEL_API_URL}/admin/users`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(600),
      });
      if (res.ok) {
        const json = await res.json();
        const users = json.data || json;
        if (Array.isArray(users) && users.length > 0) {
          const mapped: Customer[] = users.map((u: any, idx: number) => ({
            id: `CUST-${u.id || 400 + idx}`,
            code: `ACC-${8800 + idx}`,
            name: u.name || "Client Name",
            company: u.company || u.name,
            email: u.email || "client@company.com",
            phone: u.phone || "+20 100 000 0000",
            country: u.country || "Egypt",
            city: u.city || "Cairo",
            tier: u.tier || "Enterprise VIP",
            creditLimit: 30000,
            currentBalance: 0,
            totalShipments: u.shipments_count || 0,
            lifetimeSpend: 0,
            taxRegistrationNumber: u.tax_number || `EG-${900 + idx}-100-200`,
            assignedManager: "Operations Desk",
            activeContracts: 1,
            joinedDate: u.created_at ? u.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            status: "Active",
          }));
          return NextResponse.json({ success: true, data: mapped });
        }
      }
    } catch {
      // Fall through to real persistent store
    }

    const customers = ServerStore.getCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: Customer = await request.json();
    if (!body.id) {
      body.id = `CUST-${Math.floor(100 + Math.random() * 900)}`;
    }
    if (!body.code) {
      body.code = `ACC-${Math.floor(8800 + Math.random() * 100)}`;
    }
    if (!body.joinedDate) {
      body.joinedDate = new Date().toISOString().split("T")[0];
    }
    if (!body.status) {
      body.status = "Active";
    }

    const saved = ServerStore.addCustomer(body);

    ServerStore.addNotification({
      id: `notif-${Date.now()}`,
      title: "New Corporate Client Registered",
      message: `Customer account ${saved.code} created for ${saved.company} (${saved.tier}).`,
      severity: "success",
      category: "system",
      timestamp: "Just now",
      isRead: false,
      targetTab: "customers",
      referenceId: saved.code,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing customer ID" }, { status: 400 });
    }
    const updated = ServerStore.updateCustomer(id, patch);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing customer ID" }, { status: 400 });
    }
    ServerStore.deleteCustomer(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}
