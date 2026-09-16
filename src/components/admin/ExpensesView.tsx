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
  Package,
  Users,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  BusinessExpense,
  SalaryPayment,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
  MASTER_EXPENSE_ITEMS,
  MASTER_EXTRA_EXPENSES,
  MASTER_CLIENT_ACCOUNTS,
} from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface ExpensesViewProps {
  expenses: BusinessExpense[];
  salaries: SalaryPayment[];
  onAddExpense: (expense: BusinessExpense) => void;
  onDeleteExpense: (id: string) => void;
  onAddSalary?: (salary: SalaryPayment) => void;
  onDeleteSalary?: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  salaries,
  onAddExpense,
  onDeleteExpense,
  onAddSalary,
  onDeleteSalary,
}) => {
  const { isRTL, formatCurrency } = useLanguage();

  // Active Tab: All Expenses vs Shipment Extra Expenses vs Salaries
  const [activeTab, setActiveTab] = useState<"all_expenses" | "shipment_extra" | "salaries">("all_expenses");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>("all");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");

  // Modal State
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);

  // Form State: Add Expense
  const [expenseNature, setExpenseNature] = useState<"general" | "shipment_extra">("general");
  const [expenseItem, setExpenseItem] = useState<string>(MASTER_EXPENSE_ITEMS[0]);
  const [customExpenseTitle, setCustomExpenseTitle] = useState("");
  const [extraExpenseType, setExtraExpenseType] = useState<string>(MASTER_EXTRA_EXPENSES[0]);
  const [linkedAwb, setLinkedAwb] = useState("");
  const [allocatedClient, setAllocatedClient] = useState<string>(MASTER_CLIENT_ACCOUNTS[0] || "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const [payingAccount, setPayingAccount] = useState<string>(MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account");
  const [recorder, setRecorder] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("نقدي (كاش)");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Summary KPIs
  const summary = useMemo(() => {
    let generalExpensesSum = 0;
    let shipmentExtraSum = 0;

    expenses.forEach((e) => {
      const inEgp = e.currency === "USD" ? e.amount * 50 : e.amount;
      if (e.expenseNature === "shipment_extra") {
        shipmentExtraSum += inEgp;
      } else {
        generalExpensesSum += inEgp;
      }
    });

    const salariesSum = salaries.reduce((acc, s) => acc + (s.amount || 0), 0);
    const grandTotal = generalExpensesSum + shipmentExtraSum + salariesSum;

    return {
      generalExpensesSum,
      shipmentExtraSum,
      salariesSum,
      grandTotal,
      expensesCount: expenses.length,
      salariesCount: salaries.length,
    };
  }, [expenses, salaries]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (activeTab === "shipment_extra" && e.expenseNature !== "shipment_extra") {
        return false;
      }

      const matchesSearch =
        searchQuery === "" ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.linkedAwb && e.linkedAwb.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.allocatedClient && e.allocatedClient.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.receiptNumber && e.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesVault =
        selectedVaultFilter === "all" ||
        (e.payingAccount && e.payingAccount.toLowerCase() === selectedVaultFilter.toLowerCase());

      const matchesAgent =
        selectedAgentFilter === "all" ||
        (e.recorder && e.recorder.toLowerCase() === selectedAgentFilter.toLowerCase());

      return matchesSearch && matchesVault && matchesAgent;
    });
  }, [expenses, activeTab, searchQuery, selectedVaultFilter, selectedAgentFilter]);

  // Filtered Salaries
  const filteredSalaries = useMemo(() => {
    return salaries.filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.period && s.period.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesVault =
        selectedVaultFilter === "all" ||
        (s.payingAccount && s.payingAccount.toLowerCase() === selectedVaultFilter.toLowerCase());

      const matchesAgent =
        selectedAgentFilter === "all" ||
        (s.recordedBy && s.recordedBy.toLowerCase() === selectedAgentFilter.toLowerCase());

      return matchesSearch && matchesVault && matchesAgent;
    });
  }, [salaries, searchQuery, selectedVaultFilter, selectedAgentFilter]);

  // Handle Add Expense Submit
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    let finalTitle = "";
    let finalCategory: BusinessExpense["category"] = "Operational & Logistics";

    if (expenseNature === "general") {
      finalTitle =
        expenseItem === "أخرى" && customExpenseTitle.trim()
          ? customExpenseTitle.trim()
          : customExpenseTitle.trim() || expenseItem;
    } else {
      finalTitle = `${extraExpenseType}${linkedAwb ? ` - بوليصة ${linkedAwb}` : ""}`;
      finalCategory = "Customs & Port Demurrage";
    }

    if (!finalTitle.trim()) return;

    const newExp: BusinessExpense = {
      id: `exp-${Date.now()}`,
      title: finalTitle,
      category: finalCategory,
      amount: amountNum,
      currency: currency,
      date: paymentDate || new Date().toISOString().split("T")[0],
      notes: notes.trim() || undefined,
      receiptNumber: receiptNumber.trim() || undefined,
      payingAccount: payingAccount,
      recorder: recorder,
      paymentMethod: paymentMethod,
      allocatedClient: expenseNature === "shipment_extra" ? allocatedClient : undefined,
      linkedAwb: expenseNature === "shipment_extra" && linkedAwb ? linkedAwb : undefined,
      expenseNature: expenseNature,
    };

    onAddExpense(newExp);
    setAmount("");
    setReceiptNumber("");
    setNotes("");
    setCustomExpenseTitle("");
    setLinkedAwb("");
    setAddExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <WalletCards className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {isRTL ? "سجل المصروفات العامة والمرتبات" : "Expenses & Payroll Ledger"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {isRTL
                  ? "تسجيل مصروفات التشغيل، مصروفات الشحنات الإضافية، ومرتبات وسلف العاملين"
                  : "Track general operating expenses, shipment linehaul extras, and staff payroll"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setAddExpenseModalOpen(true)}
            className="bg-[#C45B2A] hover:bg-[#A3481D] text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{isRTL ? "تسجيل مصروف جديد" : "Record Expense"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "المصروفات العامة" : "General Operating Exp."}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {formatCurrency(summary.generalExpensesSum, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isRTL ? "إيجارات، بوفيه، كهرباء، صيانة، وأدوات" : "Rent, utilities, packaging, maintenance"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "مصروفات شحنات إضافية" : "Shipment Extra Costs"}
                </p>
                <h3 className="text-2xl font-black text-amber-600 mt-1 font-mono">
                  {formatCurrency(summary.shipmentExtraSum, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isRTL ? "جمارك، أرضيات، ونقل مرتبط ببوالص" : "Customs, storage & transport linked to AWBs"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "المرتبات والسلف" : "Payroll & Advances"}
                </p>
                <h3 className="text-2xl font-black text-purple-600 mt-1 font-mono">
                  {formatCurrency(summary.salariesSum, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {summary.salariesCount} {isRTL ? "سندات صرف مرتبات وسلف" : "payroll disbursements"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "إجمالي المنصرف الكلي" : "Total Outflow Sum"}
                </p>
                <h3 className="text-2xl font-black text-rose-600 mt-1 font-mono">
                  {formatCurrency(summary.grandTotal, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isRTL ? "خصمًا من الخزائن والعهد المحددة" : "Disbursed from designated vaults"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <WalletCards className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filter Bar */}
      <Card className="border border-slate-200/80 shadow-2xs bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Tab Buttons */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("all_expenses")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all_expenses"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isRTL ? "كافة المصروفات العامة" : "All Expenses"} ({expenses.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shipment_extra")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "shipment_extra"
                    ? "bg-white text-[#C45B2A] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isRTL ? "مصروفات شحنات (جمارك ونقل)" : "Shipment Extras"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("salaries")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "salaries"
                    ? "bg-white text-purple-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isRTL ? "المرتبات والسلف" : "Payroll & Advances"} ({salaries.length})
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 ${isRTL ? "right-2.5" : "left-2.5"}`} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? "بحث في البنود..." : "Search..."}
                  className={`${isRTL ? "pr-8 text-right" : "pl-8 text-left"} h-8 text-xs bg-[#FAF8F5] border-slate-300 w-44`}
                />
              </div>

              {/* Vault Filter */}
              <select
                value={selectedVaultFilter}
                onChange={(e) => setSelectedVaultFilter(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
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
                className="h-8 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
              >
                <option value="all">{isRTL ? "جميع المسؤولين" : "All Recorders"}</option>
                {MASTER_AGENTS.map((ag) => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Ledger Table */}
      <Card className="border border-slate-200/80 shadow-2xs bg-white overflow-hidden">
        {activeTab !== "salaries" ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FAF8F5]">
                <TableRow>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "التاريخ" : "Date"}</TableHead>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "بند المصروف" : "Item Title"}</TableHead>
                  <TableHead className="text-center text-xs font-extrabold text-slate-700">{isRTL ? "طبيعة المصروف" : "Nature"}</TableHead>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "الخزينة المخصوم منها" : "Vault"}</TableHead>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "المسؤول" : "Recorder"}</TableHead>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "رقم الفاتورة / الإشعار" : "Receipt"}</TableHead>
                  <TableHead className="text-center text-xs font-extrabold text-slate-700">{isRTL ? "المبلغ" : "Amount"}</TableHead>
                  <TableHead className="text-center text-xs font-extrabold text-slate-700">{isRTL ? "إجراء" : "Action"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <WalletCards className="h-6 w-6 text-slate-300" />
                        <p className="text-xs font-semibold">
                          {isRTL ? "لا توجد مصروفات مسجلة تطابق التحديد" : "No expense records found"}
                        </p>
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
                        <div>{e.title}</div>
                        {e.linkedAwb && (
                          <div className="text-[11px] text-amber-700 font-mono font-semibold mt-0.5">
                            {isRTL ? "بوليصة:" : "AWB:"} {e.linkedAwb}
                          </div>
                        )}
                        {e.allocatedClient && (
                          <div className="text-[10px] text-slate-400">
                            {isRTL ? "العميل:" : "Client:"} {e.allocatedClient}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            e.expenseNature === "shipment_extra"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {e.expenseNature === "shipment_extra"
                            ? isRTL ? "شحنة خاصة" : "Shipment Extra"
                            : isRTL ? "تشغيلي عام" : "General"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-800">
                        {e.payingAccount || "-"}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        {e.recorder || "-"}
                      </TableCell>

                      <TableCell className="text-xs font-mono text-slate-500">
                        {e.receiptNumber || "-"}
                      </TableCell>

                      <TableCell className="text-end font-mono font-bold text-xs text-rose-600">
                        {formatCurrency(e.amount, e.currency || "EGP")}
                      </TableCell>

                      <TableCell className="text-center py-2.5">
                        <div className="flex items-center justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(isRTL ? "حذف هذا المصروف؟" : "Delete expense?")) {
                                onDeleteExpense(e.id);
                              }
                            }}
                            className="h-10 w-10 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={isRTL ? "حذف المصروف" : "Delete expense"}
                            aria-label={isRTL ? "حذف المصروف" : "Delete expense"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FAF8F5]">
                <TableRow>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "التاريخ" : "Date"}</TableHead>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "اسم الموظف" : "Employee"}</TableHead>
                  <TableHead className="text-center text-xs font-extrabold text-slate-700">{isRTL ? "نوع الصرف" : "Type"}</TableHead>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "عن شهر" : "Period"}</TableHead>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "الخزينة المخصوم منها" : "Vault"}</TableHead>
                  <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "المسؤول" : "Recorder"}</TableHead>
                  <TableHead className="text-end text-xs font-extrabold text-slate-700">{isRTL ? "المبلغ" : "Amount"}</TableHead>
                  <TableHead className="text-center text-xs font-extrabold text-slate-700">{isRTL ? "إجراء" : "Action"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Briefcase className="h-6 w-6 text-slate-300" />
                        <p className="text-xs font-semibold">
                          {isRTL ? "لا توجد مرتبات مسجلة تطابق التحديد" : "No salary records found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSalaries.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-xs font-mono text-slate-600">
                        {s.date}
                      </TableCell>

                      <TableCell className="text-xs font-bold text-slate-900">
                        {s.employeeName}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            s.type === "salary"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {s.type === "salary" ? (isRTL ? "مرتب" : "Salary") : (isRTL ? "سلفة" : "Advance")}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-700">
                        {s.period || "-"}
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-800">
                        {s.payingAccount}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        {s.recordedBy || "-"}
                      </TableCell>

                      <TableCell className="text-end font-mono font-bold text-xs text-rose-600">
                        {formatCurrency(s.amount, s.currency || "EGP")}
                      </TableCell>

                      <TableCell className="text-center py-2.5">
                        {onDeleteSalary && (
                          <div className="flex items-center justify-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(isRTL ? "حذف هذا المرتب/السلفة؟" : "Delete salary?")) {
                                  onDeleteSalary(s.id);
                                }
                              }}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={isRTL ? "حذف السجل" : "Delete record"}
                              aria-label={isRTL ? "حذف السجل" : "Delete record"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add Expense Modal */}
      <Dialog open={addExpenseModalOpen} onOpenChange={setAddExpenseModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 text-[#C45B2A]">
                <Plus className="h-4 w-4" />
              </div>
              <span>{isRTL ? "تسجيل مصروف جديد" : "Record New Expense"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isRTL
                ? "توثيق مصروف عام أو تكلفة شحنة إضافية وخصمها من الخزينة المحددة"
                : "Record operational expense or shipment extra and disburse from vault"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitExpense} className="space-y-4 pt-2">
            {/* Nature Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "طبيعة المصروف *" : "Expense Nature *"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExpenseNature("general")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    expenseNature === "general"
                      ? "bg-[#C45B2A] text-white border-[#C45B2A] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isRTL ? "مصروف تشغيلي عام" : "General Operating"}
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseNature("shipment_extra")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    expenseNature === "shipment_extra"
                      ? "bg-[#C45B2A] text-white border-[#C45B2A] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isRTL ? "مصروف شحنة إضافي (AWB)" : "Shipment Extra (AWB)"}
                </button>
              </div>
            </div>

            {expenseNature === "general" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isRTL ? "بند المصروف الرئيسي *" : "Expense Item *"}
                  </label>
                  <select
                    value={expenseItem}
                    onChange={(e) => setExpenseItem(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
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
                    {isRTL ? "تخصيص الوصف / البيان" : "Custom Title"}
                  </label>
                  <Input
                    type="text"
                    value={customExpenseTitle}
                    onChange={(e) => setCustomExpenseTitle(e.target.value)}
                    placeholder={isRTL ? "فاتورة كهرباء، كرتونة شحن..." : "Custom title..."}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900">
                      {isRTL ? "نوع المصروف الإضافي *" : "Extra Type *"}
                    </label>
                    <select
                      value={extraExpenseType}
                      onChange={(e) => setExtraExpenseType(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-amber-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                    >
                      {MASTER_EXTRA_EXPENSES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900">
                      {isRTL ? "رقم البوليصة المرتبطة (AWB)" : "Linked AWB"}
                    </label>
                    <Input
                      type="text"
                      value={linkedAwb}
                      onChange={(e) => setLinkedAwb(e.target.value)}
                      placeholder="e.g. 7466913646"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-900">
                    {isRTL ? "تحميل على حساب العميل" : "Charge to Client Account"}
                  </label>
                  <select
                    value={allocatedClient}
                    onChange={(e) => setAllocatedClient(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-amber-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
                  >
                    {MASTER_CLIENT_ACCOUNTS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "العملة" : "Currency"}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "EGP" | "USD")}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
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
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "تاريخ الصرف" : "Date"}
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "رقم الفاتورة / الإيصال" : "Receipt No"}
                </label>
                <Input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="INV-0091"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "ملاحظات إضافية" : "Notes"}
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRTL ? "تفاصيل إضافية..." : "Notes..."}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddExpenseModalOpen(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                className="bg-[#C45B2A] hover:bg-[#A3481D] text-white text-xs font-bold cursor-pointer"
              >
                {isRTL ? "حفظ وخصم من الخزينة" : "Save & Disburse"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
