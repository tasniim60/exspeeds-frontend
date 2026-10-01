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
  Phone,
  Mail,
  User,
  X,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  CarrierTransfer,
  CarrierPartner,
  CarrierBalanceDetails,
  calculateCarrierBalances,
  Shipment,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
  MASTER_CARRIERS,
  MASTER_BROKERS,
} from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

export interface CarriersViewProps {
  shipments: Shipment[];
  carrierTransfers: CarrierTransfer[];
  carrierPartners?: CarrierPartner[];
  onAddCarrierTransfer: (transfer: CarrierTransfer) => void;
  onDeleteCarrierTransfer: (id: string) => void;
  onAddCarrierPartner?: (partner: CarrierPartner) => void;
  onDeleteCarrierPartner?: (id: string) => void;
}

export const CarriersView: React.FC<CarriersViewProps> = ({
  shipments = [],
  carrierTransfers = [],
  carrierPartners = [],
  onAddCarrierTransfer,
  onDeleteCarrierTransfer,
  onAddCarrierPartner,
  onDeleteCarrierPartner,
}) => {
  const { isRTL, formatCurrency } = useLanguage();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Carrier" | "Broker">("all");
  const [balanceFilter, setBalanceFilter] = useState<"all" | "due" | "settled">("all");
  const [sortBy, setSortBy] = useState<"newest" | "due" | "shipments" | "name">("newest");

  // Modals & Drawer State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierBalanceDetails | null>(null);
  const [drawerTab, setDrawerTab] = useState<"shipments" | "transfers" | "profile">("shipments");
  const [statementSearch, setStatementSearch] = useState("");

  // Payment Form State
  const [targetCarrierName, setTargetCarrierName] = useState("");
  const [isCustomCarrier, setIsCustomCarrier] = useState(false);
  const [customCarrierInput, setCustomCarrierInput] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [payingAccount, setPayingAccount] = useState<string>(MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account");
  const [recordedBy, setRecordedBy] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("تحويل بنكي");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // New Partner Form State
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState<"Carrier" | "Broker">("Carrier");
  const [partnerContact, setPartnerContact] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerCurrency, setPartnerCurrency] = useState("EGP");
  const [partnerNotes, setPartnerNotes] = useState("");

  // Calculate carrier balances dynamically using the financial engine
  const carrierBalances = useMemo(() => {
    return calculateCarrierBalances(shipments, carrierTransfers, carrierPartners);
  }, [shipments, carrierTransfers, carrierPartners]);

  // Distinct known list of carriers for select dropdowns
  const availableCarriersList = useMemo(() => {
    const set = new Set<string>();
    carrierPartners.forEach((p) => set.add(p.name));
    MASTER_CARRIERS.forEach((c) => set.add(c));
    MASTER_BROKERS.forEach((b) => set.add(b));
    shipments.forEach((s) => {
      if (s.carrier && s.carrier.trim()) set.add(s.carrier.trim());
      if (s.broker && s.broker.trim()) set.add(s.broker.trim());
    });
    carrierTransfers.forEach((tr) => {
      if (tr.carrier && tr.carrier.trim()) set.add(tr.carrier.trim());
    });
    return Array.from(set).filter((c) => c && c !== "null" && c !== "undefined");
  }, [carrierPartners, shipments, carrierTransfers]);

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

  // Filtered and Sorted Carriers
  const filteredCarriers = useMemo(() => {
    const list = carrierBalances.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        c.carrier.toLowerCase().includes(q);

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

    return list.sort((a, b) => {
      if (sortBy === "due") {
        return b.dueBalance - a.dueBalance;
      }
      if (sortBy === "shipments") {
        return b.shipmentCount - a.shipmentCount;
      }
      if (sortBy === "name") {
        return a.carrier.localeCompare(b.carrier, "ar");
      }

      // Default: "newest" (Newly registered partners or recently updated carriers first)
      const partnerIndexA = carrierPartners.findIndex(
        (p) => p.name.toLowerCase().trim() === a.carrier.toLowerCase().trim()
      );
      const partnerIndexB = carrierPartners.findIndex(
        (p) => p.name.toLowerCase().trim() === b.carrier.toLowerCase().trim()
      );

      if (partnerIndexA !== -1 && partnerIndexB !== -1) {
        return partnerIndexA - partnerIndexB; // First in carrierPartners array appears first
      }
      if (partnerIndexA !== -1 && partnerIndexB === -1) {
        return -1; // Explicitly created partners come first
      }
      if (partnerIndexA === -1 && partnerIndexB !== -1) {
        return 1;
      }

      if (b.dueBalance !== a.dueBalance) {
        return b.dueBalance - a.dueBalance;
      }
      return b.shipmentCount - a.shipmentCount;
    });
  }, [carrierBalances, search, typeFilter, balanceFilter, sortBy, carrierPartners]);

  // Handle Opening Payment Modal with Preselected Carrier
  const handleOpenPaymentModal = (carrierName?: string) => {
    if (carrierName) {
      setTargetCarrierName(carrierName);
      setIsCustomCarrier(false);
      setCustomCarrierInput("");
    } else if (availableCarriersList.length > 0) {
      setTargetCarrierName(availableCarriersList[0]);
      setIsCustomCarrier(false);
      setCustomCarrierInput("");
    } else {
      setIsCustomCarrier(true);
      setCustomCarrierInput("");
    }
    setPaymentAmount("");
    setReferenceNumber("");
    setPaymentNotes("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setTransferModalOpen(true);
  };

  // Open Partner Modal
  const handleOpenPartnerModal = () => {
    setPartnerName("");
    setPartnerType("Carrier");
    setPartnerContact("");
    setPartnerPhone("");
    setPartnerEmail("");
    setPartnerCurrency("EGP");
    setPartnerNotes("");
    setPartnerModalOpen(true);
  };

  // Submit New Partner
  const handleSubmitPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;

    const newPartner: CarrierPartner = {
      id: `cp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: partnerName.trim(),
      type: partnerType,
      contactPerson: partnerContact.trim() || undefined,
      phone: partnerPhone.trim() || undefined,
      email: partnerEmail.trim() || undefined,
      defaultCurrency: partnerCurrency,
      notes: partnerNotes.trim() || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    if (onAddCarrierPartner) {
      onAddCarrierPartner(newPartner);
    }
    setPartnerModalOpen(false);
  };

  // Submit Payment / Transfer Form
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCarrier = isCustomCarrier ? customCarrierInput.trim() : targetCarrierName.trim();
    const amountNum = parseFloat(paymentAmount);

    if (isNaN(amountNum) || amountNum <= 0 || !finalCarrier) {
      return;
    }

    const newTransfer: CarrierTransfer = {
      id: `ct-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      carrier: finalCarrier,
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

    // If custom carrier was entered and doesn't exist in partners, register it
    if (isCustomCarrier && onAddCarrierPartner) {
      const exists = carrierPartners.some(
        (p) => p.name.toLowerCase().trim() === finalCarrier.toLowerCase()
      );
      if (!exists) {
        onAddCarrierPartner({
          id: `cp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: finalCarrier,
          type: "Carrier",
          createdAt: new Date().toISOString().split("T")[0],
        });
      }
    }

    setTransferModalOpen(false);
  };

  // Synchronize Selected Carrier for Statement Drawer
  const activeCarrierDetails = useMemo(() => {
    if (!selectedCarrier) return null;
    return carrierBalances.find((c) => c.carrier === selectedCarrier.carrier) || selectedCarrier;
  }, [selectedCarrier, carrierBalances]);

  // Active partner metadata (if registered)
  const activeCarrierPartner = useMemo(() => {
    if (!activeCarrierDetails) return undefined;
    return carrierPartners.find(
      (p) => p.name.toLowerCase().trim() === activeCarrierDetails.carrier.toLowerCase().trim()
    );
  }, [activeCarrierDetails, carrierPartners]);

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

  // Filtered shipments inside statement modal
  const filteredCarrierShipments = useMemo(() => {
    if (!activeCarrierShipments) return [];
    const q = statementSearch.toLowerCase().trim();
    if (!q) return activeCarrierShipments;
    return activeCarrierShipments.filter((s) => {
      return (
        (s.awb || "").toLowerCase().includes(q) ||
        (s.country || "").toLowerCase().includes(q) ||
        (s.company || "").toLowerCase().includes(q) ||
        (s.senderName || "").toLowerCase().includes(q) ||
        (s.receiverName || "").toLowerCase().includes(q) ||
        (s.status || "").toLowerCase().includes(q)
      );
    });
  }, [activeCarrierShipments, statementSearch]);

  // Matched Transfers for Active Carrier
  const activeCarrierTransfers = useMemo(() => {
    if (!activeCarrierDetails) return [];
    const nameNorm = activeCarrierDetails.carrier.toLowerCase().trim();
    return carrierTransfers.filter((tr) => (tr.carrier || "").toLowerCase().trim() === nameNorm);
  }, [activeCarrierDetails, carrierTransfers]);

  return (
    <div className="space-y-6">
      {/* ─── 1. Top Header & Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-50 text-[#C45B2A] border border-orange-200/70 shadow-2xs">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isRTL ? "سجل شركات الشحن والوسطاء" : "Carriers & Linehaul Brokers"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {isRTL
                ? "متابعة تكاليف خطوط الشحن الدولي، بوالص المرتجعات المستبعدة، والمسدّد لحساب كل ناقل بدقة ديناميكية"
                : "Track linehaul costs, excluded return consignments, and dynamic settlement balances"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenPartnerModal}
            className="text-xs font-bold cursor-pointer flex items-center gap-1.5 border-slate-300 text-slate-800 bg-white hover:bg-orange-50/60 hover:text-[#C45B2A] hover:border-[#C45B2A] shadow-2xs"
          >
            <Building2 className="h-4 w-4 text-[#C45B2A]" />
            <span>{isRTL ? "إضافة شركة شحن / وسيط" : "Add Partner"}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleOpenPaymentModal()}
            className="bg-[#C45B2A] hover:bg-[#A3481D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isRTL ? "تسجيل سداد ناقل أو وسيط" : "Record Payment"}</span>
          </Button>
        </div>
      </div>

      {/* ─── 2. KPI Cards: Dynamic Real Ledger Aggregation ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Linehaul Cost */}
        <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isRTL ? "صافي مستحقات الناقلين" : "Net Linehaul Costs"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
                  {formatCurrency(summary.totalNetCost, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                  <span>{isRTL ? "بعد استبعاد المرتجعات:" : "Excluded RTO:"}</span>
                  <span className="font-semibold text-rose-600 font-mono">
                    {formatCurrency(summary.totalRtoCost, "EGP")}
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                <Truck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isRTL ? "إجمالي المسدد للناقلين" : "Total Paid to Carriers"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 font-mono">
                  {formatCurrency(summary.totalPaid, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {isRTL ? "عبر سندات التحويل البنكي والخزائن" : "Via recorded transfers & treasury"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Due */}
        <Card
          className={`border shadow-2xs rounded-2xl ${
            summary.totalNetDue > 0
              ? "border-amber-200 bg-amber-50/40"
              : "border-emerald-200 bg-emerald-50/40"
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${
                    summary.totalNetDue > 0 ? "text-amber-900" : "text-emerald-900"
                  }`}
                >
                  {isRTL ? "المتبقي المستحق للناقلين" : "Outstanding Due"}
                </p>
                <h3
                  className={`text-2xl sm:text-3xl font-black mt-1 font-mono ${
                    summary.totalNetDue > 0 ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {formatCurrency(summary.totalNetDue, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-700 font-medium mt-0.5">
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
                className={`p-3 rounded-2xl border ${
                  summary.totalNetDue > 0
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Partners */}
        <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isRTL ? "الشركات والوسطاء النشطة" : "Active Partners"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
                  {summary.carrierCount}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {isRTL ? "شركات شحن دولية ووسطاء مسجلين" : "Registered linehaul carriers & brokers"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50 text-[#C45B2A] border border-orange-200">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 3. Filter and Search Bar ─── */}
      <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl">
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
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRTL ? "left-3" : "right-3"}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === "all"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 font-semibold"
                  }`}
                >
                  {isRTL ? "الكل" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("Carrier")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === "Carrier"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 font-semibold"
                  }`}
                >
                  {isRTL ? "شركات شحن (Carriers)" : "Carriers"}
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("Broker")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === "Broker"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 font-semibold"
                  }`}
                >
                  {isRTL ? "وسطاء (Brokers)" : "Brokers"}
                </button>
              </div>

              {/* Balance Filter */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setBalanceFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    balanceFilter === "all"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 font-semibold"
                  }`}
                >
                  {isRTL ? "جميع الأرصدة" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceFilter("due")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    balanceFilter === "due"
                      ? "bg-white text-amber-800 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 font-semibold"
                  }`}
                >
                  {isRTL ? "مستحق للناقل" : "Due"}
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceFilter("settled")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    balanceFilter === "settled"
                      ? "bg-white text-emerald-800 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 font-semibold"
                  }`}
                >
                  {isRTL ? "مسدد بالكامل" : "Settled"}
                </button>
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-500">{isRTL ? "الترتيب:" : "Sort:"}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label={isRTL ? "ترتيب شركات الشحن" : "Sort carriers"}
                  className="h-7 bg-white text-slate-900 text-xs font-bold rounded-lg px-2 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#C45B2A] cursor-pointer"
                >
                  <option value="newest">{isRTL ? "الأحدث تسجيلاً / نشاطاً" : "Newest Added / Active"}</option>
                  <option value="due">{isRTL ? "الأعلى مديونية" : "Highest Due"}</option>
                  <option value="shipments">{isRTL ? "الأكثر شحنات" : "Most Shipments"}</option>
                  <option value="name">{isRTL ? "الاسم أبجدياً" : "Name (A-Z)"}</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 4. Directory Table ─── */}
      <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-100 border-b border-slate-200">
              <TableRow className="text-xs font-black text-slate-900">
                <TableHead className="py-3 px-4 text-start font-black text-slate-900">
                  {isRTL ? "شركة الشحن / الوسيط" : "Carrier / Broker"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black text-slate-900">
                  {isRTL ? "النوع" : "Type"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black text-slate-900">
                  {isRTL ? "عدد البوالص" : "Shipments"}
                </TableHead>
                <TableHead className="py-3 px-4 text-end font-black text-slate-900">
                  {isRTL ? "إجمالي التكلفة" : "Gross Cost"}
                </TableHead>
                <TableHead className="py-3 px-4 text-end font-black text-slate-900">
                  {isRTL ? "مرتجع مستبعد (RTO)" : "Excluded RTO"}
                </TableHead>
                <TableHead className="py-3 px-4 text-end font-black text-slate-900">
                  {isRTL ? "صافي التكلفة" : "Net Cost"}
                </TableHead>
                <TableHead className="py-3 px-4 text-end font-black text-slate-900">
                  {isRTL ? "المسدد (التحويلات)" : "Paid Transfers"}
                </TableHead>
                <TableHead className="py-3 px-4 text-end font-black text-slate-900">
                  {isRTL ? "المتبقي للناقل" : "Net Due"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black text-slate-900">
                  {isRTL ? "الإجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCarriers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-44 text-center text-slate-600">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Truck className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">
                        {isRTL ? "لا توجد شركات أو وسطاء تطابق بحثك" : "No carriers matching your criteria"}
                      </p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearch("");
                          setTypeFilter("all");
                          setBalanceFilter("all");
                        }}
                        className="text-xs text-[#C45B2A] font-bold"
                      >
                        {isRTL ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCarriers.map((carrier) => {
                  const isSettled = carrier.dueBalance <= 1;
                  const transfersCount = carrierTransfers.filter(
                    (tr) => (tr.carrier || "").toLowerCase().trim() === carrier.carrier.toLowerCase().trim()
                  ).length;
                  const partnerMeta = carrierPartners.find(
                    (p) => p.name.toLowerCase().trim() === carrier.carrier.toLowerCase().trim()
                  );

                  return (
                    <TableRow key={carrier.carrier} className="hover:bg-orange-50/30 transition-colors border-b border-slate-100 text-xs">
                      <TableCell
                        className="py-3 px-4 text-start font-bold text-slate-900 cursor-pointer group"
                        onClick={() => {
                          setSelectedCarrier(carrier);
                          setDrawerTab("shipments");
                          setStatementSearch("");
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C45B2A] border border-orange-200 flex items-center justify-center shrink-0 group-hover:bg-[#C45B2A] group-hover:text-white transition-colors">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-950 text-sm group-hover:text-[#C45B2A] transition-colors flex items-center gap-1.5">
                              <span>{carrier.carrier}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-normal flex items-center gap-2">
                              <span>
                                {transfersCount}{" "}
                                {isRTL ? "سندات سداد مسجلة" : "recorded transfers"}
                              </span>
                              {partnerMeta?.phone && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-slate-600">{partnerMeta.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-center">
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

                      <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-slate-800">
                        {carrier.shipmentCount}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-end font-mono text-xs text-slate-700">
                        {formatCurrency(carrier.totalCost, "EGP")}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-end font-mono text-xs">
                        {carrier.rtoCost > 0 ? (
                          <span className="text-rose-600 font-bold">
                            -{formatCurrency(carrier.rtoCost, "EGP")}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">0.00</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-end font-mono font-bold text-xs text-slate-950">
                        {formatCurrency(carrier.netCost, "EGP")}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-end font-mono font-bold text-xs text-emerald-600">
                        {formatCurrency(carrier.totalPaid, "EGP")}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-end font-mono font-black text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            isSettled
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : "bg-amber-50 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {formatCurrency(carrier.dueBalance, "EGP")}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCarrier(carrier);
                              setDrawerTab("shipments");
                              setStatementSearch("");
                            }}
                            className="h-8 px-2.5 text-xs font-bold text-slate-800 hover:text-slate-950 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0 me-1.5 text-[#C45B2A]" />
                            <span>{isRTL ? "كشف حساب" : "Statement"}</span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleOpenPaymentModal(carrier.carrier)}
                            className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-3.5 w-3.5 shrink-0 me-1.5" />
                            <span>{isRTL ? "سداد" : "Pay"}</span>
                          </Button>

                          {onDeleteCarrierPartner && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (
                                  confirm(
                                    isRTL
                                      ? `هل أنت متأكد من حذف الناقل / الشريك "${carrier.carrier}" من السجل؟`
                                      : `Delete carrier / partner "${carrier.carrier}"?`
                                  )
                                ) {
                                  onDeleteCarrierPartner(partnerMeta ? partnerMeta.id : carrier.carrier);
                                }
                              }}
                              className="h-8 w-8 p-0 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                              title={isRTL ? "حذف الشريك / الناقل" : "Delete Carrier / Partner"}
                              aria-label={isRTL ? "حذف الشريك / الناقل" : "Delete Carrier / Partner"}
                            >
                              <Trash2 className="h-4 w-4 shrink-0" />
                            </Button>
                          )}
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

      {/* ─── 5. Carrier Statement Modal (`Dialog`) ─── */}
      <Dialog open={!!selectedCarrier} onOpenChange={(open) => !open && setSelectedCarrier(null)}>
        <DialogContent
          className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-full max-h-[92vh] flex flex-col p-0 bg-[#FAF8F5] overflow-hidden rounded-3xl border border-slate-200 shadow-2xl"
          onClose={() => setSelectedCarrier(null)}
        >
          {activeCarrierDetails && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-white border-b border-slate-200 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#C45B2A] border border-orange-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {activeCarrierDetails.carrier}
                        </DialogTitle>
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-bold ${
                            !activeCarrierDetails.isBroker
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {!activeCarrierDetails.isBroker
                            ? isRTL
                              ? "شركة شحن دولية / محلية"
                              : "International Carrier"
                            : isRTL
                            ? "وسيط خطوط شحن معتمد (Broker)"
                            : "Linehaul Broker"}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                        {activeCarrierPartner?.contactPerson && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>{activeCarrierPartner.contactPerson}</span>
                          </span>
                        )}
                        {activeCarrierPartner?.phone && (
                          <a
                            href={`https://wa.me/${activeCarrierPartner.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-mono font-medium hover:underline"
                            title={isRTL ? "محادثة واتساب" : "WhatsApp"}
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>{activeCarrierPartner.phone}</span>
                          </a>
                        )}
                        {activeCarrierPartner?.email && (
                          <a
                            href={`mailto:${activeCarrierPartner.email}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-[#C45B2A] hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{activeCarrierPartner.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      type="button"
                      onClick={() => handleOpenPaymentModal(activeCarrierDetails.carrier)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer h-9 px-3.5 rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{isRTL ? "تسجيل سداد جديد" : "Record Payment"}</span>
                    </Button>
                  </div>
                </div>

                {/* Ledger Quick KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                      <span>{isRTL ? "إجمالي التكلفة" : "Gross Cost"}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {activeCarrierShipments.length} {isRTL ? "بوليصة" : "AWBs"}
                      </span>
                    </p>
                    <p className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">
                      {formatCurrency(activeCarrierDetails.totalCost, "EGP")}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
                    <p className="text-[11px] font-bold text-rose-800 flex items-center justify-between">
                      <span>{isRTL ? "المرتجع المستبعد RTO" : "Excluded RTO"}</span>
                      <span className="text-[10px] text-rose-500 font-bold">{isRTL ? "مستبعد" : "Deducted"}</span>
                    </p>
                    <p className="text-base sm:text-lg font-black text-rose-600 font-mono mt-0.5">
                      -{formatCurrency(activeCarrierDetails.rtoCost, "EGP")}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <p className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                      <span>{isRTL ? "إجمالي المسدد" : "Total Paid"}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">
                        {activeCarrierTransfers.length} {isRTL ? "سند" : "receipts"}
                      </span>
                    </p>
                    <p className="text-base sm:text-lg font-black text-emerald-600 font-mono mt-0.5">
                      {formatCurrency(activeCarrierDetails.totalPaid, "EGP")}
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border ${
                      activeCarrierDetails.dueBalance > 0
                        ? "bg-amber-50 border-amber-300 text-amber-950"
                        : "bg-emerald-50 border-emerald-300 text-emerald-950"
                    }`}
                  >
                    <p className="text-[11px] font-bold flex items-center justify-between">
                      <span className={activeCarrierDetails.dueBalance > 0 ? "text-amber-800" : "text-emerald-800"}>
                        {isRTL ? "المتبقي للناقل" : "Due to Carrier"}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/70">
                        {activeCarrierDetails.dueBalance > 0
                          ? isRTL
                            ? "مستحق"
                            : "Due"
                          : isRTL
                          ? "مسدد بالكامل"
                          : "Settled"}
                      </span>
                    </p>
                    <p
                      className={`text-base sm:text-lg font-black font-mono mt-0.5 ${
                        activeCarrierDetails.dueBalance > 0 ? "text-amber-900" : "text-emerald-800"
                      }`}
                    >
                      {formatCurrency(activeCarrierDetails.dueBalance, "EGP")}
                    </p>
                  </div>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-2 mt-4 border-b border-slate-200 -mb-6 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setDrawerTab("shipments")}
                    className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      drawerTab === "shipments"
                        ? "border-[#C45B2A] text-[#C45B2A]"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                    <span>{isRTL ? "سجل البوالص والشحنات" : "Shipments & AWBs"}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      {activeCarrierShipments.length}
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerTab("transfers")}
                    className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      drawerTab === "transfers"
                        ? "border-[#C45B2A] text-[#C45B2A]"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>{isRTL ? "سندات السداد والتحويلات" : "Transfers & Payments"}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      {activeCarrierTransfers.length}
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerTab("profile")}
                    className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      drawerTab === "profile"
                        ? "border-[#C45B2A] text-[#C45B2A]"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>{isRTL ? "بيانات التعاقد والتواصل" : "Partner Profile & Terms"}</span>
                  </button>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
                {/* ── Tab 1: Shipments Ledger ── */}
                {drawerTab === "shipments" && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          type="text"
                          value={statementSearch}
                          onChange={(e) => setStatementSearch(e.target.value)}
                          placeholder={isRTL ? "بحث برقم البوليصة، الوجهة، العميل..." : "Filter by AWB, country, client..."}
                          className="ps-8 h-8 text-xs bg-white rounded-lg border-slate-200"
                        />
                        {statementSearch && (
                          <button
                            type="button"
                            onClick={() => setStatementSearch("")}
                            className="absolute end-2.5 top-2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{isRTL ? "المعروض:" : "Showing:"}</span>
                        <Badge variant="outline" className="text-xs font-mono font-bold bg-white">
                          {filteredCarrierShipments.length} / {activeCarrierShipments.length}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto w-full shadow-2xs max-h-[380px] overflow-y-auto">
                      <Table className="min-w-[680px]">
                        <TableHeader className="bg-slate-50/95 sticky top-0 z-10 backdrop-blur-xs border-b border-slate-200">
                          <TableRow>
                            <TableHead className="text-start text-xs font-bold text-slate-700">AWB</TableHead>
                            <TableHead className="text-start text-xs font-bold text-slate-700">{isRTL ? "التاريخ" : "Date"}</TableHead>
                            <TableHead className="text-start text-xs font-bold text-slate-700">{isRTL ? "العميل" : "Client"}</TableHead>
                            <TableHead className="text-start text-xs font-bold text-slate-700">{isRTL ? "الوجهة" : "Destination"}</TableHead>
                            <TableHead className="text-center text-xs font-bold text-slate-700">{isRTL ? "الوزن" : "Weight"}</TableHead>
                            <TableHead className="text-end text-xs font-bold text-slate-700">{isRTL ? "تكلفة الشحن" : "Cost"}</TableHead>
                            <TableHead className="text-end text-xs font-bold text-slate-700">{isRTL ? "سعر البيع" : "Price"}</TableHead>
                            <TableHead className="text-center text-xs font-bold text-slate-700">{isRTL ? "الحالة" : "Status"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCarrierShipments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                                {isRTL ? "لا توجد شحنات مطابقة للبحث" : "No matching shipments found"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredCarrierShipments.map((s) => {
                              const rawStatus = (s.status || "").toLowerCase();
                              const isRto =
                                rawStatus.includes("rto") ||
                                rawStatus.includes("return") ||
                                rawStatus.includes("refused") ||
                                rawStatus.includes("re export");

                              const price = s.sellingPrice !== undefined ? s.sellingPrice : (s.priceEgp || 0);

                              return (
                                <TableRow key={s.id || s.awb} className={`hover:bg-slate-50/60 ${isRto ? "bg-rose-50/40" : ""}`}>
                                  <TableCell className="text-start font-mono font-bold text-xs text-slate-900 ltr-preserve">
                                    {s.awb}
                                  </TableCell>
                                  <TableCell className="text-start text-xs text-slate-600 font-mono">
                                    {s.date || "-"}
                                  </TableCell>
                                  <TableCell className="text-start text-xs text-slate-700 font-medium">
                                    {s.company || s.senderName || s.receiverName || "-"}
                                  </TableCell>
                                  <TableCell className="text-start text-xs text-slate-700">
                                    {s.country || "-"}
                                  </TableCell>
                                  <TableCell className="text-center font-mono text-xs text-slate-600">
                                    {s.weight || "-"} kg
                                  </TableCell>
                                  <TableCell className="text-end font-mono font-bold text-xs">
                                    {isRto ? (
                                      <span className="line-through text-slate-400" title={isRTL ? "مستبعد لكونه مرتجع" : "Excluded RTO"}>
                                        {formatCurrency(s.costPrice || 0, "EGP")}
                                      </span>
                                    ) : (
                                      <span className="text-slate-900">
                                        {formatCurrency(s.costPrice || 0, "EGP")}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-end font-mono text-xs text-slate-600">
                                    {formatCurrency(price, "EGP")}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {isRto ? (
                                      <Badge variant="destructive" className="text-[10px] font-bold">
                                        {isRTL ? "مرتجع مستبعد" : "Excluded RTO"}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] font-semibold text-slate-700 bg-slate-50 border-slate-200">
                                        {s.status || "In Transit"}
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* ── Tab 2: Transfers & Payments ── */}
                {drawerTab === "transfers" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span>{isRTL ? "سجل التحويلات والسداد الموثق للناقل" : "All verified payment transfers to carrier"}</span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleOpenPaymentModal(activeCarrierDetails.carrier)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 h-7 px-2.5 rounded-lg cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{isRTL ? "سداد جديد" : "New Payment"}</span>
                      </Button>
                    </div>

                    {activeCarrierTransfers.length === 0 ? (
                      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
                        <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">
                          {isRTL ? "لا توجد سندات سداد مسجلة حتى الآن" : "No recorded payments yet"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          {isRTL
                            ? "اضغط على زر 'سداد جديد' لتوثيق تحويل بنكي أو نقدي وخصمه فوراً من حسابات الخزينة"
                            : "Click 'New Payment' to record a bank or cash transfer"}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleOpenPaymentModal(activeCarrierDetails.carrier)}
                          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                        >
                          <Plus className="h-4 w-4 me-1" />
                          <span>{isRTL ? "تسجيل أول سند سداد" : "Record First Payment"}</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {activeCarrierTransfers.map((tr) => (
                          <div
                            key={tr.id}
                            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-base text-emerald-700 font-mono">
                                    {formatCurrency(tr.amount, tr.currency || "EGP")}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] font-semibold text-slate-700 bg-slate-50 border-slate-200">
                                    <Wallet className="h-3 w-3 me-1 text-slate-400 inline" />
                                    {tr.payingAccount}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] font-medium text-slate-600">
                                    {tr.paymentMethod || (isRTL ? "تحويل بنكي" : "Bank")}
                                  </Badge>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap font-sans">
                                  <span className="font-mono">{tr.date}</span>
                                  <span>•</span>
                                  <span>{isRTL ? `المسؤول: ${tr.recordedBy}` : `By: ${tr.recordedBy}`}</span>
                                  {tr.referenceNumber && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                                        {isRTL ? `إشعار: ${tr.referenceNumber}` : `Ref: ${tr.referenceNumber}`}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {tr.notes && (
                                  <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                    {tr.notes}
                                  </p>
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
                                      ? "هل أنت متأكد من حذف سند السداد هذا؟ سيتم إرجاع المبلغ إلى الخزينة والمستحقات."
                                      : "Delete this payment transfer?"
                                  )
                                ) {
                                  onDeleteCarrierTransfer(tr.id);
                                }
                              }}
                              className="h-8 w-8 p-0 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                              title={isRTL ? "حذف سند السداد" : "Delete payment"}
                              aria-label={isRTL ? "حذف سند السداد" : "Delete payment"}
                            >
                              <Trash2 className="h-4 w-4 shrink-0" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab 3: Partner Profile & Terms ── */}
                {drawerTab === "profile" && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                      {isRTL ? "معلومات الشريك والتعاقد" : "Partner Information & Terms"}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          {isRTL ? "اسم الكيان / الشريك" : "Company / Partner Name"}
                        </span>
                        <p className="font-bold text-slate-900 text-sm">{activeCarrierDetails.carrier}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          {isRTL ? "نوع الشريك" : "Partner Type"}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            !activeCarrierDetails.isBroker
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }
                        >
                          {!activeCarrierDetails.isBroker
                            ? isRTL
                              ? "شركة شحن دولية / محلية"
                              : "International Carrier"
                            : isRTL
                            ? "وسيط شحن معتمد (Broker)"
                            : "Linehaul Broker"}
                        </Badge>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          {isRTL ? "المسؤول / جهة الاتصال" : "Contact Person"}
                        </span>
                        <p className="font-bold text-slate-800">
                          {activeCarrierPartner?.contactPerson || (isRTL ? "غير محدد" : "Not specified")}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          {isRTL ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp"}
                        </span>
                        {activeCarrierPartner?.phone ? (
                          <div className="flex items-center gap-2 font-mono">
                            <a
                              href={`tel:${activeCarrierPartner.phone}`}
                              className="font-bold text-slate-900 hover:text-[#C45B2A]"
                            >
                              {activeCarrierPartner.phone}
                            </a>
                            <a
                              href={`https://wa.me/${activeCarrierPartner.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                              title={isRTL ? "فتح محادثة واتساب" : "Chat on WhatsApp"}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400">{isRTL ? "غير محدد" : "Not specified"}</span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          {isRTL ? "البريد الإلكتروني" : "Email Address"}
                        </span>
                        {activeCarrierPartner?.email ? (
                          <a
                            href={`mailto:${activeCarrierPartner.email}`}
                            className="font-medium text-[#C45B2A] hover:underline"
                          >
                            {activeCarrierPartner.email}
                          </a>
                        ) : (
                          <span className="text-slate-400">{isRTL ? "غير محدد" : "Not specified"}</span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          {isRTL ? "العملة الأساسية" : "Default Currency"}
                        </span>
                        <p className="font-mono font-bold text-slate-800">
                          {activeCarrierPartner?.defaultCurrency || "EGP"}
                        </p>
                      </div>
                    </div>

                    {activeCarrierPartner?.notes && (
                      <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                        <span className="text-[11px] font-bold text-amber-900 block mb-1">
                          {isRTL ? "شروط السداد والملاحظات التعاقدية" : "Terms & Settlement Notes"}
                        </span>
                        <p className="text-amber-900 font-medium">{activeCarrierPartner.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{activeCarrierDetails.carrier}</span>
                  <span>•</span>
                  <span>
                    {isRTL ? "الرصيد المستحق:" : "Net Due:"}{" "}
                    <strong className="font-mono text-slate-900">
                      {formatCurrency(activeCarrierDetails.dueBalance, "EGP")}
                    </strong>
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedCarrier(null)}
                  className="text-xs font-semibold cursor-pointer h-8 px-4 rounded-lg"
                >
                  {isRTL ? "إغلاق" : "Close"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── 6. Add Partner Modal ─── */}
      <Dialog open={partnerModalOpen} onOpenChange={setPartnerModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 text-[#C45B2A]">
                <Building2 className="h-4 w-4" />
              </div>
              <span>{isRTL ? "إضافة شركة شحن أو وسيط جديد" : "Add New Carrier / Broker Partner"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isRTL
                ? "تسجيل شريك شحن دولي أو وسيط خطوط لإدراج بوالصه وسندات سداده في الحسابات"
                : "Register a new carrier or broker to track in financial ledgers"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPartner} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "اسم الشركة / الوسيط *" : "Partner Name *"}
                </label>
                <Input
                  type="text"
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. DHL Express, RedBox, SMSA"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "نوع الشريك *" : "Partner Type *"}
                </label>
                <select
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value as "Carrier" | "Broker")}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                >
                  <option value="Carrier">{isRTL ? "شركة شحن دولية / محلية" : "Carrier"}</option>
                  <option value="Broker">{isRTL ? "وسيط شحن معتمد (Broker)" : "Linehaul Broker"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "المسؤول / جهة الاتصال" : "Contact Person"}
                </label>
                <Input
                  type="text"
                  value={partnerContact}
                  onChange={(e) => setPartnerContact(e.target.value)}
                  placeholder="e.g. أ / أحمد عبد الله"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "رقم الهاتف / الواتساب" : "Phone / Mobile"}
                </label>
                <Input
                  type="text"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  placeholder="01012345678"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <Input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@carrier.com"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "العملة الأساسية" : "Default Currency"}
                </label>
                <select
                  value={partnerCurrency}
                  onChange={(e) => setPartnerCurrency(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                >
                  <option value="EGP">EGP (جنيه مصري)</option>
                  <option value="USD">USD (دولار أمريكي)</option>
                  <option value="EUR">EUR (يورو)</option>
                  <option value="SAR">SAR (ريال سعودي)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "ملاحظات أو شروط السداد" : "Notes / Terms"}
              </label>
              <Input
                type="text"
                value={partnerNotes}
                onChange={(e) => setPartnerNotes(e.target.value)}
                placeholder={isRTL ? "سداد أسبوعي، حساب بنكي رقم..." : "Weekly settlement terms..."}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPartnerModalOpen(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                className="bg-[#C45B2A] hover:bg-[#A3481D] text-white text-xs font-bold cursor-pointer"
              >
                {isRTL ? "حفظ الشريك" : "Save Partner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── 7. Record Carrier Payment Modal ─── */}
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
                ? "توثيق دفعة مسددة لشركة الشحن أو الوسيط وخصمها من الخزينة المحددة وإدراجها فوراً بالحسابات"
                : "Record payment to carrier/broker and deduct from treasury vault"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPayment} className="space-y-4 pt-2">
            {/* Carrier Selection */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "شركة الشحن / الوسيط *" : "Carrier / Broker *"}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCarrier(!isCustomCarrier)}
                  className="text-[11px] font-bold text-[#C45B2A] hover:underline cursor-pointer"
                >
                  {isCustomCarrier
                    ? isRTL
                      ? "← اختيار من القائمة"
                      : "← Select from list"
                    : isRTL
                    ? "+ كتابة اسم جديد"
                    : "+ Type new name"}
                </button>
              </div>

              {!isCustomCarrier ? (
                <select
                  required
                  value={targetCarrierName}
                  onChange={(e) => setTargetCarrierName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A] font-bold text-slate-900"
                >
                  {availableCarriersList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type="text"
                  required
                  value={customCarrierInput}
                  onChange={(e) => setCustomCarrierInput(e.target.value)}
                  placeholder={isRTL ? "أدخل اسم شركة الشحن أو الوسيط..." : "Enter carrier or broker name..."}
                  className="h-9 text-xs font-bold text-slate-900"
                />
              )}
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

export default CarriersView;
