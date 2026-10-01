"use client";

import React, { useState, useMemo } from "react";
import {
  Tags,
  Plus,
  Search,
  Filter,
  Calendar,
  Package,
  User,
  CreditCard,
  Receipt,
  Trash2,
  AlertCircle,
  Wallet,
  Landmark,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Link as LinkIcon,
  CheckCircle2,
  RefreshCw,
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
  Shipment,
  Customer,
  BusinessExpense,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
  MASTER_EXTRA_EXPENSES,
} from "@/lib/adminData";

interface ExtraExpensesViewProps {
  expenses: BusinessExpense[];
  shipments: Shipment[];
  customers?: Customer[];
  onAddExpense: (expense: BusinessExpense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExtraExpensesView: React.FC<ExtraExpensesViewProps> = ({
  expenses = [],
  shipments = [],
  customers = [],
  onAddExpense,
  onDeleteExpense,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  // Modal State: Add Extra Expense
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedAwb, setSelectedAwb] = useState<string>("");
  const [customAwb, setCustomAwb] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [expType, setExpType] = useState<string>(MASTER_EXTRA_EXPENSES[0] || "مصاريف نقل (Trans)");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const [payingAccount, setPayingAccount] = useState<string>(
    MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account"
  );
  const [recorder, setRecorder] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Modal State: Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<BusinessExpense | null>(null);

  // Filter expenses that are shipment extra surcharges
  const extraExpensesList = useMemo(() => {
    return expenses.filter(
      (e) =>
        e.expenseNature === "shipment_extra" ||
        Boolean(e.linkedAwb) ||
        e.category === "Customs & Port Demurrage" ||
        e.title?.includes("AWB") ||
        e.title?.includes("بوليصة")
    );
  }, [expenses]);

  // Handle AWB dropdown selection
  const handleSelectAwb = (awbVal: string) => {
    setSelectedAwb(awbVal);
    if (!awbVal) return;
    const foundShipment = shipments.find((s) => s.awb === awbVal || s.id === awbVal);
    if (foundShipment) {
      setCustomAwb(foundShipment.awb);
      setClientName(foundShipment.account || foundShipment.company || foundShipment.senderName || "");
    }
  };

  // Submit Extra Expense
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert(isRTL ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Please enter a valid amount");
      return;
    }

    const finalAwb = customAwb.trim() || selectedAwb.trim();
    if (!finalAwb) {
      alert(isRTL ? "يرجى إدخال أو اختيار رقم البوليصة (AWB)" : "Please enter or select AWB number");
      return;
    }

    setSubmitting(true);
    try {
      const newExp: BusinessExpense = {
        id: `exp-extra-${Date.now()}`,
        title: `${expType} - بوليصة ${finalAwb}`,
        category: "Customs & Port Demurrage",
        expenseNature: "shipment_extra",
        linkedAwb: finalAwb,
        allocatedClient: clientName.trim() || undefined,
        amount: parsedAmount,
        currency,
        date,
        payingAccount,
        recorder,
        notes: notes.trim() || `${expType} للشحنة ${finalAwb}`,
      };

      onAddExpense(newExp);
      setAddModalOpen(false);

      // Reset form
      setSelectedAwb("");
      setCustomAwb("");
      setClientName("");
      setAmount("");
      setNotes("");
    } catch (err) {
      console.error("Failed to add extra expense:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    let totalEgp = 0;
    const awbSet = new Set<string>();
    const nowStr = new Date().toISOString().slice(0, 7);
    let currentMonthEgp = 0;

    extraExpensesList.forEach((e) => {
      const inEgp = e.currency === "USD" ? (e.amount || 0) * 50 : e.amount || 0;
      totalEgp += inEgp;
      if (e.linkedAwb) awbSet.add(e.linkedAwb);
      if (e.date?.startsWith(nowStr)) {
        currentMonthEgp += inEgp;
      }
    });

    return {
      totalEgp,
      uniqueAwbs: awbSet.size,
      count: extraExpensesList.length,
      currentMonthEgp,
    };
  }, [extraExpensesList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return extraExpensesList.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        e.linkedAwb?.toLowerCase().includes(q) ||
        e.allocatedClient?.toLowerCase().includes(q) ||
        e.title?.toLowerCase().includes(q) ||
        e.payingAccount?.toLowerCase().includes(q) ||
        e.recorder?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q);

      const matchesVault = selectedVaultFilter === "all" || e.payingAccount === selectedVaultFilter;
      const matchesType = selectedTypeFilter === "all" || e.title?.includes(selectedTypeFilter);

      return matchesSearch && matchesVault && matchesType;
    });
  }, [extraExpensesList, searchQuery, selectedVaultFilter, selectedTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#251516] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs">
              <Tags className="w-5 h-5" />
            </div>
            <span>{isRTL ? "مصاريف الشحنات الإضافية (إضافي شحنة)" : "Shipment Extra Surcharges (AWB)"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isRTL
              ? "تسجيل المصاريف الإضافية المرتبطة ببوالص الشحن (نقل داخلي، أرضيات جمارك، تغليف) وتحميلها لحساب العميل"
              : "Record extra fees linked to AWBs (transport, customs demurrage, repacking) charged to clients"}
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? "تسجيل إضافي شحنة جديد" : "Record Extra Expense"}</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "إجمالي المصاريف الإضافية" : "Total Extra Fees"}</p>
              <p className="text-xl sm:text-2xl font-black text-amber-800">{formatCurrency(kpis.totalEgp, "EGP")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Tags className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "مصاريف الشهر الحالي" : "This Month"}</p>
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
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "بوالص محمل عليها مصاريف" : "Linked AWBs"}</p>
              <p className="text-2xl font-black text-gray-900">{kpis.uniqueAwbs}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "عدد القيود" : "Records Count"}</p>
              <p className="text-2xl font-black text-gray-900">{kpis.count}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Receipt className="w-5 h-5" />
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
                placeholder={isRTL ? "بحث برقم البوليصة AWB، اسم العميل، الحساب، أو الملاحظات..." : "Search AWB, customer, notes..."}
                className={`h-10 rounded-xl bg-gray-50/60 border-gray-200 text-xs sm:text-sm ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedVaultFilter}
                onChange={(e) => setSelectedVaultFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل الخزائن والحسابات" : "All Vaults"}</option>
                {MASTER_FINANCIAL_ACCOUNTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل بنود الإضافي" : "All Surcharge Types"}</option>
                {MASTER_EXTRA_EXPENSES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extra Expenses Table */}
      <Card className="rounded-2xl border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/90 border-b border-gray-200">
              <TableRow>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "التاريخ" : "Date"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "رقم البوليصة (AWB)" : "AWB Number"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "العميل المحمل عليه" : "Customer"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "بند المصروف" : "Expense Type"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المبلغ" : "Amount"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المدفوع من حساب" : "Paid From Vault"}
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
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Tags className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{isRTL ? "لا توجد مصاريف إضافية مسجلة" : "No extra expenses found"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isRTL ? "اضغط على زر تسجيل إضافي شحنة لربط مصروف ببوليصة" : "Click Record Extra Expense to link a surcharge"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((e) => (
                  <TableRow key={e.id} className="hover:bg-amber-50/20 transition-colors">
                    <TableCell className="text-xs text-gray-700 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{e.date}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-900">
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                          {e.linkedAwb || "AWB-N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">
                        {e.allocatedClient || "—"}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-gray-700">
                      <div className="font-semibold text-gray-900">{e.title}</div>
                      {e.notes && <div className="text-[11px] text-gray-500 truncate mt-0.5">{e.notes}</div>}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-black text-amber-800 font-mono">
                        {formatCurrency(e.amount, e.currency || "EGP")}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                        <Landmark className="w-3 h-3 text-amber-600" />
                        <span>{e.payingAccount || "CIB account"}</span>
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {e.recorder || "مصطفي"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(e)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                        title={isRTL ? "حذف المصروف" : "Delete Expense"}
                        aria-label={isRTL ? "حذف المصروف" : "Delete Expense"}
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

      {/* Modal: Add Extra Expense */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Tags className="w-4 h-4" />
              </div>
              <span>{isRTL ? "تسجيل مصروف إضافي مرتبط ببوليصة شحن" : "Record Shipment Extra Expense"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isRTL
                ? "يتم ربط المصروف برقم البوليصة وتحميله لحساب العميل وخصم قيمته من الخزينة"
                : "Attach extra fees to AWB to reflect on customer statement and deduct from vault"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs py-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "تاريخ العملية:" : "Date:"}</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-9 text-xs" />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "اسم المسجل:" : "Agent:"}</label>
                <select
                  value={recorder}
                  onChange={(e) => setRecorder(e.target.value)}
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

            {/* AWB Selection or Manual Entry */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isRTL ? "رقم البوليصة (AWB) - اختر أو اكتب بوليصة جديدة:" : "AWB Number (Select or Type New):"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedAwb}
                  onChange={(e) => handleSelectAwb(e.target.value)}
                  className="w-full h-9 px-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium outline-none"
                >
                  <option value="">{isRTL ? "-- اختر من بوالص الشحنات --" : "-- Select Existing AWB --"}</option>
                  {shipments.slice(0, 100).map((s) => (
                    <option key={s.id} value={s.awb}>
                      {s.awb} ({s.account || s.company || s.senderName || "شحنة"})
                    </option>
                  ))}
                </select>
                <Input
                  value={customAwb}
                  onChange={(e) => {
                    setCustomAwb(e.target.value);
                    if (e.target.value) setSelectedAwb("");
                  }}
                  placeholder={isRTL ? "أو اكتب رقم بوليصة جديدة" : "Or type new AWB #"}
                  required={!selectedAwb}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isRTL ? "اسم العميل المحمل عليه المصروف:" : "Client Name (To Charge):"}
              </label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={isRTL ? "اسم العميل / الشركة" : "Customer Name"}
                className="h-9 text-xs"
              />
            </div>

            {/* Expense Type */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "طبيعة / بند المصروف:" : "Surcharge Type:"}</label>
              <select
                value={expType}
                onChange={(e) => setExpType(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none"
              >
                {MASTER_EXTRA_EXPENSES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "المبلغ:" : "Amount:"}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "العملة:" : "Currency:"}</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "EGP" | "USD")}
                  className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                >
                  <option value="EGP">EGP (جنيه مصري)</option>
                  <option value="USD">USD (دولار)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "المدفوع من حساب (الخزينة):" : "Paid From Account:"}</label>
              <select
                value={payingAccount}
                onChange={(e) => setPayingAccount(e.target.value)}
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
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "ملاحظات وتفاصيل:" : "Notes:"}</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRTL ? "سبب المصروف الإضافي، تفاصيل المشوار، إلخ" : "Details..."}
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
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isRTL ? "حفظ المصروف الإضافي" : "Save Extra Expense"}</span>
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
            {isRTL ? "تأكيد حذف المصروف الإضافي" : "Confirm Delete"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {isRTL
              ? `هل أنت متأكد من حذف المصروف بمبلغ ${deleteTarget?.amount} ${deleteTarget?.currency} للبوليصة ${deleteTarget?.linkedAwb}؟`
              : `Delete expense for ${deleteTarget?.linkedAwb}?`}
          </DialogDescription>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="h-10 rounded-xl">
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (deleteTarget) {
                  onDeleteExpense(deleteTarget.id);
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
