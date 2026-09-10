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
  return <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-body">{children}</div>;
}
