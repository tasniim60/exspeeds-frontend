"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Building,
  Building2,
  Mail,
  Phone,
  UserCheck,
  MapPin,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Customer,
  Shipment,
  Invoice,
  CustomerCollection,
  BusinessExpense,
  calculateCustomerBalance,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
} from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface CustomersViewProps {
  customers: Customer[];
  shipments: Shipment[];
  invoices: Invoice[];
  collections?: CustomerCollection[];
  expenses?: BusinessExpense[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  shipments,
  invoices,
  collections = [],
  expenses = [],
  onAddCustomer,
  onUpdateCustomer,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [balanceFilter, setBalanceFilter] = useState<"all" | "due" | "settled">("all");

  // Modals & Profile Drawer
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerTab, setDrawerTab] = useState<"ledger" | "shipments" | "collections" | "profile">("ledger");

  // Form State: Add Customer
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCountry, setFormCountry] = useState("Egypt");
  const [formCity, setFormCity] = useState("Cairo");
  const [formTier, setFormTier] = useState<Customer["tier"]>("Enterprise VIP");
  const [formCreditLimit, setFormCreditLimit] = useState("30000");
  const [formTaxNumber, setFormTaxNumber] = useState("");
  const [formManager, setFormManager] = useState("Admin");

  // Map each customer to their exact legacy equation balance
  const customerBalances = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateCustomerBalance>>();
    for (const c of customers) {
      map.set(c.id, calculateCustomerBalance(c, shipments, expenses, collections));
    }
    return map;
  }, [customers, shipments, expenses, collections]);

  // Combined Totals for Top CRM Cards
  const kpiTotals = useMemo(() => {
    let combinedSales = 0;
    let combinedNetBalance = 0;
    let combinedCollected = 0;
    let combinedShipments = 0;
    let combinedRto = 0;

    for (const c of customers) {
      const b = customerBalances.get(c.id);
      if (b) {
        combinedSales += b.totalSales;
        combinedNetBalance += b.netBalance;
        combinedCollected += b.totalCollected;
        combinedShipments += b.shipmentCount;
        combinedRto += b.rtoSales;
      }
    }

    return {
      totalCustomers: customers.length,
      combinedSales: Math.round(combinedSales * 100) / 100,
      combinedNetBalance: Math.round(combinedNetBalance * 100) / 100,
      combinedCollected: Math.round(combinedCollected * 100) / 100,
      combinedShipments,
      combinedRto: Math.round(combinedRto * 100) / 100,
    };
  }, [customers, customerBalances]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Customer = {
      id: `CUST-${Math.floor(400 + Math.random() * 500)}`,
      code: `ACC-${Math.floor(8800 + Math.random() * 99)}`,
      name: formName.trim(),
      company: formCompany.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      country: formCountry.trim(),
      city: formCity.trim(),
      tier: formTier,
      creditLimit: parseFloat(formCreditLimit) || 10000,
      currentBalance: 0,
      totalShipments: 0,
      lifetimeSpend: 0,
      taxRegistrationNumber: formTaxNumber.trim() || `EG-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
      assignedManager: formManager,
      activeContracts: 1,
      joinedDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    onAddCustomer(newCust);
    setAddModalOpen(false);
    setSelectedCustomer(newCust);
    // Reset
    setFormName("");
    setFormCompany("");
    setFormEmail("");
    setFormPhone("");
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);
    const matchesTier = tierFilter === "all" || c.tier === tierFilter;

    const b = customerBalances.get(c.id);
    const netBal = b ? b.netBalance : 0;
    const matchesBalance =
      balanceFilter === "all" ||
      (balanceFilter === "due" && netBal > 0) ||
      (balanceFilter === "settled" && netBal <= 0);

    return matchesSearch && matchesTier && matchesBalance;
  });

  const getTierBadgeVariant = (tier: Customer["tier"]) => {
    switch (tier) {
      case "Enterprise VIP":
        return "brand";
      case "Corporate Partner":
        return "purple";
      default:
        return "secondary";
    }
  };

  // Currently selected customer's live balance and related data
  const selectedBalance = selectedCustomer
    ? customerBalances.get(selectedCustomer.id) || calculateCustomerBalance(selectedCustomer, shipments, expenses, collections)
    : null;

  const selectedCustomerShipments = useMemo(() => {
    if (!selectedCustomer) return [];
    const compLower = selectedCustomer.company.toLowerCase().trim();
    const nameLower = selectedCustomer.name.toLowerCase().trim();
    const codeLower = selectedCustomer.code.toLowerCase().trim();

    return shipments.filter((s) => {
      const acct = (s.account || "").toLowerCase().trim();
      const comp = (s.company || "").toLowerCase().trim();
      const sndr = (s.senderName || "").toLowerCase().trim();
      return (
        acct === compLower ||
        acct === nameLower ||
        comp === compLower ||
        comp === nameLower ||
        sndr === compLower ||
        sndr === nameLower ||
        acct.includes(compLower) ||
        comp.includes(compLower)
      );
    });
  }, [selectedCustomer, shipments]);

  const selectedCustomerCollections = useMemo(() => {
    if (!selectedCustomer) return [];
    const compLower = selectedCustomer.company.toLowerCase().trim();
    const nameLower = selectedCustomer.name.toLowerCase().trim();
    const custId = selectedCustomer.id;

    return collections.filter((col) => {
      if (col.customerId && col.customerId === custId) return true;
      const cl = (col.clientName || "").toLowerCase().trim();
      return cl === compLower || cl === nameLower || compLower.includes(cl);
    });
  }, [selectedCustomer, collections]);

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isRTL ? "مراقبة العملاء والشركات" : "Clients & Accounts Ledger"} ({customers.length})
            </h2>
            <p className="text-xs text-gray-500">
              {isRTL
                ? "متابعة الحسابات التراكمية الحقيقية (المبيعات - المرتجعات - التحصيلات) حسب نظام 00_مراقبة_العملاء"
                : "Real-time cumulative balances matching legacy 00_مراقبة_العملاء formula"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="brand"
            onClick={() => setAddModalOpen(true)}
            className="text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>{t("admin.customers.addCustomer")}</span>
          </Button>
        </div>
      </div>

      {/* CRM Stats Summary Cards (All dynamically computed from real data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-600 font-bold uppercase text-xs">
            {isRTL ? "إجمالي مبيعات البوالص" : "Total Consignments Sales"}
          </span>
          <p className="text-2xl font-black font-mono text-gray-900 flex items-baseline rtl:justify-end ltr:justify-start gap-1.5" dir="ltr">
            <span>{kpiTotals.combinedSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs font-bold text-gray-500">EGP</span>
          </p>
          <div className="flex items-center rtl:justify-end ltr:justify-start gap-2 text-[11px] text-gray-500 font-mono">
            <span className="text-emerald-700 font-semibold">{kpiTotals.combinedShipments} AWB</span>
            {kpiTotals.combinedRto > 0 && (
              <span className="text-amber-700">({kpiTotals.combinedRto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP RTO)</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-600 font-bold uppercase text-xs">
            {isRTL ? "إجمالي التحصيلات المستلمة" : "Total Collections Received"}
          </span>
          <p className="rtl:justify-end ltr:justify-start text-2xl font-black font-mono text-emerald-700 flex items-baseline gap-1.5" dir="ltr">
            <span>{kpiTotals.combinedCollected.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs font-bold text-gray-500">EGP</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">
            {isRTL ? "مقبوضات مسجلة بالخزائن والبنوك" : "Verified deposited receipts"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-600 font-bold uppercase text-xs">
            {isRTL ? "صافي الأرصدة المستحقة (المطلوبة)" : "Net Outstanding Receivables"}
          </span>
          <p className="rtl:justify-end ltr:justify-start text-2xl font-black font-mono text-[#C45B2A] flex items-baseline gap-1.5" dir="ltr">
            <span>{kpiTotals.combinedNetBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs font-bold text-gray-500">EGP</span>
          </p>
          <p className="text-xs text-gray-600 font-medium">
            {isRTL ? "الرصيد التراكمي الفعلي المستحق" : "Cumulative balance owed by clients"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-600 font-bold uppercase text-xs">
            {isRTL ? "حسابات الشركات النشطة" : "Active Corporate Clients"}
          </span>
          <p className="text-2xl font-black font-mono text-gray-900" dir="ltr">{kpiTotals.totalCustomers}</p>
          <p className="text-[11px] text-sky-600 font-medium">
            {isRTL ? "منظومة الحسابات المعتمدة" : "Active commercial accounts"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? "بحث باسم العميل، الشركة، الكود، المدينة..." : "Search by company, client name, code, city..."}
            className="text-xs ps-9 pe-3 text-start bg-white border-gray-200 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20 h-9 rounded-lg"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Tier Filter */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {["all", "Enterprise VIP", "Corporate Partner"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  tierFilter === tier ? "bg-white text-gray-900 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tier === "all" ? (isRTL ? "كل الفئات" : "All Tiers") : tier}
              </button>
            ))}
          </div>

          {/* Balance Filter */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setBalanceFilter("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                balanceFilter === "all" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isRTL ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setBalanceFilter("due")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                balanceFilter === "due" ? "bg-[#251516] text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isRTL ? "عليه مستحقات" : "Has Balance"}
            </button>
            <button
              onClick={() => setBalanceFilter("settled")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                balanceFilter === "settled" ? "bg-emerald-700 text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isRTL ? "مُسدد / خالص" : "Settled"}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Directory Table */}
      <Card className="shadow-2xs overflow-hidden border-gray-200">
        <Table className="min-w-[850px]">
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="text-start">{t("admin.customers.table.code")}</TableHead>
              <TableHead className="text-start">{isRTL ? "الشركة / اسم الحساب" : "Company / Account"}</TableHead>
              <TableHead className="text-start">{t("admin.customers.table.contactPerson")}</TableHead>
              <TableHead className="text-start">{isRTL ? "الشحنات" : "Shipments"}</TableHead>
              <TableHead className="text-start">{isRTL ? "إجمالي المبيعات" : "Total Sales"}</TableHead>
              <TableHead className="text-start">{isRTL ? "المقبوضات" : "Collected"}</TableHead>
              <TableHead className="text-start">{isRTL ? "صافي الرصيد المستحق" : "Net Due Balance"}</TableHead>
              <TableHead className="text-end">{t("admin.customers.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((cust) => {
              const b = customerBalances.get(cust.id) || {
                totalSales: 0,
                extraExpenses: 0,
                rtoSales: 0,
                totalCollected: 0,
                netBalance: 0,
                shipmentCount: 0,
                rtoCount: 0,
              };

              return (
                <TableRow
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="cursor-pointer hover:bg-gray-50/90 transition-colors"
                >
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-gray-500 ltr-preserve">{cust.code}</span>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 text-start">
                      <p className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-gray-400" />
                        {cust.company}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getTierBadgeVariant(cust.tier)} size="sm">
                          {cust.tier}
                        </Badge>
                        <span className="text-[11px] text-gray-400">{cust.city}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 text-start">
                      <p className="text-xs font-semibold text-gray-800">{cust.name}</p>
                      <p className="text-[11px] text-gray-500 ltr-preserve">{cust.phone || cust.email}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 text-start">
                      {b.rtoCount > 0 && (
                        <p className="text-[10px] text-amber-600 font-semibold">
                          {b.rtoCount} RTO ({b.rtoSales.toLocaleString()} EGP)
                        </p>
                      )}
                      <span className="text-xs font-bold text-gray-900 flex rtl:flex-row ltr:flex-row-reverse items-baseline rtl:justify-start ltr:justify-end gap-2"><span>AWB</span> {b.shipmentCount}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 font-mono text-xs text-start">
                      <span className="font-bold text-gray-900">{b.totalSales.toLocaleString()} EGP</span>
                      {b.extraExpenses > 0 && (
                        <p className="text-[10px] text-purple-600 font-medium">
                          +{b.extraExpenses.toLocaleString()} {isRTL ? "مصاريف إضافية" : "extra"}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 font-mono text-xs text-start">
                      <span className="font-bold text-emerald-700">{b.totalCollected.toLocaleString()} EGP</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 font-mono text-xs text-start">
                      <span
                        className={`text-sm font-black ${
                          b.netBalance > 0
                            ? "text-[#C45B2A]"
                            : b.netBalance === 0
                            ? "text-gray-500"
                            : "text-emerald-700"
                        }`}
                      >
                        {b.netBalance.toLocaleString()} EGP
                      </span>
                      {b.netBalance > cust.creditLimit && (
                        <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {isRTL ? "تجاوز الحد الائتماني" : "Exceeds Credit"}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedCustomer(cust)}
                        className="text-xs font-semibold cursor-pointer border-brand-500/30 text-[#C45B2A] hover:bg-orange-50 rounded-lg px-2.5 py-1"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>{isRTL ? "كشف الحساب" : "Statement"}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm space-y-2">
            <Building2 className="h-8 w-8 mx-auto text-gray-300" />
            <p className="font-bold text-gray-700">
              {isRTL ? "لم يتم العثور على حسابات عملاء مطابقة للبحث" : "No customer accounts match your search"}
            </p>
          </div>
        )}
      </Card>

      {/* ── Customer 360° Profile & Statement Drawer (`Sheet`) ── */}
      {selectedCustomer && selectedBalance && (
        <Sheet
          open={!!selectedCustomer}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
          side={isRTL ? "left" : "right"}
          className="w-full text-start"
        >
          <SheetHeader onClose={() => setSelectedCustomer(null)}>
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-orange-50 text-[#C45B2A] shrink-0 mt-0.5">
                <Building className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                    {selectedCustomer.company}
                  </SheetTitle>
                  <Badge variant={getTierBadgeVariant(selectedCustomer.tier)} size="sm">
                    {selectedCustomer.tier}
                  </Badge>
                </div>
                <SheetDescription className="text-xs text-gray-500 leading-relaxed break-words">
                  <span className="font-mono font-bold text-gray-700 ltr-preserve">{selectedCustomer.code}</span> • {selectedCustomer.name} • {selectedCustomer.city}, {selectedCustomer.country}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <SheetContent className="space-y-3.5 sm:space-y-5 p-3.5 sm:p-5 pt-3">
            {/* Mathematical Formula Breakdown Card (Legacy Google Apps Script: 00_مراقبة_العملاء_والشركات) */}
            <div className="p-3 sm:p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <CalculatorIcon className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-300 tracking-wide uppercase truncate sm:whitespace-normal">
                    {isRTL
                      ? "معادلة رصيد العميل التراكمي (00_مراقبة_العملاء)"
                      : "Cumulative Balance Equation (00_مراقبة_العملاء)"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono self-start sm:self-auto bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 sm:border-0 sm:p-0 sm:bg-transparent">
                  (Sales + Extra) - RTO - Collections
                </span>
              </div>

              {/* Step-by-Step Mathematical Ledger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold block leading-tight truncate">
                    (+) {isRTL ? "مبيعات البوالص" : "Total Sales"}
                  </span>
                  <p className="text-xs sm:text-sm font-black text-emerald-400 font-mono mt-0.5 break-all">
                    +{selectedBalance.totalSales.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-400 mt-0.5">{selectedBalance.shipmentCount} AWB</span>
                </div>

                <div className="bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold block leading-tight truncate">
                    (+) {isRTL ? "مصاريف إضافية" : "Extra Fees"}
                  </span>
                  <p className="text-xs sm:text-sm font-black text-purple-400 font-mono mt-0.5 break-all">
                    +{selectedBalance.extraExpenses.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-400 mt-0.5">{isRTL ? "رسوم ملحقة" : "Surcharges"}</span>
                </div>

                <div className="bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold block leading-tight truncate">
                    (-) {isRTL ? "مبيعات المرتجع RTO" : "RTO Deductions"}
                  </span>
                  <p className="text-xs sm:text-sm font-black text-amber-400 font-mono mt-0.5 break-all">
                    -{selectedBalance.rtoSales.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-400 mt-0.5">{selectedBalance.rtoCount} RTO</span>
                </div>

                <div className="bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold block leading-tight truncate">
                    (-) {isRTL ? "التحصيلات المستلمة" : "Collections"}
                  </span>
                  <p className="text-xs sm:text-sm font-black text-sky-400 font-mono mt-0.5 break-all">
                    -{selectedBalance.totalCollected.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    {selectedCustomerCollections.length} {isRTL ? "سند" : "receipts"}
                  </span>
                </div>
              </div>

              {/* Net Balance Result Banner */}
              <div className="bg-slate-800 p-2.5 sm:p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-slate-700">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    (=) {isRTL ? "صافي الرصيد المستحق النهائي على العميل" : "Net Due Cumulative Balance"}:
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isRTL
                      ? `الحد الائتماني المسموح: ${selectedCustomer.creditLimit.toLocaleString()} EGP`
                      : `Approved Credit Limit: ${selectedCustomer.creditLimit.toLocaleString()} EGP`}
                  </p>
                </div>
                <span
                  className={`text-lg sm:text-xl font-black font-mono shrink-0 ${
                    selectedBalance.netBalance > 0
                      ? "text-[#FF8A50]"
                      : selectedBalance.netBalance === 0
                      ? "text-slate-300"
                      : "text-emerald-400"
                  }`}
                >
                  {selectedBalance.netBalance.toLocaleString()} EGP
                </span>
              </div>
            </div>

            {/* Sub-Navigation Tabs inside Drawer */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setDrawerTab("ledger")}
                className={`flex-1 min-w-[95px] text-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  drawerTab === "ledger"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                }`}
              >
                {isRTL ? "شحنات العميل" : "Shipments"}
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("collections")}
                className={`flex-1 min-w-[95px] text-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  drawerTab === "collections"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                }`}
              >
                {isRTL ? "سندات التحصيل" : "Collections"} 
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("profile")}
                className={`flex-1 min-w-[95px] text-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  drawerTab === "profile"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                }`}
              >
                {isRTL ? "بيانات التعاقد" : "Contract & Details"}
              </button>
            </div>

            {/* Sub-Tab 1: Shipments Ledger */}
            {drawerTab === "ledger" && (
              <div className="space-y-3">
                {/* Small Screen: Responsive Cards */}
                <div className="block sm:hidden space-y-2.5">
                  {selectedCustomerShipments.map((s) => {
                    const isRTO = (s.status || "").toUpperCase().includes("RTO") || (s.status || "").toUpperCase().includes("RETURN");
                    const price = s.sellingPrice !== undefined ? s.sellingPrice : (s.priceEgp || 0);
                    return (
                      <div
                        key={s.id || s.awb}
                        className={`p-3 rounded-2xl border text-xs space-y-2 transition-all ${
                          isRTO ? "bg-amber-50/70 border-amber-200" : "bg-white border-gray-200/90 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md ltr-preserve">
                            #{s.awb}
                          </span>
                          <Badge variant={isRTO ? "warning" : "outline"} size="sm">
                            {s.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-gray-100">
                          <div>
                            <span className="text-gray-400 block text-[10px]">{isRTL ? "الوجهة" : "Destination"}</span>
                            <span className="font-semibold text-gray-800">{s.country || "—"}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">{isRTL ? "الوزن / التاريخ" : "Weight / Date"}</span>
                            <span className="font-mono text-gray-700">{s.weight} kg • {s.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                          <div>
                            <span className="text-[10px] text-gray-400 block">{isRTL ? "سعر البيع" : "Selling Price"}</span>
                            <span className="font-mono font-bold text-gray-900">{price.toLocaleString()} EGP</span>
                          </div>
                          <div className="text-end">
                            <span className="text-[10px] text-gray-400 block">{isRTL ? "صافي الربح" : "Net Profit"}</span>
                            <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              +{(s.netProfit || 0).toLocaleString()} EGP
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop & Tablet: Full Detailed Table */}
                <div className="hidden sm:block overflow-x-auto w-full max-h-72 overflow-y-auto rounded-xl border border-gray-200">
                  <Table className="min-w-[620px]">
                    <TableHeader className="bg-gray-50 text-[11px]">
                      <TableRow>
                        <TableHead className="text-start">AWB</TableHead>
                        <TableHead className="text-start">{isRTL ? "التاريخ" : "Date"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "الوجهة" : "Destination"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "الوزن" : "Weight"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "سعر البيع" : "Price"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "الحالة" : "Status"}</TableHead>
                        <TableHead className="text-end">{isRTL ? "صافي الربح" : "Net Profit"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomerShipments.map((s) => {
                        const isRTO = (s.status || "").toUpperCase().includes("RTO") || (s.status || "").toUpperCase().includes("RETURN");
                        const price = s.sellingPrice !== undefined ? s.sellingPrice : (s.priceEgp || 0);
                        return (
                          <TableRow key={s.id || s.awb} className={isRTO ? "bg-amber-50/50" : ""}>
                            <TableCell className="font-mono text-xs font-bold text-gray-900 ltr-preserve">
                              {s.awb}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 font-mono">{s.date}</TableCell>
                            <TableCell className="text-xs text-gray-700">{s.country}</TableCell>
                            <TableCell className="text-xs font-mono text-gray-700">{s.weight} kg</TableCell>
                            <TableCell className="text-xs font-mono font-bold text-gray-900">
                              {price.toLocaleString()} EGP
                            </TableCell>
                            <TableCell>
                              <Badge variant={isRTO ? "warning" : "outline"} size="sm">
                                {s.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs font-bold text-emerald-700">
                              {(s.netProfit || 0).toLocaleString()} EGP
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {selectedCustomerShipments.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    {isRTL ? "لا توجد شحنات مسجلة باسم هذا العميل حتى الآن" : "No shipments logged for this client yet"}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 2: Collections History */}
            {drawerTab === "collections" && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-gray-700">
                    {isRTL ? "سجل التحصيلات والمقبوضات البنكية والنقدية" : "Verified Inward Collections"}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
                    {selectedCustomerCollections.length} {isRTL ? "سند تحصيل" : "Receipts"}
                  </Badge>
                </div>

                {/* Small Screen: Responsive Cards */}
                <div className="block sm:hidden space-y-2.5">
                  {selectedCustomerCollections.map((col) => (
                    <div
                      key={col.id}
                      className="p-3 rounded-2xl border border-gray-200/90 bg-white shadow-2xs text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md ltr-preserve">
                          #{col.receiptNumber || col.id}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">{col.date}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-400 block">{isRTL ? "المبلغ المحصل" : "Amount"}</span>
                          <span className="font-mono font-bold text-sm text-emerald-700">
                            +{col.amount.toLocaleString()} {col.currency}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                          {col.paymentMethod}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-gray-100">
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="truncate">{col.receivingAccount}</span>
                        </span>
                        <span className="text-gray-500 font-medium">{col.recordedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop & Tablet: Full Detailed Table */}
                <div className="hidden sm:block overflow-x-auto w-full max-h-72 overflow-y-auto rounded-xl border border-gray-200">
                  <Table className="min-w-[580px]">
                    <TableHeader className="bg-gray-50 text-[11px]">
                      <TableRow>
                        <TableHead className="text-start">{isRTL ? "رقم السند" : "Receipt #"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "التاريخ" : "Date"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "المبلغ" : "Amount"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "الحساب / الخزينة" : "Vault / Account"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "طريقة الدفع" : "Method"}</TableHead>
                        <TableHead className="text-end">{isRTL ? "المسؤول" : "Recorder"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomerCollections.map((col) => (
                        <TableRow key={col.id}>
                          <TableCell className="font-mono text-xs font-bold text-gray-800 ltr-preserve">
                            {col.receiptNumber || col.id}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 font-mono">{col.date}</TableCell>
                          <TableCell className="text-xs font-mono font-bold text-emerald-700">
                            {col.amount.toLocaleString()} {col.currency}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-gray-700">
                            <span className="inline-flex items-center gap-1">
                              <Wallet className="h-3 w-3 text-gray-400" />
                              {col.receivingAccount}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">{col.paymentMethod}</TableCell>
                          <TableCell className="text-end text-xs text-gray-600 font-medium">{col.recordedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {selectedCustomerCollections.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    {isRTL ? "لم يتم تسجيل أي سندات تحصيل لهذا العميل بعد" : "No collections recorded for this client yet"}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 3: Contact & Contract Details */}
            {drawerTab === "profile" && (
              <div className="space-y-3 sm:space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">{t("admin.customers.modal.creditLimit")}</span>
                    <p className="font-mono font-bold text-sm text-gray-900">{selectedCustomer.creditLimit.toLocaleString()} EGP</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">{isRTL ? "السجل الضريبي / التجاري" : "Tax Registration"}</span>
                    <p className="font-mono font-bold text-sm text-gray-900 break-all">{selectedCustomer.taxRegistrationNumber || "N/A"}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t("admin.customers.modal.contactName")}</h4>
                  <div className="space-y-2">
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#C45B2A] transition-colors break-all"
                    >
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{selectedCustomer.email}</span>
                    </a>
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#C45B2A] transition-colors ltr-preserve"
                    >
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{selectedCustomer.phone}</span>
                    </a>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{selectedCustomer.city}, {selectedCustomer.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <UserCheck className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{isRTL ? "مسؤول الحساب" : "Account Manager"}: {selectedCustomer.assignedManager}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>

          <SheetFooter className="border-t border-gray-200/80 p-3 sm:p-4 bg-gray-50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono font-bold text-gray-500 ltr-preserve">{selectedCustomer.code}</span>
              <Badge variant={getTierBadgeVariant(selectedCustomer.tier)} size="sm">
                {selectedCustomer.tier}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCustomer(null)}
              className="px-5 font-bold text-xs cursor-pointer border-gray-300 hover:bg-gray-200/70 shrink-0"
            >
              {t("common.close")}
            </Button>
          </SheetFooter>
        </Sheet>
      )}

      {/* ── Add Customer Modal ── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 text-start" onClose={() => setAddModalOpen(false)}>
          <DialogHeader className="text-start">
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-orange-50 text-[#C45B2A] shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <span>{t("admin.customers.modal.createTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 text-start">
              {t("admin.customers.modal.createSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t("admin.customers.modal.companyName")} *
                </label>
                <Input
                  required
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder={isRTL ? "مثال: شركة النيل للتكنولوجيا" : "Apex Global Technologies"}
                  className="text-xs text-start focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t("admin.customers.modal.contactName")} *
                </label>
                <Input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={isRTL ? "طارق منصور" : "Tarek Mansour"}
                  className="text-xs text-start focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t("admin.customers.modal.email")} *
                </label>
                <Input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="text-xs font-mono text-start focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t("admin.customers.modal.phone")} *
                </label>
                <Input
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+20 122 000 0000"
                  className="text-xs font-mono text-start focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t("admin.customers.table.cityCountry")} *
                </label>
                <div className="flex gap-2">
                  <Input
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder={isRTL ? "القاهرة" : "Cairo"}
                    className="text-xs text-start focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  />
                  <Input
                    required
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder={isRTL ? "مصر" : "Egypt"}
                    className="text-xs text-start focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t("admin.customers.modal.tier")}
                </label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C45B2A]/20 focus:border-[#C45B2A] cursor-pointer text-start"
                >
                  <option value="Enterprise VIP">Enterprise VIP (High Volume)</option>
                  <option value="Corporate Partner">Corporate Partner</option>
                  <option value="Standard Shipper">Standard Shipper</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {t("admin.customers.modal.creditLimit")} (EGP) *
                </label>
                <Input
                  type="number"
                  required
                  value={formCreditLimit}
                  onChange={(e) => setFormCreditLimit(e.target.value)}
                  className="text-xs font-mono text-start focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {isRTL ? "السجل الضريبي / التجاري" : "Tax Registration CR #"}
                </label>
                <Input
                  value={formTaxNumber}
                  onChange={(e) => setFormTaxNumber(e.target.value)}
                  placeholder="EG-904-219-550"
                  className="text-xs font-mono text-start focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  dir="ltr"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                className="text-xs font-bold border-slate-300 cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="text-xs font-bold cursor-pointer"
              >
                {t("admin.customers.modal.saveBtn")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mini SVG Calculator Icon helper to avoid external lucide conflict
function CalculatorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}
