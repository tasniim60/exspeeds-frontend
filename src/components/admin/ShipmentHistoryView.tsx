"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Download,
  Filter,
  Package,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Truck,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Shipment, Customer } from "@/lib/adminData";
import { TrackingRedirect } from "@/components/TrackingRedirect";
import { useLanguage } from "@/context/LanguageContext";

interface ShipmentHistoryViewProps {
  shipments: Shipment[];
  customers?: Customer[];
  onUpdateShipment?: (shipment: Shipment) => void;
}

export const ShipmentHistoryView: React.FC<ShipmentHistoryViewProps> = ({
  shipments,
  customers = [],
  onUpdateShipment,
}) => {
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");

  // Account Assignment Modal State
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [assignAccount, setAssignAccount] = useState("");

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.awb.toLowerCase().includes(search.toLowerCase()) ||
      s.account.toLowerCase().includes(search.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      (s.contents && s.contents.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || s.status === statusFilter || (s.currentLocation && s.currentLocation.toLowerCase().includes(statusFilter.toLowerCase()));
    const matchesCarrier = carrierFilter === "all" || s.carrier.toLowerCase().includes(carrierFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCarrier;
  });

  const handleSaveAssign = () => {
    if (!selectedShipment || !onUpdateShipment || !assignAccount.trim()) return;
    const updated = {
      ...selectedShipment,
      account: assignAccount.trim(),
      company: assignAccount.trim(),
    };
    onUpdateShipment(updated);
    setSelectedShipment(null);
  };

  const exportCsv = () => {
    const headers = [
      "Date",
      "Status",
      "AWB",
      "Account",
      "Consignee",
      "Contents",
      "Destination",
      "Carrier",
      "Broker",
      "Final Weight (KG)",
      "Cost Price (EGP)",
      "Selling Price (EGP)",
      "Net Profit (EGP)",
      "Agent",
    ];

    const rows = filteredShipments.map((s) => [
      s.date,
      s.currentLocation || s.status,
      s.awb,
      `"${s.account}"`,
      `"${s.receiverName}"`,
      `"${s.contents || ""}"`,
      `"${s.country}"`,
      s.carrier,
      s.broker || "XSpeed",
      s.weight,
      s.costPrice || 0,
      s.sellingPrice || s.priceEgp,
      s.netProfit || 0,
      s.agentName || "مصطفي",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shipment_History_Manifest_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-[#251516] flex items-center gap-2">
            <History className="h-6 w-6 text-[#C45B2A]" />
            <span>{isRTL ? "سجل حركة الشحنات والترانزيت" : "Shipment History & Manifest Ledger"}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRTL
              ? "متابعة مسار حركة الشحنات الجارية والمنتهية، شركات النقل، الترانزيت، وتخصيص الحسابات"
              : "Live movement history, in-transit status updates, carriers, and shipper account assignment"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportCsv}
            variant="outline"
            size="sm"
            className="text-xs font-bold border-gray-300 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>{isRTL ? "تصدير CSV" : "Export Manifest CSV"}</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="shadow-2xs border border-gray-200/90">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-2.5 h-4 w-4 text-gray-400`} />
              <Input
                placeholder={isRTL ? "بحث بالبوليصة، الحساب، المستلم..." : "Search AWB, Account, Consignee..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${isRTL ? "pr-9" : "pl-9"} h-9 text-xs`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <option value="all">{isRTL ? "جميع الحالات" : "All Statuses"}</option>
                <option value="in the way">{isRTL ? "في الطريق (In the way)" : "In the way"}</option>
                <option value="destination">{isRTL ? "وصل دولة الوصول (Destination)" : "Destination"}</option>
                <option value="Cairo airport">{isRTL ? "مطار القاهرة (Cairo airport)" : "Cairo airport"}</option>
                <option value="Deliverd">{isRTL ? "تم التسليم (Delivered)" : "Delivered"}</option>
                <option value="Exception">{isRTL ? "مسترجعة / مرتجع (RTO)" : "Exception / RTO"}</option>
              </select>

              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <option value="all">{isRTL ? "جميع الناقلين" : "All Carriers"}</option>
                <option value="FEDEX">FedEx Priority</option>
                <option value="DHL">Express</option>
                <option value="SMSA">SMSA Express</option>
                <option value="Aramex">Aramex Air</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Ledger Table */}
      <Card className="shadow-2xs overflow-hidden border border-gray-200/90">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/90 hover:bg-gray-50/90 text-xs">
                <TableHead className="font-bold text-gray-700">{isRTL ? "التاريخ" : "Date"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "حالة الشحنة" : "Shipment Status"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "رقم البوليصة (AWB)" : "AWB #"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "اسم العميل (Account)" : "Account"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "اسم المستلم" : "Consignee"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "المحتويات" : "Contents"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "البلد المستقبِلة" : "Destination"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "الناقل والوسيط" : "Carrier / Broker"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "الوزن النهائي" : "Chargeable Wt"}</TableHead>
                <TableHead className="font-bold text-gray-700">{isRTL ? "سعر البيع" : "Selling Price"}</TableHead>
                <TableHead className="font-bold text-gray-700 text-right">{isRTL ? "الإجراءات والربط" : "Actions / Assign"}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-gray-500">
                    <History className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-semibold">{isRTL ? "لا توجد شحنات في تاريخ الحركة تطابق الفلتر" : "No history records found."}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((s) => (
                  <TableRow key={s.id} className="hover:bg-gray-50/80 transition-colors text-xs">
                    <TableCell className="font-mono text-gray-500 whitespace-nowrap">{s.date}</TableCell>

                    {/* Status Badge */}
                    <TableCell className="whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        s.status === "Delivered"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : s.status === "Exception"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : s.status === "Delayed"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {s.currentLocation || s.status}
                      </span>
                    </TableCell>

                    {/* AWB */}
                    <TableCell className="font-mono font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span>{s.awb}</span>
                        <TrackingRedirect carrier={s.carrier} awb={s.awb} variant="icon" />
                      </div>
                    </TableCell>

                    {/* Account */}
                    <TableCell className="font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{s.account || s.company}</span>
                        {onUpdateShipment && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedShipment(s);
                              setAssignAccount(s.account || s.company);
                            }}
                            className="p-1 rounded bg-orange-50 text-[#C45B2A] hover:bg-orange-100 transition-colors cursor-pointer"
                            title="Assign to specific Client User Account"
                          >
                            <UserCheck className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </TableCell>

                    {/* Consignee */}
                    <TableCell className="font-semibold text-gray-800 truncate max-w-[140px]">
                      {s.receiverName}
                    </TableCell>

                    {/* Contents */}
                    <TableCell className="text-gray-600 truncate max-w-[140px]">
                      {s.contents || "Parcel"}
                    </TableCell>

                    {/* Destination */}
                    <TableCell className="whitespace-nowrap font-medium text-gray-800">
                      {s.country}
                    </TableCell>

                    {/* Carrier / Broker */}
                    <TableCell className="whitespace-nowrap">
                      <span className="font-bold text-gray-900 block">{s.carrier}</span>
                      <span className="text-[10px] text-indigo-600 font-semibold block">Broker: {s.broker || "XSpeed"}</span>
                    </TableCell>

                    {/* Weight */}
                    <TableCell className="font-mono font-bold text-gray-900 whitespace-nowrap">
                      {s.weight} KG
                    </TableCell>

                    {/* Selling Price */}
                    <TableCell className="font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {s.sellingPrice || s.priceEgp} EGP
                    </TableCell>

                    {/* Actions & Official Track Redirect */}
                    <TableCell className="text-right whitespace-nowrap">
                      <TrackingRedirect carrier={s.carrier} awb={s.awb} variant="button" label={isRTL ? "تتبع الناقل" : "Track"} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Assign Shipment to User Account Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fade-up">
            <h3 className="text-base font-bold text-[#251516] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#C45B2A]" />
              <span>{isRTL ? "ربط الشحنة بحساب العميل" : "Assign Shipment to Client Account"}</span>
            </h3>
            <p className="text-xs text-gray-500">
              {isRTL
                ? `ربط البوليصة ${selectedShipment.awb} بحساب عميل محدد ليظهر لديه في البورتال المخصص`
                : `Link AWB ${selectedShipment.awb} to a client account so it automatically renders in their portal.`}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">{isRTL ? "اختر أو اكتب اسم حساب العميل" : "Select or Type Client Account Name"}</label>
              <Input
                list="client-accounts-list"
                value={assignAccount}
                onChange={(e) => setAssignAccount(e.target.value)}
                placeholder="e.g. nour saied, sohib, Soliman store..."
                className="h-10 text-xs font-bold"
              />
              <datalist id="client-accounts-list">
                {customers.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedShipment(null)}
                className="text-xs font-bold cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="button"
                onClick={handleSaveAssign}
                className="btn-primary text-xs font-bold cursor-pointer"
              >
                {isRTL ? "حفظ وتأكيد الربط" : "Save & Confirm Assignment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
