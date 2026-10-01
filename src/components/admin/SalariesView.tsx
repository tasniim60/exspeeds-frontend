"use client";

import React, { useState, useMemo } from "react";
import {
  Banknote,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  Receipt,
  Trash2,
  AlertCircle,
  Wallet,
  Landmark,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
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
  SalaryPayment,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
} from "@/lib/adminData";

interface SalariesViewProps {
  salaries: SalaryPayment[];
  onAddSalary: (salary: SalaryPayment) => void;
  onDeleteSalary: (id: string) => void;
}

export const SalariesView: React.FC<SalariesViewProps> = ({
  salaries = [],
  onAddSalary,
  onDeleteSalary,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all");

  // Modal State: Record Salary
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [employeeName, setEmployeeName] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [customEmployeeName, setCustomEmployeeName] = useState<string>("");
  const [type, setType] = useState<"salary" | "advance" | "bonus" | "deduction">("salary");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const [payingAccount, setPayingAccount] = useState<string>(
    MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account"
  );
  const [period, setPeriod] = useState<string>(() => {
    try {
      return new Date().toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
    } catch {
      return "الشهر الحالي";
    }
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("تحويل بنكي / إنستاباي");
  const [recorder, setRecorder] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Modal State: Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<SalaryPayment | null>(null);

  // Submit Salary / Advance
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert(isRTL ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Please enter a valid amount");
      return;
    }

    const resolvedEmployee = customEmployeeName.trim() || employeeName.trim();
    if (!resolvedEmployee) {
      alert(isRTL ? "يرجى تحديد أو كتابة اسم الموظف / المستلم" : "Please enter employee name");
      return;
    }

    setSubmitting(true);
    try {
      const newSalary: SalaryPayment = {
        id: `sal-${Date.now()}`,
        employeeName: resolvedEmployee,
        type,
        amount: parsedAmount,
        currency,
        date,
        payingAccount,
        period: period.trim() || undefined,
        recordedBy: recorder,
        notes: notes.trim() || `${type === "salary" ? "مرتب" : "سلفة"} شهر ${period}`,
      };

      onAddSalary(newSalary);
      setAddModalOpen(false);

      // Reset form
      setAmount("");
      setNotes("");
      setCustomEmployeeName("");
    } catch (err) {
      console.error("Failed to add salary:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    let totalPayroll = 0;
    let totalAdvances = 0;
    const empSet = new Set<string>();
    const nowStr = new Date().toISOString().slice(0, 7);
    let thisMonthTotal = 0;

    salaries.forEach((s) => {
      const inEgp = s.currency === "USD" ? (s.amount || 0) * 50 : s.amount || 0;
      if (s.type === "advance") {
        totalAdvances += inEgp;
      } else {
        totalPayroll += inEgp;
      }

      if (s.employeeName) empSet.add(s.employeeName);
      if (s.date?.startsWith(nowStr)) {
        thisMonthTotal += inEgp;
      }
    });

    return {
      totalPayroll,
      totalAdvances,
      grandTotal: totalPayroll + totalAdvances,
      employeeCount: empSet.size,
      thisMonthTotal,
      count: salaries.length,
    };
  }, [salaries]);

  // Unique employee list for filters
  const uniqueEmployees = useMemo(() => {
    const list = Array.from(new Set([...MASTER_AGENTS, ...salaries.map((s) => s.employeeName)])).filter(Boolean);
    return list;
  }, [salaries]);

  // Filtered List
  const filteredList = useMemo(() => {
    return salaries.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        s.employeeName?.toLowerCase().includes(q) ||
        s.payingAccount?.toLowerCase().includes(q) ||
        s.period?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q) ||
        s.recordedBy?.toLowerCase().includes(q);

      const matchesVault = selectedVaultFilter === "all" || s.payingAccount === selectedVaultFilter;
      const matchesType = selectedTypeFilter === "all" || s.type === selectedTypeFilter;
      const matchesEmp = selectedEmployeeFilter === "all" || s.employeeName === selectedEmployeeFilter;

      return matchesSearch && matchesVault && matchesType && matchesEmp;
    });
  }, [salaries, searchQuery, selectedVaultFilter, selectedTypeFilter, selectedEmployeeFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#251516] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <span>{isRTL ? "المرتبات وسلف ومستحقات العاملين" : "Salaries & Staff Advances"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isRTL
              ? "تسجيل ومتابعة صرف المرتبات الشهرية والسلف والبدلات وخصمها من الخزينة تلقائياً"
              : "Track staff payroll, advances, and bonuses deducted directly from vaults"}
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? "تسجيل صرف مرتب / سلفة" : "Record Salary / Advance"}</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "إجمالي المنصرف" : "Total Payroll"}</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-700">{formatCurrency(kpis.grandTotal, "EGP")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Banknote className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "مرتبات الشهر الحالي" : "This Month"}</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{formatCurrency(kpis.thisMonthTotal, "EGP")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "سلف مسحوبة" : "Advances & Loans"}</p>
              <p className="text-2xl font-black text-amber-700">{formatCurrency(kpis.totalAdvances, "EGP")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Receipt className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "فريق العمل والمستلمين" : "Staff Count"}</p>
              <p className="text-2xl font-black text-gray-900">{kpis.employeeCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <UserCheck className="w-5 h-5" />
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
                placeholder={isRTL ? "بحث باسم الموظف، شهر المرتب، الحساب، أو البيان..." : "Search employee, period, notes..."}
                className={`h-10 rounded-xl bg-gray-50/60 border-gray-200 text-xs sm:text-sm ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل الموظفين" : "All Employees"}</option>
                {uniqueEmployees.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل الأنواع" : "All Types"}</option>
                <option value="salary">{isRTL ? "مرتب أساسي" : "Salary"}</option>
                <option value="advance">{isRTL ? "سلفة" : "Advance"}</option>
                <option value="bonus">{isRTL ? "مكافأة" : "Bonus"}</option>
                <option value="deduction">{isRTL ? "خصم" : "Deduction"}</option>
              </select>

              <select
                value={selectedVaultFilter}
                onChange={(e) => setSelectedVaultFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل الخزائن" : "All Vaults"}</option>
                {MASTER_FINANCIAL_ACCOUNTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salaries Table */}
      <Card className="rounded-2xl border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/90 border-b border-gray-200">
              <TableRow>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "التاريخ" : "Date"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "اسم الموظف / المستلم" : "Employee"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "نوع البند" : "Type"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المبلغ المصروف" : "Amount"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المنصرف من حساب" : "Paying Vault"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "شهر المرتب / البيان" : "Period & Notes"}
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
                      <Banknote className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{isRTL ? "لا توجد مسحوبات مرتبات مسجلة" : "No salary records found"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isRTL ? "اضغط على تسجيل صرف مرتب لإضافة قيد جديد" : "Click Record Salary to record payroll entry"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/20 transition-colors">
                    <TableCell className="text-xs text-gray-700 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{s.date}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{s.employeeName}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          s.type === "salary"
                            ? "success"
                            : s.type === "advance"
                            ? "warning"
                            : s.type === "bonus"
                            ? "brand"
                            : "secondary"
                        }
                        className="text-[11px]"
                      >
                        {s.type === "salary"
                          ? isRTL ? "مرتب أساسي" : "Salary"
                          : s.type === "advance"
                          ? isRTL ? "سلفة" : "Advance"
                          : s.type === "bonus"
                          ? isRTL ? "مكافأة" : "Bonus"
                          : isRTL ? "خصم" : "Deduction"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-black text-indigo-700 font-mono">
                        {formatCurrency(s.amount, s.currency || "EGP")}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                        <Landmark className="w-3 h-3 text-indigo-600" />
                        <span>{s.payingAccount}</span>
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-gray-700 max-w-[200px]">
                      {s.period && (
                        <span className="font-semibold text-gray-900 block">{s.period}</span>
                      )}
                      {s.notes && <span className="text-[11px] text-gray-500 truncate block mt-0.5">{s.notes}</span>}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {s.recordedBy || "مصطفي"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(s)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                        title={isRTL ? "حذف القيد" : "Delete Record"}
                        aria-label={isRTL ? "حذف القيد" : "Delete Record"}
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

      {/* Modal: Add Salary */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
              <span>{isRTL ? "تسجيل صرف مرتب أو سلفة للموظف" : "Record Salary or Staff Advance"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isRTL
                ? "يتم خصم المبلغ من رصيد الخزينة المحددة وتسجيله في كشف الرواتب"
                : "Deducts payment from selected vault and logs staff transaction"}
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

            {/* Employee Selection */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "الموظف / المستلم:" : "Employee Name:"}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={employeeName}
                  onChange={(e) => {
                    setEmployeeName(e.target.value);
                    if (e.target.value) setCustomEmployeeName("");
                  }}
                  className="w-full h-9 px-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold outline-none"
                >
                  {MASTER_AGENTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <Input
                  value={customEmployeeName}
                  onChange={(e) => {
                    setCustomEmployeeName(e.target.value);
                    if (e.target.value) setEmployeeName("");
                  }}
                  placeholder={isRTL ? "أو اسم موظف آخر" : "Or other employee name"}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "المبلغ المصروف:" : "Amount:"}</label>
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
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "نوع البند:" : "Category:"}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                >
                  <option value="salary">{isRTL ? "مرتب أساسي" : "Salary"}</option>
                  <option value="advance">{isRTL ? "سلفة نقدية" : "Advance"}</option>
                  <option value="bonus">{isRTL ? "مكافأة وحافز" : "Bonus"}</option>
                  <option value="deduction">{isRTL ? "خصم وجزاء" : "Deduction"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "من حساب (الخزينة):" : "Paid From Account:"}</label>
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
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "طريقة التحويل:" : "Payment Method:"}</label>
                <Input
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder={isRTL ? "تحويل بنكي، فودافون كاش، إنستاباي، نقدي" : "Wire, Cash, Wallet"}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "شهر المرتب:" : "Payroll Month:"}</label>
                <Input
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder={isRTL ? "مثال: أغسطس 2026" : "e.g. August 2026"}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "ملاحظات وبيان:" : "Notes:"}</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isRTL ? "تفاصيل إضافية..." : "Notes..."}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="h-10 text-xs rounded-xl">
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isRTL ? "حفظ صرف المرتب" : "Save Salary Payment"}</span>
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
            {isRTL ? "تأكيد حذف القيد" : "Confirm Delete"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {isRTL
              ? `هل أنت متأكد من حذف قيد ${deleteTarget?.employeeName} بمبلغ ${deleteTarget?.amount} ${deleteTarget?.currency}؟`
              : `Delete salary record for ${deleteTarget?.employeeName}?`}
          </DialogDescription>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="h-10 rounded-xl">
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (deleteTarget) {
                  onDeleteSalary(deleteTarget.id);
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
