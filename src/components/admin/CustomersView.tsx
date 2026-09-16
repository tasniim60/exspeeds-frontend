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
  Receipt,
  Trash2,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  onAddCollection?: (collection: CustomerCollection) => void;
  onDeleteCollection?: (id: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  shipments,
  invoices,
  collections = [],
  expenses = [],
  onAddCustomer,
  onUpdateCustomer,
  onAddCollection,
  onDeleteCollection,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [balanceFilter, setBalanceFilter] = useState<"all" | "due" | "settled">("all");

  // Modals & Profile Drawer
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
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
  const [formManager, setFormManager] = useState("مصطفي");

  // Form State: Record Collection
  const [colTargetCustomer, setColTargetCustomer] = useState<string>("");
  const [colAmount, setColAmount] = useState<string>("");
  const [colCurrency, setColCurrency] = useState<"EGP" | "USD">("EGP");
  const [colDate, setColDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [colReceivingAccount, setColReceivingAccount] = useState<string>("CIB account");
  const [colPaymentMethod, setColPaymentMethod] = useState<string>("تحويل بنكي CIB");
  const [colReceiptNumber, setColReceiptNumber] = useState<string>("");
  const [colRecordedBy, setColRecordedBy] = useState<string>("بسمة");
  const [colNotes, setColNotes] = useState<string>("");

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

  const openRecordCollectionModal = (customer?: Customer) => {
    const cust = customer || selectedCustomer || customers[0];
    if (cust) {
      setColTargetCustomer(cust.company || cust.name);
    }
    setColAmount("");
    setColCurrency("EGP");
    setColDate(new Date().toISOString().split("T")[0]);
    setColReceivingAccount("CIB account");
    setColPaymentMethod("تحويل بنكي CIB");
    setColReceiptNumber(`COL-${Date.now().toString().slice(-4)}`);
    setColRecordedBy("بسمة");
    setColNotes("");
    setCollectionModalOpen(true);
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(colAmount);
    if (isNaN(amt) || amt <= 0 || !colTargetCustomer) return;

    const matchedCust = customers.find(
      (c) => c.company.toLowerCase() === colTargetCustomer.toLowerCase() || c.name.toLowerCase() === colTargetCustomer.toLowerCase()
    );

    const newCol: CustomerCollection = {
      id: `col-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: matchedCust ? matchedCust.id : undefined,
      clientName: colTargetCustomer,
      amount: amt,
      currency: colCurrency,
      date: colDate,
      receivingAccount: colReceivingAccount,
      paymentMethod: colPaymentMethod,
      receiptNumber: colReceiptNumber || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      recordedBy: colRecordedBy,
      notes: colNotes,
    };

    if (onAddCollection) {
      onAddCollection(newCol);
    }
    setCollectionModalOpen(false);
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
            variant="outline"
            onClick={() => openRecordCollectionModal()}
            className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Receipt className="h-4 w-4 text-emerald-600" />
            <span>{isRTL ? "تسجيل تحصيل" : "Record Collection"}</span>
          </Button>

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
          <span className="text-gray-400 font-semibold uppercase text-[10px]">
            {isRTL ? "إجمالي مبيعات البوالص" : "Total Consignments Sales"}
          </span>
          <p className="text-2xl font-black font-display text-gray-900">
            {kpiTotals.combinedSales.toLocaleString()} <span className="text-xs font-normal text-gray-500">EGP</span>
          </p>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="text-emerald-600 font-semibold">{kpiTotals.combinedShipments} AWB</span>
            {kpiTotals.combinedRto > 0 && (
              <span className="text-amber-600">({kpiTotals.combinedRto.toLocaleString()} EGP RTO)</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-400 font-semibold uppercase text-[10px]">
            {isRTL ? "إجمالي التحصيلات المستلمة" : "Total Collections Received"}
          </span>
          <p className="text-2xl font-black font-display text-emerald-700">
            {kpiTotals.combinedCollected.toLocaleString()} <span className="text-xs font-normal text-gray-500">EGP</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">
            {isRTL ? "مقبوضات مسجلة بالخزائن والبنوك" : "Verified deposited receipts"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-400 font-semibold uppercase text-[10px]">
            {isRTL ? "صافي الأرصدة المستحقة (المطلوبة)" : "Net Outstanding Receivables"}
          </span>
          <p className="text-2xl font-black font-display text-[#C45B2A]">
            {kpiTotals.combinedNetBalance.toLocaleString()} <span className="text-xs font-normal text-gray-500">EGP</span>
          </p>
          <p className="text-[11px] text-gray-500 font-medium">
            {isRTL ? "الرصيد التراكمي الفعلي المستحق" : "Cumulative balance owed by clients"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs space-y-1 text-start">
          <span className="text-gray-400 font-semibold uppercase text-[10px]">
            {isRTL ? "حسابات الشركات النشطة" : "Active Corporate Clients"}
          </span>
          <p className="text-2xl font-black font-display text-gray-900">{kpiTotals.totalCustomers}</p>
          <p className="text-[11px] text-sky-600 font-medium">
            {isRTL ? "منظومة الحسابات المعتمدة" : "Active commercial accounts"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-2.5 h-4 w-4 text-gray-400`} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? "بحث باسم العميل، الشركة، الكود، المدينة..." : "Search by company, client name, code, city..."}
            className={`text-xs ${isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
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
        <Table>
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
                      <span className="text-xs font-bold text-gray-900">{b.shipmentCount} AWB</span>
                      {b.rtoCount > 0 && (
                        <p className="text-[10px] text-amber-600 font-semibold">
                          {b.rtoCount} RTO ({b.rtoSales.toLocaleString()} EGP)
                        </p>
                      )}
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
                        onClick={() => openRecordCollectionModal(cust)}
                        className="text-xs font-semibold cursor-pointer border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>{isRTL ? "تحصيل" : "Collect"}</span>
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setSelectedCustomer(cust)}
                        className="text-xs cursor-pointer hover:bg-gray-100"
                      >
                        {isRTL ? "كشف حساب" : "Statement"}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-lg font-bold text-gray-900">{selectedCustomer.company}</SheetTitle>
                  <Badge variant={getTierBadgeVariant(selectedCustomer.tier)}>
                    {selectedCustomer.tier}
                  </Badge>
                </div>
                <SheetDescription className="text-xs text-gray-500 mt-0.5">
                  {selectedCustomer.code} • {selectedCustomer.name} • {selectedCustomer.city}, {selectedCustomer.country}
                </SheetDescription>
              </div>

              <Button
                size="sm"
                variant="brand"
                onClick={() => openRecordCollectionModal(selectedCustomer)}
                className="text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Receipt className="h-4 w-4" />
                <span>{isRTL ? "تسجيل سند تحصيل" : "Record Collection"}</span>
              </Button>
            </div>
          </SheetHeader>

          <SheetContent className="space-y-6 pt-2">
            {/* Mathematical Formula Breakdown Card (Legacy Google Apps Script: 00_مراقبة_العملاء_والشركات) */}
            <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <CalculatorIcon className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                    {isRTL
                      ? "معادلة رصيد العميل التراكمي (00_مراقبة_العملاء_والشركات)"
                      : "Cumulative Balance Equation (00_مراقبة_العملاء)"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  (Sales + Extra) - RTO - Collections
                </span>
              </div>

              {/* Step-by-Step Mathematical Ledger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    (+) {isRTL ? "مبيعات البوالص" : "Total Sales"}
                  </span>
                  <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                    +{selectedBalance.totalSales.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-400">{selectedBalance.shipmentCount} AWB</span>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    (+) {isRTL ? "مصاريف إضافية" : "Extra Fees"}
                  </span>
                  <p className="text-sm font-black text-purple-400 font-mono mt-0.5">
                    +{selectedBalance.extraExpenses.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-400">{isRTL ? "رسوم ملحقة" : "Surcharges"}</span>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    (-) {isRTL ? "مبيعات المرتجع RTO" : "RTO Deductions"}
                  </span>
                  <p className="text-sm font-black text-amber-400 font-mono mt-0.5">
                    -{selectedBalance.rtoSales.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-400">{selectedBalance.rtoCount} RTO</span>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    (-) {isRTL ? "التحصيلات المستلمة" : "Collections"}
                  </span>
                  <p className="text-sm font-black text-sky-400 font-mono mt-0.5">
                    -{selectedBalance.totalCollected.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-slate-400">
                    {selectedCustomerCollections.length} {isRTL ? "سند" : "receipts"}
                  </span>
                </div>
              </div>

              {/* Net Balance Result Banner */}
              <div className="bg-slate-800 p-3 rounded-lg flex items-center justify-between border border-slate-700">
                <div>
                  <span className="text-[11px] font-bold text-slate-300">
                    (=) {isRTL ? "صافي الرصيد المستحق النهائي على العميل" : "Net Due Cumulative Balance"}:
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {isRTL
                      ? `الحد الائتماني المسموح: ${selectedCustomer.creditLimit.toLocaleString()} EGP`
                      : `Approved Credit Limit: ${selectedCustomer.creditLimit.toLocaleString()} EGP`}
                  </p>
                </div>
                <span
                  className={`text-xl font-black font-mono ${
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
            <div className="flex items-center gap-1 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setDrawerTab("ledger")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  drawerTab === "ledger"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isRTL ? "شحنات وبوالص العميل" : "Shipments"} ({selectedCustomerShipments.length})
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("collections")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  drawerTab === "collections"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isRTL ? "سندات التحصيل" : "Collections"} ({selectedCustomerCollections.length})
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("profile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  drawerTab === "profile"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isRTL ? "بيانات التعاقد والاتصال" : "Contract & Details"}
              </button>
            </div>

            {/* Sub-Tab 1: Shipments Ledger */}
            {drawerTab === "ledger" && (
              <div className="space-y-3">
                <div className="overflow-x-auto w-full max-h-72 overflow-y-auto rounded-lg border border-gray-200">
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

                  {selectedCustomerShipments.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      {isRTL ? "لا توجد شحنات مسجلة باسم هذا العميل حتى الآن" : "No shipments logged for this client yet"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Collections History */}
            {drawerTab === "collections" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    {isRTL ? "سجل التحصيلات والمقبوضات البنكية والنقدية" : "Verified Inward Collections"}
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => openRecordCollectionModal(selectedCustomer)}
                    className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{isRTL ? "إضافة سند تحصيل" : "New Collection"}</span>
                  </Button>
                </div>

                <div className="overflow-x-auto w-full max-h-72 overflow-y-auto rounded-lg border border-gray-200">
                  <Table className="min-w-[580px]">
                    <TableHeader className="bg-gray-50 text-[11px]">
                      <TableRow>
                        <TableHead className="text-start">{isRTL ? "رقم السند" : "Receipt #"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "التاريخ" : "Date"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "المبلغ" : "Amount"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "الحساب / الخزينة" : "Vault / Account"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "طريقة الدفع" : "Method"}</TableHead>
                        <TableHead className="text-start">{isRTL ? "المسؤول" : "Recorder"}</TableHead>
                        <TableHead className="text-end">{isRTL ? "إجراء" : "Action"}</TableHead>
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
                          <TableCell className="text-xs text-gray-600">{col.recordedBy}</TableCell>
                          <TableCell className="text-end py-2">
                            {onDeleteCollection && (
                              <div className="flex items-center justify-end">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onDeleteCollection(col.id)}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title={isRTL ? "حذف سند التحصيل" : "Delete collection"}
                                  aria-label={isRTL ? "حذف سند التحصيل" : "Delete collection"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {selectedCustomerCollections.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      {isRTL ? "لم يتم تسجيل أي سندات تحصيل لهذا العميل بعد" : "No collections recorded for this client yet"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Contact & Contract Details */}
            {drawerTab === "profile" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">{t("admin.customers.modal.creditLimit")}</span>
                    <p className="font-mono font-bold text-sm text-gray-900">{selectedCustomer.creditLimit.toLocaleString()} EGP</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">{isRTL ? "السجل الضريبي / التجاري" : "Tax Registration"}</span>
                    <p className="font-mono font-bold text-sm text-gray-900">{selectedCustomer.taxRegistrationNumber || "N/A"}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t("admin.customers.modal.contactName")}</h4>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 ltr-preserve">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
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
            )}
          </SheetContent>

          <SheetFooter className="border-t border-gray-200 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCustomer(null)}
              className="text-xs cursor-pointer"
            >
              {t("common.close")}
            </Button>
          </SheetFooter>
        </Sheet>
      )}

      {/* ── Record Customer Collection Modal (`Dialog`) ── */}
      <Dialog open={collectionModalOpen} onOpenChange={setCollectionModalOpen}>
        <DialogContent className="max-w-md text-start" onClose={() => setCollectionModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              <span>{isRTL ? "تسجيل سند تحصيل وقبض نقدية" : "Record Customer Collection"}</span>
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? "إيداع مبالغ سداد في الخزينة أو الحساب البنكي، لخصمها فوريًا من رصيد العميل التراكمي"
                : "Credit client collection to treasury account to deduct from cumulative balance"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCollection} className="space-y-3.5">
            {/* Target Client */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                {isRTL ? "اسم العميل / الشركة" : "Customer / Client Name"} *
              </label>
              <select
                required
                value={colTargetCustomer}
                onChange={(e) => setColTargetCustomer(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-800 cursor-pointer"
              >
                <option value="">{isRTL ? "-- اختر العميل --" : "-- Select Customer --"}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.company}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "المبلغ المحصل" : "Amount Collected"} *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={colAmount}
                  onChange={(e) => setColAmount(e.target.value)}
                  placeholder="2500"
                  className="text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "العملة" : "Currency"}
                </label>
                <select
                  value={colCurrency}
                  onChange={(e) => setColCurrency(e.target.value as "EGP" | "USD")}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-800 cursor-pointer"
                >
                  <option value="EGP">EGP (جنيه مصري)</option>
                  <option value="USD">USD (دولار أمريكي)</option>
                </select>
              </div>
            </div>

            {/* Receiving Account (Treasury) & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "حساب / خزينة الإيداع" : "Receiving Treasury Vault"} *
                </label>
                <select
                  required
                  value={colReceivingAccount}
                  onChange={(e) => setColReceivingAccount(e.target.value)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-800 cursor-pointer"
                >
                  {MASTER_FINANCIAL_ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "تاريخ التحصيل" : "Collection Date"}
                </label>
                <Input
                  type="date"
                  required
                  value={colDate}
                  onChange={(e) => setColDate(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Payment Method & Receipt # */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "طريقة السداد" : "Payment Method"}
                </label>
                <select
                  value={colPaymentMethod}
                  onChange={(e) => setColPaymentMethod(e.target.value)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-800 cursor-pointer"
                >
                  <option value="تحويل بنكي CIB">تحويل بنكي CIB</option>
                  <option value="نقدي (كاش)">نقدي (كاش بالفرع)</option>
                  <option value="محفظة إلكترونية">محفظة إلكترونية (فودافون/سبيدكس)</option>
                  <option value="شيك بنكي">شيك بنكي مقبول الدفع</option>
                  <option value="بطاقة بنكية POS">بطاقة بنكية POS</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "رقم إيصال / سند القبض" : "Receipt # / Ref"}
                </label>
                <Input
                  value={colReceiptNumber}
                  onChange={(e) => setColReceiptNumber(e.target.value)}
                  placeholder="COL-8821"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Recorded By */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                {isRTL ? "المسؤول عن التسجيل" : "Recorded By"}
              </label>
              <select
                value={colRecordedBy}
                onChange={(e) => setColRecordedBy(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-800 cursor-pointer"
              >
                {MASTER_AGENTS.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                {isRTL ? "ملاحظات السند" : "Notes / Remarks"}
              </label>
              <Input
                value={colNotes}
                onChange={(e) => setColNotes(e.target.value)}
                placeholder={isRTL ? "سداد تحت حساب شحنات أغسطس..." : "Payment on account..."}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCollectionModalOpen(false)}
                className="w-full sm:w-auto h-10 text-xs cursor-pointer justify-center"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="w-full sm:w-auto h-10 text-xs font-bold cursor-pointer justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isRTL ? "حفظ سند التحصيل" : "Save Collection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Customer Modal ── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-xl text-start" onClose={() => setAddModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              <Users className="h-5 w-5 text-[#C45B2A]" />
              {t("admin.customers.modal.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.customers.modal.createSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.companyName")}
                </label>
                <Input
                  required
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder={isRTL ? "مثال: شركة النيل للتكنولوجيا" : "Apex Global Technologies"}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.contactName")}
                </label>
                <Input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={isRTL ? "طارق منصور" : "Tarek Mansour"}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.email")}
                </label>
                <Input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.phone")}
                </label>
                <Input
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+20 122 000 0000"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.table.cityCountry")}
                </label>
                <div className="flex gap-2">
                  <Input
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder={isRTL ? "القاهرة" : "Cairo"}
                    className="text-xs"
                  />
                  <Input
                    required
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder={isRTL ? "مصر" : "Egypt"}
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.tier")}
                </label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="Enterprise VIP">Enterprise VIP (High Volume)</option>
                  <option value="Corporate Partner">Corporate Partner</option>
                  <option value="Standard Shipper">Standard Shipper</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.customers.modal.creditLimit")}
                </label>
                <Input
                  type="number"
                  required
                  value={formCreditLimit}
                  onChange={(e) => setFormCreditLimit(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "السجل الضريبي / التجاري" : "Tax Registration CR #"}
                </label>
                <Input
                  value={formTaxNumber}
                  onChange={(e) => setFormTaxNumber(e.target.value)}
                  placeholder="EG-904-219-550"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                className="w-full sm:w-auto h-10 text-xs cursor-pointer justify-center"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="w-full sm:w-auto h-10 text-xs font-bold cursor-pointer justify-center"
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
