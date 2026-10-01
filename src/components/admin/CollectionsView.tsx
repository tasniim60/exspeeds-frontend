"use client";

import React, { useState, useMemo } from "react";
import {
  HandCoins,
  Plus,
  Search,
  Filter,
  Calendar,
  Building,
  User,
  CreditCard,
  Receipt,
  Trash2,
  AlertCircle,
  Wallet,
  Landmark,
  ArrowDownLeft,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useLanguage } from "@/context/LanguageContext";
import {
  Customer,
  CustomerCollection,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
} from "@/lib/adminData";

interface CollectionsViewProps {
  collections: CustomerCollection[];
  customers: Customer[];
  onAddCollection: (collection: CustomerCollection) => void;
  onDeleteCollection: (id: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections = [],
  customers = [],
  onAddCollection,
  onDeleteCollection,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>("all");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");

  // Modal State: Record Collection
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [colTargetCustomer, setColTargetCustomer] = useState<string>("");
  const [colCustomCustomerName, setColCustomCustomerName] = useState<string>("");
  const [colAmount, setColAmount] = useState<string>("");
  const [colCurrency, setColCurrency] = useState<"EGP" | "USD">("EGP");
  const [colDate, setColDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [colReceivingAccount, setColReceivingAccount] = useState<string>(
    MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account"
  );
  const [colPaymentMethod, setColPaymentMethod] = useState<string>("تحويل بنكي CIB");
  const [colReceiptNumber, setColReceiptNumber] = useState<string>("");
  const [colRecordedBy, setColRecordedBy] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [colNotes, setColNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Modal State: Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<CustomerCollection | null>(null);

  // Submit Collection
  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(colAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert(isRTL ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Please enter a valid amount");
      return;
    }

    let resolvedClientName = colCustomCustomerName.trim();
    let resolvedCustomerId: string | undefined = undefined;

    if (colTargetCustomer) {
      const found = customers.find((c) => c.id === colTargetCustomer);
      if (found) {
        resolvedClientName = found.company || found.name;
        resolvedCustomerId = found.id;
      }
    }

    if (!resolvedClientName) {
      alert(isRTL ? "يرجى تحديد اسم العميل" : "Please select or enter customer name");
      return;
    }

    setSubmitting(true);
    try {
      const newCollection: CustomerCollection = {
        id: `col-${Date.now()}`,
        customerId: resolvedCustomerId,
        clientName: resolvedClientName,
        amount: parsedAmount,
        currency: colCurrency,
        date: colDate,
        receivingAccount: colReceivingAccount,
        paymentMethod: colPaymentMethod.trim() || "نقدي",
        receiptNumber: colReceiptNumber.trim() || `REC-${Date.now().toString().slice(-6)}`,
        recordedBy: colRecordedBy,
        notes: colNotes.trim(),
      };

      onAddCollection(newCollection);
      setAddModalOpen(false);

      // Reset form
      setColTargetCustomer("");
      setColCustomCustomerName("");
      setColAmount("");
      setColNotes("");
      setColReceiptNumber("");
    } catch (err) {
      console.error("Error creating collection:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    let totalEgp = 0;
    let totalUsd = 0;
    const nowStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    let currentMonthEgp = 0;

    collections.forEach((c) => {
      if (c.currency === "USD") {
        totalUsd += c.amount || 0;
        totalEgp += (c.amount || 0) * 50;
      } else {
        totalEgp += c.amount || 0;
        if (c.date?.startsWith(nowStr)) {
          currentMonthEgp += c.amount || 0;
        }
      }
    });

    return {
      totalEgp,
      totalUsd,
      count: collections.length,
      currentMonthEgp,
    };
  }, [collections]);

  // Filtered list
  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.clientName?.toLowerCase().includes(q) ||
        c.receiptNumber?.toLowerCase().includes(q) ||
        c.receivingAccount?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q) ||
        c.recordedBy?.toLowerCase().includes(q);

      const matchesVault = selectedVaultFilter === "all" || c.receivingAccount === selectedVaultFilter;
      const matchesAgent = selectedAgentFilter === "all" || c.recordedBy === selectedAgentFilter;

      return matchesSearch && matchesVault && matchesAgent;
    });
  }, [collections, searchQuery, selectedVaultFilter, selectedAgentFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#251516] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
              <HandCoins className="w-5 h-5" />
            </div>
            <span>{isRTL ? "سندات التحصيل ومقبوضات العملاء" : "Customer Collections & Receipts"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isRTL
              ? "تسجيل ومتابعة التحصيلات النقدية والبنكية والمحافظ الإلكترونية وتغذية الخزائن"
              : "Track cash, bank, and wallet receipts credited from customers into vaults"}
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? "تسجيل سند تحصيل جديد" : "Record New Collection"}</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "إجمالي المقبوضات" : "Total Collections"}</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-700">{formatCurrency(kpis.totalEgp, "EGP")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "تحصيلات الشهر الحالي" : "This Month"}</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{formatCurrency(kpis.currentMonthEgp, "EGP")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "عدد السندات" : "Receipts Count"}</p>
              <p className="text-2xl font-black text-gray-900">{kpis.count}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Receipt className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "مقبوضات بالدولار" : "USD Volume"}</p>
              <p className="text-2xl font-black text-gray-900">${kpis.totalUsd.toLocaleString()}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Landmark className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="rounded-2xl border-gray-200 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className={`w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"}`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? "بحث باسم العميل، رقم السند، الحساب، أو الملاحظات..." : "Search customer, receipt #, account..."}
                className={`h-10 rounded-xl bg-gray-50/60 border-gray-200 text-xs sm:text-sm ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedVaultFilter}
                onChange={(e) => setSelectedVaultFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل الخزائن والحسابات" : "All Vaults"}</option>
                {MASTER_FINANCIAL_ACCOUNTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                value={selectedAgentFilter}
                onChange={(e) => setSelectedAgentFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل المسجلين" : "All Agents"}</option>
                {MASTER_AGENTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Table */}
      <Card className="rounded-2xl border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/90 border-b border-gray-200">
              <TableRow>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "رقم السند / التاريخ" : "Receipt # / Date"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "اسم العميل" : "Customer"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المبلغ المحصل" : "Amount"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "الحساب المستلم (الخزينة)" : "Receiving Vault"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "طريقة الدفع / البيان" : "Payment Method & Notes"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المسجل" : "Agent"}
                </TableHead>
                <TableHead className="text-center text-xs font-bold text-gray-700">
                  {isRTL ? "الإجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <HandCoins className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{isRTL ? "لا توجد سندات تحصيل مسجلة" : "No collection records found"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isRTL ? "اضغط على زر تسجيل سند تحصيل لإضافة دفعة جديدة" : "Click Record New Collection to add a receipt"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCollections.map((c) => (
                  <TableRow key={c.id} className="hover:bg-emerald-50/20 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                          {c.receiptNumber || c.id}
                        </span>
                      </div>
                      <div className="text-[11px] font-normal text-gray-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{c.date}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">{c.clientName}</div>
                      {c.customerId && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {c.customerId}</div>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-black text-emerald-700 font-mono">
                        {formatCurrency(c.amount, c.currency || "EGP")}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                        <Landmark className="w-3 h-3 text-emerald-600" />
                        <span>{c.receivingAccount}</span>
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-gray-700 max-w-[200px]">
                      <div className="font-semibold text-gray-900">{c.paymentMethod || "نقدي"}</div>
                      {c.notes && <div className="text-[11px] text-gray-500 truncate mt-0.5">{c.notes}</div>}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {c.recordedBy || "مصطفي"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(c)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                        title={isRTL ? "حذف السند" : "Delete Receipt"}
                        aria-label={isRTL ? "حذف السند" : "Delete Receipt"}
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal: Record Collection */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <HandCoins className="w-4 h-4" />
              </div>
              <span>{isRTL ? "تسجيل سند تحصيل ومقبوضات عميل" : "Record Customer Collection"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isRTL
                ? "يتم قيد المبلغ لحساب العميل وتغذية الخزينة أو الحساب المستلم تلقائياً"
                : "Credited to client account and recorded in destination treasury"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCollection} className="space-y-3.5 text-xs py-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "تاريخ التحصيل:" : "Date:"}</label>
                <Input type="date" value={colDate} onChange={(e) => setColDate(e.target.value)} required className="h-9 text-xs" />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "اسم المسجل:" : "Agent:"}</label>
                <select
                  value={colRecordedBy}
                  onChange={(e) => setColRecordedBy(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none"
                >
                  {MASTER_AGENTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Selection */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "العميل (اختر أو اكتب):" : "Customer:"}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={colTargetCustomer}
                  onChange={(e) => {
                    setColTargetCustomer(e.target.value);
                    if (e.target.value) setColCustomCustomerName("");
                  }}
                  className="w-full h-9 px-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium outline-none"
                >
                  <option value="">{isRTL ? "-- اختر من قائمة العملاء --" : "-- Select Client --"}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.name}
                    </option>
                  ))}
                </select>
                <Input
                  value={colCustomCustomerName}
                  onChange={(e) => {
                    setColCustomCustomerName(e.target.value);
                    if (e.target.value) setColTargetCustomer("");
                  }}
                  placeholder={isRTL ? "أو اكتب اسم العميل يدوياً" : "Or type customer name"}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "المبلغ المحصل:" : "Amount:"}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={colAmount}
                  onChange={(e) => setColAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "العملة:" : "Currency:"}</label>
                <select
                  value={colCurrency}
                  onChange={(e) => setColCurrency(e.target.value as "EGP" | "USD")}
                  className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                >
                  <option value="EGP">EGP (جنيه مصري)</option>
                  <option value="USD">USD (دولار)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "تم التحصيل بحساب (الخزينة):" : "Receiving Vault:"}</label>
                <select
                  value={colReceivingAccount}
                  onChange={(e) => setColReceivingAccount(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none"
                >
                  {MASTER_FINANCIAL_ACCOUNTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "طريقة الاستلام:" : "Payment Method:"}</label>
                <Input
                  value={colPaymentMethod}
                  onChange={(e) => setColPaymentMethod(e.target.value)}
                  placeholder={isRTL ? "تحويل بنكي، فودافون كاش، إنستاباي، نقدي" : "Cash, Wire, Wallet"}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "رقم السند / العملية:" : "Receipt / Ref #:"}</label>
              <Input
                value={colReceiptNumber}
                onChange={(e) => setColReceiptNumber(e.target.value)}
                placeholder={isRTL ? "اختياري (e.g. REC-2026-001)" : "Optional ref #"}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "ملاحظات وتفاصيل:" : "Notes:"}</label>
              <Input
                value={colNotes}
                onChange={(e) => setColNotes(e.target.value)}
                placeholder={isRTL ? "دفعة تحت الحساب، تسوية شحنات، إلخ" : "Notes..."}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="h-10 text-xs rounded-xl">
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isRTL ? "حفظ سند التحصيل" : "Save Collection"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm rounded-3xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-black text-gray-900">
            {isRTL ? "تأكيد حذف سند التحصيل" : "Confirm Delete"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {isRTL
              ? `هل أنت متأكد من حذف سند التحصيل بمبلغ ${deleteTarget?.amount} ${deleteTarget?.currency} للعميل ${deleteTarget?.clientName}؟`
              : `Delete collection ${deleteTarget?.receiptNumber}?`}
          </DialogDescription>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="h-10 rounded-xl">
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (deleteTarget) {
                  onDeleteCollection(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 rounded-xl cursor-pointer"
            >
              {isRTL ? "حذف نهائي" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
