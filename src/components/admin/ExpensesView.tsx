"use client";

import React, { useState, useMemo } from "react";
import {
  WalletCards,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  CreditCard,
  Building2,
  Receipt,
  Tag,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  RefreshCw,
  X,
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
import {
  BusinessExpense,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
  MASTER_EXPENSE_ITEMS,
} from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface ExpensesViewProps {
  expenses: BusinessExpense[];
  onAddExpense: (expense: BusinessExpense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses = [],
  onAddExpense,
  onDeleteExpense,
}) => {
  const { isRTL, formatCurrency } = useLanguage();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>("all");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>("all");

  // Modal State: Add Expense
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [expenseItem, setExpenseItem] = useState<string>(MASTER_EXPENSE_ITEMS[0] || "ايجار");
  const [customExpenseTitle, setCustomExpenseTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const [payingAccount, setPayingAccount] = useState<string>(
    MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account"
  );
  const [recorder, setRecorder] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("نقدي (كاش)");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal State: Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<BusinessExpense | null>(null);

  // General Expenses Only (exclude shipment extra expenses linked to AWBs)
  const generalExpenses = useMemo(() => {
    return expenses.filter(
      (e) =>
        e.expenseNature !== "shipment_extra" &&
        !e.linkedAwb &&
        e.category !== "Customs & Port Demurrage"
    );
  }, [expenses]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return generalExpenses.filter((e) => {
      const matchesSearch =
        !q ||
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.receiptNumber && e.receiptNumber.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q)) ||
        (e.payingAccount && e.payingAccount.toLowerCase().includes(q)) ||
        (e.recorder && e.recorder.toLowerCase().includes(q)) ||
        (e.paymentMethod && e.paymentMethod.toLowerCase().includes(q)) ||
        (e.date && e.date.toLowerCase().includes(q)) ||
        e.amount.toString().includes(q);

      const matchesVault =
        selectedVaultFilter === "all" ||
        (e.payingAccount && e.payingAccount.toLowerCase() === selectedVaultFilter.toLowerCase());

      const matchesAgent =
        selectedAgentFilter === "all" ||
        (e.recorder && e.recorder.toLowerCase() === selectedAgentFilter.toLowerCase());

      const matchesItem =
        selectedItemFilter === "all" ||
        (e.title && e.title.includes(selectedItemFilter));

      return matchesSearch && matchesVault && matchesAgent && matchesItem;
    });
  }, [generalExpenses, searchQuery, selectedVaultFilter, selectedAgentFilter, selectedItemFilter]);

  const isFilterActive =
    searchQuery.trim() !== "" ||
    selectedVaultFilter !== "all" ||
    selectedAgentFilter !== "all" ||
    selectedItemFilter !== "all";

  // Summary KPIs
  const summary = useMemo(() => {
    let totalEgp = 0;
    let totalUsd = 0;

    generalExpenses.forEach((e) => {
      if (e.currency === "USD") {
        totalUsd += e.amount;
        totalEgp += e.amount * 50;
      } else {
        totalEgp += e.amount;
      }
    });

    const count = generalExpenses.length;
    const avg = count > 0 ? totalEgp / count : 0;

    return {
      totalEgp,
      totalUsd,
      count,
      avg,
    };
  }, [generalExpenses]);

  // Handle Add Expense Submit
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert(isRTL ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Please enter a valid amount");
      return;
    }

    const finalTitle =
      expenseItem === "أخرى" && customExpenseTitle.trim()
        ? customExpenseTitle.trim()
        : customExpenseTitle.trim()
        ? `${expenseItem} - ${customExpenseTitle.trim()}`
        : expenseItem;

    if (!finalTitle.trim()) {
      alert(isRTL ? "يرجى إدخال وصف المصروف" : "Please enter expense description");
      return;
    }

    setSubmitting(true);
    try {
      const newExp: BusinessExpense = {
        id: `exp-${Date.now()}`,
        title: finalTitle,
        category: "Operational & Logistics",
        amount: amountNum,
        currency: currency,
        date: paymentDate || new Date().toISOString().split("T")[0],
        notes: notes.trim() || undefined,
        receiptNumber: receiptNumber.trim() || undefined,
        payingAccount: payingAccount,
        recorder: recorder,
        paymentMethod: paymentMethod,
        expenseNature: "general",
      };

      onAddExpense(newExp);
      setAmount("");
      setReceiptNumber("");
      setNotes("");
      setCustomExpenseTitle("");
      setAddExpenseModalOpen(false);
    } catch (err) {
      console.error("Failed to add expense:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      isRTL ? "التاريخ" : "Date",
      isRTL ? "البند والبيان" : "Item Title",
      isRTL ? "الخزينة" : "Paying Vault",
      isRTL ? "المسؤول" : "Recorder",
      isRTL ? "المبلغ" : "Amount",
      isRTL ? "العملة" : "Currency",
      isRTL ? "رقم الفاتورة" : "Receipt No",
      isRTL ? "طريقة الدفع" : "Payment Method",
      isRTL ? "ملاحظات" : "Notes",
    ];

    const rows = filteredExpenses.map((e) => [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.payingAccount || ""}"`,
      `"${e.recorder || ""}"`,
      e.amount,
      e.currency || "EGP",
      `"${e.receiptNumber || ""}"`,
      `"${e.paymentMethod || ""}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `general_expenses_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-[#C45B2A] border border-amber-500/20 shadow-2xs">
              <WalletCards className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{isRTL ? "سجل المصروفات العامة والتشغيلية" : "General Operating Expenses"}</span>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-[#C45B2A] border-amber-200">
                  {generalExpenses.length} {isRTL ? "سند صرف" : "Vouchers"}
                </Badge>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {isRTL
                  ? "تسجيل ومتابعة مصروفات الشركة العامة (إيجارات، بنزين، بوفيه، مرافق، تسويق، صيانة) مخصومة من الخزائن المحددة"
                  : "Track general operational and facility expenses disbursed from company vaults"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCsv}
            className="flex items-center gap-2 text-xs font-bold border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs h-10 px-3.5 rounded-xl"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>{isRTL ? "تصدير كشف إكسيل" : "Export CSV"}</span>
          </Button>

          <Button
            type="button"
            onClick={() => setAddExpenseModalOpen(true)}
            className="bg-[#C45B2A] hover:bg-[#A3481D] text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer text-xs h-10 px-4 rounded-xl transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{isRTL ? "تسجيل مصروف جديد" : "Record Expense"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "إجمالي المصروفات العامة" : "Total Operating Outflow"}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {formatCurrency(summary.totalEgp, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {isRTL ? "شامل كافة البنود التشغيلية" : "Combined general disbursements"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 text-[#C45B2A]">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "عدد حركات الصرف" : "Disbursement Vouchers"}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {summary.count}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {isRTL ? "سندات مصروفات موثقة" : "Recorded expense vouchers"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "متوسط قيمة السند" : "Average Voucher Value"}
                </p>
                <h3 className="text-2xl font-black text-[#C45B2A] mt-1 font-mono">
                  {formatCurrency(summary.avg, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {isRTL ? "لكل حركة صرف منفذة" : "Per expense transaction"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "المصروفات بالدولار" : "USD Expenses"}
                </p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                  ${summary.totalUsd.toLocaleString()}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {isRTL ? "اشتراكات وخدمات أجنبية" : "Foreign subscriptions & tools"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border border-slate-200/90 shadow-2xs bg-white rounded-2xl">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search + Dropdowns Container */}
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[240px] sm:min-w-[280px] lg:max-w-md">
                <Search
                  className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none ${
                    isRTL ? "right-3.5" : "left-3.5"
                  }`}
                />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isRTL
                      ? "بحث في البنود، السند، الخزينة، المسؤول، أو الملاحظات..."
                      : "Search expense item, receipt, vault, recorder, notes..."
                  }
                  className={`h-10 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border-slate-200 focus:border-[#C45B2A] rounded-xl transition-all shadow-2xs ${
                    isRTL ? "pr-10 pl-9 text-right" : "pl-10 pr-9 text-left"
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer ${
                      isRTL ? "left-2.5" : "right-2.5"
                    }`}
                    title={isRTL ? "مسح البحث" : "Clear search"}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Item Category Filter */}
              <select
                value={selectedItemFilter}
                onChange={(e) => setSelectedItemFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:border-[#C45B2A] focus:ring-1 focus:ring-[#C45B2A] outline-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="all">{isRTL ? "جميع البنود" : "All Categories"}</option>
                {MASTER_EXPENSE_ITEMS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {/* Vault Filter */}
              <select
                value={selectedVaultFilter}
                onChange={(e) => setSelectedVaultFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:border-[#C45B2A] focus:ring-1 focus:ring-[#C45B2A] outline-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="all">{isRTL ? "جميع الخزائن" : "All Vaults"}</option>
                {MASTER_FINANCIAL_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>

              {/* Agent Filter */}
              <select
                value={selectedAgentFilter}
                onChange={(e) => setSelectedAgentFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-slate-300 focus:border-[#C45B2A] focus:ring-1 focus:ring-[#C45B2A] outline-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="all">{isRTL ? "جميع المسؤولين" : "All Recorders"}</option>
                {MASTER_AGENTS.map((ag) => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
              </select>

              {/* Reset Filters Button */}
              {isFilterActive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedItemFilter("all");
                    setSelectedVaultFilter("all");
                    setSelectedAgentFilter("all");
                  }}
                  className="h-10 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{isRTL ? "إعادة تعيين" : "Reset"}</span>
                </Button>
              )}
            </div>

            {/* Showing Counter Badge */}
            <div className="flex items-center justify-between lg:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <span className="text-xs text-slate-600 font-bold bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C45B2A]" />
                <span>{isRTL ? "المعروض:" : "Showing:"}</span>
                <span className="font-mono text-slate-900 font-black">
                  {filteredExpenses.length} / {generalExpenses.length}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FAF8F5]">
              <TableRow>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "التاريخ" : "Date"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "بند المصروف والبيان" : "Expense Item & Details"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "الخزينة المخصوم منها" : "Paying Vault"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "المسؤول" : "Recorder"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "رقم الفاتورة / الإيصال" : "Receipt No"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "طريقة الصرف" : "Method"}
                </TableHead>
                <TableHead className="text-end text-xs font-extrabold text-slate-700">
                  {isRTL ? "المبلغ" : "Amount"}
                </TableHead>
                <TableHead className="text-center text-xs font-extrabold text-slate-700">
                  {isRTL ? "إجراء" : "Action"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-44 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2.5 py-4">
                      <div className="p-3 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200/60">
                        <WalletCards className="h-7 w-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {isFilterActive
                          ? isRTL
                            ? "لم يتم العثور على أي مصروفات تطابق نتائج البحث أو الفلترة"
                            : "No expenses match your search or filter criteria"
                          : isRTL
                          ? "لا توجد مصروفات عامة مسجلة حتى الآن"
                          : "No expense records registered yet"}
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {isFilterActive
                          ? isRTL
                            ? "جرب كتابة كلمة بحث أخرى أو إعادة ضبط الفلاتر لعرض السجلات"
                            : "Try modifying your keywords or resetting filters"
                          : isRTL
                          ? "يمكنك تسجيل مصروف جديد بالضغط على زر تسجيل مصروف جديد بالأعلى"
                          : "You can record a new expense using the button above"}
                      </p>
                      {isFilterActive && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedItemFilter("all");
                            setSelectedVaultFilter("all");
                            setSelectedAgentFilter("all");
                          }}
                          className="mt-1 text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>{isRTL ? "مسح البحث والفلاتر" : "Clear Search & Filters"}</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="text-xs font-mono text-slate-600">
                      {e.date}
                    </TableCell>

                    <TableCell className="text-xs font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#C45B2A]" />
                        <span>{e.title}</span>
                      </div>
                      {e.notes && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {e.notes}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-slate-800">
                      <Badge variant="outline" className="text-[11px] font-mono bg-slate-50 text-slate-700 border-slate-200">
                        {e.payingAccount || "CIB account"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600 font-medium">
                      {e.recorder || "-"}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-slate-500">
                      {e.receiptNumber || "-"}
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {e.paymentMethod || isRTL ? "نقدي (كاش)" : "Cash"}
                    </TableCell>

                    <TableCell className="text-end font-mono font-bold text-xs text-rose-600">
                      {formatCurrency(e.amount, e.currency || "EGP")}
                    </TableCell>

                    <TableCell className="text-center py-2.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(e)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                        title={isRTL ? "حذف المصروف" : "Delete expense"}
                        aria-label={isRTL ? "حذف المصروف" : "Delete expense"}
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add Expense Modal */}
      <Dialog open={addExpenseModalOpen} onOpenChange={setAddExpenseModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-100 text-[#C45B2A]">
                <Plus className="h-4 w-4" />
              </div>
              <span>{isRTL ? "تسجيل مصروف عام جديد" : "Record General Operating Expense"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isRTL
                ? "توثيق مصروف تشغيلي وخصم قيمته تلقائيًا من الخزينة المحددة"
                : "Record operational expense and disburse from the selected vault"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitExpense} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "بند المصروف *" : "Expense Category *"}
                </label>
                <select
                  value={expenseItem}
                  onChange={(e) => setExpenseItem(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                >
                  {MASTER_EXPENSE_ITEMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "تخصيص البيان / التفاصيل" : "Custom Title / Detail"}
                </label>
                <Input
                  type="text"
                  value={customExpenseTitle}
                  onChange={(e) => setCustomExpenseTitle(e.target.value)}
                  placeholder={isRTL ? "فاتورة كهرباء، صيانة تكيفات..." : "Custom title..."}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "المبلغ *" : "Amount *"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-10 text-xs font-mono font-bold rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "العملة" : "Currency"}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "EGP" | "USD")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                >
                  <option value="EGP">EGP (جنيه مصري)</option>
                  <option value="USD">USD (دولار أمريكي)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "الخزينة المخصوم منها *" : "Paying Vault *"}
                </label>
                <select
                  value={payingAccount}
                  onChange={(e) => setPayingAccount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                >
                  {MASTER_FINANCIAL_ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "المسؤول عن الصرف *" : "Recorded By *"}
                </label>
                <select
                  value={recorder}
                  onChange={(e) => setRecorder(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "تاريخ الصرف" : "Date"}
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-10 text-xs font-mono rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "طريقة الصرف" : "Payment Method"}
                </label>
                <Input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder={isRTL ? "كاش، تحويل بنكي، فودافون كاش..." : "Cash, transfer..."}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "رقم الفاتورة / الإيصال" : "Receipt / Invoice No"}
              </label>
              <Input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="INV-0091"
                className="h-10 text-xs font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "ملاحظات إضافية" : "Notes"}
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRTL ? "تفاصيل إضافية عن المصروف..." : "Additional notes..."}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddExpenseModalOpen(false)}
                className="text-xs font-semibold cursor-pointer rounded-xl h-10"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#C45B2A] hover:bg-[#A3481D] text-white text-xs font-bold cursor-pointer rounded-xl h-10 px-4"
              >
                {submitting ? (isRTL ? "جارٍ الحفظ..." : "Saving...") : isRTL ? "حفظ وخصم من الخزينة" : "Save & Disburse"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6 text-start">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>{isRTL ? "تأكيد حذف المصروف" : "Confirm Delete Expense"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 pt-2 leading-relaxed">
              {isRTL
                ? `هل أنت متأكد من حذف سند المصروف "${deleteTarget?.title}" بمبلغ ${deleteTarget?.amount} ${deleteTarget?.currency}؟`
                : `Are you sure you want to delete expense "${deleteTarget?.title}" for ${deleteTarget?.amount} ${deleteTarget?.currency}?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="text-xs font-bold rounded-xl h-9"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (deleteTarget) {
                  onDeleteExpense(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer"
            >
              {isRTL ? "نعم، حذف المصروف" : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
