"use client";

import React, { useState, useMemo } from "react";
import {
  Truck,
  Plus,
  Search,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Package,
  CheckCircle2,
  RotateCcw,
  ArrowUpRight,
  TrendingDown,
  Trash2,
  AlertCircle,
  HelpCircle,
  Wallet,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  CarrierTransfer,
  CarrierBalanceDetails,
  calculateCarrierBalances,
  Shipment,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
} from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface CarriersViewProps {
  shipments: Shipment[];
  carrierTransfers: CarrierTransfer[];
  onAddCarrierTransfer: (transfer: CarrierTransfer) => void;
  onDeleteCarrierTransfer: (id: string) => void;
}

export const CarriersView: React.FC<CarriersViewProps> = ({
  shipments,
  carrierTransfers,
  onAddCarrierTransfer,
  onDeleteCarrierTransfer,
}) => {
  const { isRTL, formatCurrency } = useLanguage();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Carrier" | "Broker">("all");
  const [balanceFilter, setBalanceFilter] = useState<"all" | "due" | "settled">("all");

  // Modals & Drawer State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierBalanceDetails | null>(null);
  const [drawerTab, setDrawerTab] = useState<"shipments" | "transfers">("shipments");

  // Payment Form State
  const [targetCarrierName, setTargetCarrierName] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [payingAccount, setPayingAccount] = useState<string>(MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account");
  const [recordedBy, setRecordedBy] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("تحويل بنكي");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Calculate carrier balances dynamically using the verified financial engine
  const carrierBalances = useMemo(() => {
    return calculateCarrierBalances(shipments, carrierTransfers);
  }, [shipments, carrierTransfers]);

  // Overall Financial Summary across all carriers & brokers
  const summary = useMemo(() => {
    let totalGrossCost = 0;
    let totalRtoCost = 0;
    let totalNetCost = 0;
    let totalPaid = 0;
    let totalNetDue = 0;

    carrierBalances.forEach((c) => {
      totalGrossCost += c.totalCost;
      totalRtoCost += c.rtoCost;
      totalNetCost += c.netCost;
      totalPaid += c.totalPaid;
      totalNetDue += c.dueBalance;
    });

    return {
      carrierCount: carrierBalances.length,
      totalGrossCost,
      totalRtoCost,
      totalNetCost,
      totalPaid,
      totalNetDue,
    };
  }, [carrierBalances]);

  // Filtered Carriers
  const filteredCarriers = useMemo(() => {
    return carrierBalances.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.carrier.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "Broker" ? c.isBroker : !c.isBroker);

      const matchesBalance =
        balanceFilter === "all"
          ? true
          : balanceFilter === "due"
          ? c.dueBalance > 1
          : c.dueBalance <= 1;

      return matchesSearch && matchesType && matchesBalance;
    });
  }, [carrierBalances, search, typeFilter, balanceFilter]);

  // Handle Opening Payment Modal with Preselected Carrier
  const handleOpenPaymentModal = (carrierName?: string) => {
    if (carrierName) {
      setTargetCarrierName(carrierName);
    } else if (carrierBalances.length > 0) {
      setTargetCarrierName(carrierBalances[0].carrier);
    }
    setPaymentAmount("");
    setReferenceNumber("");
    setPaymentNotes("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setTransferModalOpen(true);
  };

  // Submit Payment / Transfer Form
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0 || !targetCarrierName.trim()) {
      return;
    }

    const newTransfer: CarrierTransfer = {
      id: `ct-${Date.now()}`,
      carrier: targetCarrierName.trim(),
      amount: amountNum,
      currency: "EGP",
      date: paymentDate,
      payingAccount: payingAccount,
      recordedBy: recordedBy,
      paymentMethod: paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: paymentNotes.trim() || undefined,
    };

    onAddCarrierTransfer(newTransfer);
    setTransferModalOpen(false);
  };

  // Synchronize Selected Carrier for Statement Drawer
  const activeCarrierDetails = useMemo(() => {
    if (!selectedCarrier) return null;
    return carrierBalances.find((c) => c.carrier === selectedCarrier.carrier) || selectedCarrier;
  }, [selectedCarrier, carrierBalances]);

  // Matched Shipments for Active Carrier
  const activeCarrierShipments = useMemo(() => {
    if (!activeCarrierDetails) return [];
    const nameNorm = activeCarrierDetails.carrier.toLowerCase().trim();
    return shipments.filter((s) => {
      const c = (s.carrier || "").toLowerCase().trim();
      const b = (s.broker || "").toLowerCase().trim();
      return c === nameNorm || b === nameNorm;
    });
  }, [activeCarrierDetails, shipments]);

  // Matched Transfers for Active Carrier
  const activeCarrierTransfers = useMemo(() => {
    if (!activeCarrierDetails) return [];
    const nameNorm = activeCarrierDetails.carrier.toLowerCase().trim();
    return carrierTransfers.filter((tr) => (tr.carrier || "").toLowerCase().trim() === nameNorm);
  }, [activeCarrierDetails, carrierTransfers]);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-[#C45B2A]">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {isRTL ? "سجل شركات الشحن والوسطاء" : "Carriers & Linehaul Brokers"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {isRTL
                  ? "متابعة تكاليف الشحن الدولي، بوالص المرتجعات المستبعدة، والمسدّد لحساب كل ناقل"
                  : "Track linehaul costs, excluded return consignments, and settlements per carrier"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => handleOpenPaymentModal()}
            className="bg-[#C45B2A] hover:bg-[#A3481D] text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isRTL ? "تسجيل سداد ناقل أو وسيط" : "Record Carrier Payment"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards: Dynamic Real Ledger Aggregation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "صافي مستحقات الناقلين" : "Net Linehaul Costs"}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {formatCurrency(summary.totalNetCost, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>{isRTL ? "بعد استبعاد المرتجعات:" : "Excluded RTO:"}</span>
                  <span className="font-semibold text-rose-600 font-mono">
                    {formatCurrency(summary.totalRtoCost, "EGP")}
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <Truck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "إجمالي المسدد للناقلين" : "Total Paid to Carriers"}
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                  {formatCurrency(summary.totalPaid, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isRTL ? "عبر سندات التحويل البنكي والنقدي" : "Via bank transfers & cash float"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "المتبقي المستحق للناقلين" : "Outstanding Due to Carriers"}
                </p>
                <h3
                  className={`text-2xl font-black mt-1 font-mono ${
                    summary.totalNetDue > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(summary.totalNetDue, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {summary.totalNetDue > 0
                    ? isRTL
                      ? "التزامات مستحقة واجبة السداد"
                      : "Pending liability to settle"
                    : isRTL
                    ? "الحسابات مسددة بالكامل"
                    : "All accounts fully settled"}
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl ${
                  summary.totalNetDue > 0
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "الشركات والوسطاء" : "Active Partners"}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {summary.carrierCount}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isRTL ? "شركات شحن دولية ووسطاء معتمدين" : "Linehaul airlines, couriers & brokers"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50 text-[#C45B2A]">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-slate-200/80 shadow-2xs bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRTL ? "right-3" : "left-3"}`} />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isRTL
                    ? "بحث باسم شركة الشحن، الوسيط (DHL, Aramex, SMSA, etc.)..."
                    : "Search by carrier name, broker, courier..."
                }
                className={`${isRTL ? "pr-10 text-right" : "pl-10 text-left"} h-10 text-xs sm:text-sm bg-[#FAF8F5] border-slate-300 focus:bg-white`}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isRTL ? "الكل" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("Carrier")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === "Carrier"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isRTL ? "شركات شحن (Carriers)" : "Carriers"}
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("Broker")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === "Broker"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isRTL ? "وسطاء (Brokers)" : "Brokers"}
                </button>
              </div>

              {/* Balance Filter */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBalanceFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    balanceFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isRTL ? "جميع الأرصدة" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceFilter("due")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    balanceFilter === "due"
                      ? "bg-white text-amber-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isRTL ? "مستحق للناقل" : "Due"}
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceFilter("settled")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    balanceFilter === "settled"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isRTL ? "مسدد بالكامل" : "Settled"}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card className="border border-slate-200/80 shadow-2xs bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FAF8F5] border-b border-slate-200">
              <TableRow>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "شركة الشحن / الوسيط" : "Carrier / Broker"}
                </TableHead>
                <TableHead className="text-center text-xs font-extrabold text-slate-700">
                  {isRTL ? "النوع" : "Type"}
                </TableHead>
                <TableHead className="text-center text-xs font-extrabold text-slate-700">
                  {isRTL ? "عدد البوالص" : "Shipments"}
                </TableHead>
                <TableHead className="text-end text-xs font-extrabold text-slate-700">
                  {isRTL ? "إجمالي التكلفة" : "Gross Cost"}
                </TableHead>
                <TableHead className="text-end text-xs font-extrabold text-slate-700">
                  {isRTL ? "مرتجع مستبعد (RTO)" : "Excluded RTO"}
                </TableHead>
                <TableHead className="text-end text-xs font-extrabold text-slate-700">
                  {isRTL ? "صافي التكلفة" : "Net Cost"}
                </TableHead>
                <TableHead className="text-end text-xs font-extrabold text-slate-700">
                  {isRTL ? "المسدد (التحويلات)" : "Paid Transfers"}
                </TableHead>
                <TableHead className="text-end text-xs font-extrabold text-slate-700">
                  {isRTL ? "المتبقي للناقل" : "Net Due"}
                </TableHead>
                <TableHead className="text-center text-xs font-extrabold text-slate-700">
                  {isRTL ? "الإجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCarriers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Truck className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-semibold">
                        {isRTL ? "لا توجد نتائج تطابق بحثك" : "No carriers matching your criteria"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCarriers.map((carrier) => {
                  const isSettled = carrier.dueBalance <= 1;
                  const transfersCount = carrierTransfers.filter(
                    (tr) => (tr.carrier || "").toLowerCase().trim() === carrier.carrier.toLowerCase().trim()
                  ).length;

                  return (
                    <TableRow key={carrier.carrier} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-start font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#C45B2A] flex items-center justify-center shrink-0">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold">{carrier.carrier}</div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              {transfersCount}{" "}
                              {isRTL ? "سندات سداد مسجلة" : "recorded transfers"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            !carrier.isBroker
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {!carrier.isBroker
                            ? isRTL
                              ? "شركة شحن"
                              : "Carrier"
                            : isRTL
                            ? "وسيط شحن"
                            : "Broker"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-xs text-slate-700">
                        {carrier.shipmentCount}
                      </TableCell>

                      <TableCell className="text-end font-mono text-xs text-slate-600">
                        {formatCurrency(carrier.totalCost, "EGP")}
                      </TableCell>

                      <TableCell className="text-end font-mono text-xs">
                        {carrier.rtoCost > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            -{formatCurrency(carrier.rtoCost, "EGP")}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">0.00</span>
                        )}
                      </TableCell>

                      <TableCell className="text-end font-mono font-bold text-xs text-slate-900">
                        {formatCurrency(carrier.netCost, "EGP")}
                      </TableCell>

                      <TableCell className="text-end font-mono font-bold text-xs text-emerald-600">
                        {formatCurrency(carrier.totalPaid, "EGP")}
                      </TableCell>

                      <TableCell className="text-end font-mono font-extrabold text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            isSettled
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {formatCurrency(carrier.dueBalance, "EGP")}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCarrier(carrier);
                              setDrawerTab("shipments");
                            }}
                            className="h-8 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100 cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5 ml-1" />
                            <span>{isRTL ? "كشف حساب" : "Statement"}</span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleOpenPaymentModal(carrier.carrier)}
                            className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 ml-1" />
                            <span>{isRTL ? "سداد" : "Pay"}</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Carrier Statement Drawer */}
      <Sheet open={!!selectedCarrier} onOpenChange={(open) => !open && setSelectedCarrier(null)} side={isRTL ? "left" : "right"}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0 bg-[#FAF8F5]">
          {activeCarrierDetails && (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-6 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-bold mb-2 ${
                        !activeCarrierDetails.isBroker
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {!activeCarrierDetails.isBroker
                        ? isRTL
                          ? "شركة شحن دولية"
                          : "International Carrier"
                        : isRTL
                        ? "وسيط شحن معتمد"
                        : "Linehaul Broker"}
                    </Badge>
                    <SheetTitle className="text-xl font-black text-slate-900">
                      {activeCarrierDetails.carrier}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-slate-500 mt-0.5">
                      {isRTL
                        ? "كشف حساب تفصيلي بالبوالص، المرتجعات، وتاريخ التحويلات والمسدّد"
                        : "Consignment ledger, deducted returns, and transfer history"}
                    </SheetDescription>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleOpenPaymentModal(activeCarrierDetails.carrier)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isRTL ? "تسجيل سداد جديد" : "Record Payment"}</span>
                  </Button>
                </div>

                {/* Ledger Quick KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-500">{isRTL ? "إجمالي التكلفة" : "Gross Cost"}</p>
                    <p className="text-sm font-black text-slate-900 font-mono mt-0.5">
                      {formatCurrency(activeCarrierDetails.totalCost, "EGP")}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-500">{isRTL ? "المرتجع المستبعد" : "Excluded RTO"}</p>
                    <p className="text-sm font-black text-rose-600 font-mono mt-0.5">
                      -{formatCurrency(activeCarrierDetails.rtoCost, "EGP")}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-500">{isRTL ? "إجمالي المسدد" : "Total Paid"}</p>
                    <p className="text-sm font-black text-emerald-600 font-mono mt-0.5">
                      {formatCurrency(activeCarrierDetails.totalPaid, "EGP")}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-[11px] font-bold text-amber-800">{isRTL ? "المتبقي للناقل" : "Due to Carrier"}</p>
                    <p className="text-sm font-black text-amber-900 font-mono mt-0.5">
                      {formatCurrency(activeCarrierDetails.dueBalance, "EGP")}
                    </p>
                  </div>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-2 mt-5 border-b border-slate-200 -mb-6">
                  <button
                    type="button"
                    onClick={() => setDrawerTab("shipments")}
                    className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      drawerTab === "shipments"
                        ? "border-[#C45B2A] text-[#C45B2A]"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {isRTL ? "سجل البوالص والشحنات" : "Shipments & AWBs"} (
                    {activeCarrierShipments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab("transfers")}
                    className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      drawerTab === "transfers"
                        ? "border-[#C45B2A] text-[#C45B2A]"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {isRTL ? "سندات السداد والتحويلات" : "Transfers & Payments"} (
                    {activeCarrierTransfers.length})
                  </button>
                </div>
              </div>

              {/* Drawer Content Body */}
              <div className="p-6 flex-1 overflow-y-auto">
                {drawerTab === "shipments" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span>{isRTL ? "البوالص المسجلة تحت هذا الناقل" : "Consignments booked with carrier"}</span>
                      <span>
                        {activeCarrierShipments.length} {isRTL ? "بوليصة" : "AWBs"}
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto w-full shadow-2xs">
                      <Table className="min-w-[560px]">
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="text-start text-xs font-bold text-slate-700">AWB</TableHead>
                            <TableHead className="text-start text-xs font-bold text-slate-700">{isRTL ? "التاريخ" : "Date"}</TableHead>
                            <TableHead className="text-start text-xs font-bold text-slate-700">{isRTL ? "الوجهة" : "Dest"}</TableHead>
                            <TableHead className="text-center text-xs font-bold text-slate-700">{isRTL ? "الوزن" : "Weight"}</TableHead>
                            <TableHead className="text-end text-xs font-bold text-slate-700">{isRTL ? "التكلفة" : "Cost"}</TableHead>
                            <TableHead className="text-center text-xs font-bold text-slate-700">{isRTL ? "الحالة" : "Status"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeCarrierShipments.map((s) => {
                            const rawStatus = (s.status || "").toLowerCase();
                            const isRto =
                              rawStatus.includes("rto") ||
                              rawStatus.includes("return") ||
                              rawStatus.includes("refused") ||
                              rawStatus.includes("re export");

                            return (
                              <TableRow key={s.id || s.awb} className={isRto ? "bg-rose-50/40" : ""}>
                                <TableCell className="text-start font-mono font-bold text-xs text-slate-900">
                                  {s.awb}
                                </TableCell>
                                <TableCell className="text-start text-xs text-slate-600">
                                  {s.date || "-"}
                                </TableCell>
                                <TableCell className="text-start text-xs text-slate-700">
                                  {s.country || "-"}
                                </TableCell>
                                <TableCell className="text-center font-mono text-xs text-slate-600">
                                  {s.weight || "-"} kg
                                </TableCell>
                                <TableCell className="text-end font-mono font-bold text-xs">
                                  {isRto ? (
                                    <span className="line-through text-slate-400">
                                      {formatCurrency(s.costPrice || 0, "EGP")}
                                    </span>
                                  ) : (
                                    <span className="text-slate-900">
                                      {formatCurrency(s.costPrice || 0, "EGP")}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {isRto ? (
                                    <Badge variant="destructive" className="text-[10px] font-bold">
                                      {isRTL ? "مرتجع مستبعد" : "Excluded RTO"}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] font-semibold text-slate-600">
                                      {s.status || "In Transit"}
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {drawerTab === "transfers" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span>{isRTL ? "سجل التحويلات والسداد" : "All payments transferred to carrier"}</span>
                      <span>
                        {activeCarrierTransfers.length} {isRTL ? "سند" : "transfers"}
                      </span>
                    </div>

                    {activeCarrierTransfers.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                        <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">
                          {isRTL ? "لا توجد سندات سداد مسجلة حتى الآن" : "No recorded payments yet"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {isRTL
                            ? "اضغط على زر 'تسجيل سداد جديد' لتوثيق تحويل بنكي أو نقدي"
                            : "Click 'Record Payment' to add a settlement transfer"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeCarrierTransfers.map((tr) => (
                          <div
                            key={tr.id}
                            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900 font-mono">
                                    {formatCurrency(tr.amount, tr.currency || "EGP")}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] font-semibold text-slate-600">
                                    {tr.payingAccount}
                                  </Badge>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>{tr.date}</span>
                                  <span>•</span>
                                  <span>{isRTL ? `المسجل: ${tr.recordedBy}` : `By: ${tr.recordedBy}`}</span>
                                  {tr.referenceNumber && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono">{tr.referenceNumber}</span>
                                    </>
                                  )}
                                </div>
                                {tr.notes && (
                                  <p className="text-xs text-slate-600 mt-1 italic">{tr.notes}</p>
                                )}
                              </div>
                            </div>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (
                                  confirm(
                                    isRTL
                                      ? "هل أنت متأكد من حذف سند السداد هذا؟"
                                      : "Delete this payment transfer?"
                                  )
                                ) {
                                  onDeleteCarrierTransfer(tr.id);
                                }
                              }}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                              title={isRTL ? "حذف سند السداد" : "Delete payment"}
                              aria-label={isRTL ? "حذف سند السداد" : "Delete payment"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Record Carrier Payment Modal */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CreditCard className="h-4 w-4" />
              </div>
              <span>{isRTL ? "تسجيل سداد لشركة شحن أو وسيط" : "Record Carrier Settlement Transfer"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isRTL
                ? "توثيق دفعة مسددة لشركة الشحن أو الوسيط وخصمها من الخزينة المحددة"
                : "Record payment to carrier/broker and deduct from treasury vault"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPayment} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "شركة الشحن / الوسيط *" : "Carrier / Broker *"}
              </label>
              <Input
                type="text"
                required
                value={targetCarrierName}
                onChange={(e) => setTargetCarrierName(e.target.value)}
                placeholder="e.g. Express, FEDEX, Aramex, SMSA, sonbola, Azab, NOK"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "المبلغ المسدد (EGP) *" : "Amount Paid (EGP) *"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "تاريخ السداد" : "Payment Date"}
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Paying Account */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "الخزينة المخصوم منها *" : "Paying Vault *"}
                </label>
                <select
                  value={payingAccount}
                  onChange={(e) => setPayingAccount(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                >
                  {MASTER_FINANCIAL_ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recorder */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "المسؤول عن الصرف *" : "Recorded By *"}
                </label>
                <select
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                >
                  {MASTER_AGENTS.map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Payment Method */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "طريقة السداد" : "Payment Method"}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                >
                  <option value="تحويل بنكي">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</option>
                  <option value="نقدي (كاش)">{isRTL ? "نقدي (كاش)" : "Cash"}</option>
                  <option value="محفظة إلكترونية">{isRTL ? "محفظة إلكترونية" : "E-Wallet"}</option>
                  <option value="شيك بنكي">{isRTL ? "شيك بنكي" : "Cheque"}</option>
                </select>
              </div>

              {/* Reference / Cheque Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "رقم المرجع / الإشعار" : "Ref / Receipt No"}
                </label>
                <Input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="TRX-102938"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "ملاحظات السداد" : "Notes"}
              </label>
              <Input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder={isRTL ? "سداد دفعة فواتير شهر يناير..." : "Payment notes..."}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTransferModalOpen(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                {isRTL ? "حفظ السند والخصم" : "Save & Deduct"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
