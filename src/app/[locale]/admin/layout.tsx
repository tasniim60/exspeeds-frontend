import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XSPEED Operations & Admin Command Center",
  description:
    "Enterprise logistics admin dashboard: Real-time statistics, AWB shipments, client orders, customer CRM, financial invoices, smart warehouse, live telemetry, and reports.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-brand-dark font-body admin-canvas selection:bg-brand-orange/20 selection:text-brand-orange">
      {children}
    </div>
  );
}
