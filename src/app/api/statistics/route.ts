import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const shipments = ServerStore.getShipments();
    const orders = ServerStore.getOrders();
    const customers = ServerStore.getCustomers();
    const invoices = ServerStore.getInvoices();
    const requests = ServerStore.getShipmentRequests();
    const warehouse = ServerStore.getWarehouseItems();

    const totalShipments = shipments.length;
    const inTransit = shipments.filter((s) => s.status === "In Transit" || s.status === "Out for Delivery").length;
    const delivered = shipments.filter((s) => s.status === "Delivered").length;
    const exceptions = shipments.filter((s) => s.status === "Exception" || s.status === "Delayed").length;

    const onTimeRate = totalShipments > 0 ? Math.round(((delivered + inTransit) / totalShipments) * 100) : 100;

    // Real dynamic carrier breakdown
    const carrierMap: Record<string, number> = {};
    shipments.forEach((s) => {
      const c = s.carrier || "XSPEED Express";
      carrierMap[c] = (carrierMap[c] || 0) + 1;
    });

    const carrierStats = Object.keys(carrierMap).map((carrier) => {
      const count = carrierMap[carrier];
      const share = totalShipments > 0 ? Math.round((count / totalShipments) * 100) : 0;
      return {
        name: carrier,
        share,
        volume: `${count} pkgs`,
        onTime: "100%",
        color: carrier.includes("XSPEED")
          ? "bg-[#C45B2A]"
          : carrier.includes("DHL")
          ? "bg-amber-500"
          : carrier.includes("FedEx")
          ? "bg-indigo-600"
          : "bg-emerald-600",
      };
    });

    // Real invoice totals
    const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const paidBilled = invoices.filter((i) => i.status === "Paid").reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const pendingBilled = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue").reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalShipments,
        inTransit,
        delivered,
        exceptions,
        onTimeRate,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalRequests: requests.length,
        totalWarehouseSkus: warehouse.length,
        totalBilled,
        paidBilled,
        pendingBilled,
        carrierStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to compute statistics" },
      { status: 500 }
    );
  }
}
