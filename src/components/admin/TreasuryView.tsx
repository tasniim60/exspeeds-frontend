"use client";

import React, { useState, useMemo } from "react";
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Trash2,
  UserCheck,
  Briefcase,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  calculateTreasuryState,
  CompanyTreasuryState,
  CustomerCollection,
  BusinessExpense,
  CarrierTransfer,
  InternalTransfer,
  SalaryPayment,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
} from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface UnifiedTransaction {
  id: string;
  rawId?: string;
  date: string;
  type: "Collection" | "Expense" | "CarrierPayment" | "InternalTransfer" | "Salary";
  account: string;
  amount: number;
  direction: "in" | "out";
  description: string;
  recorder?: string;
  reference?: string;
}

interface TreasuryViewProps {
  collections: CustomerCollection[];
  expenses: BusinessExpense[];
  carrierTransfers: CarrierTransfer[];
  internalTransfers: InternalTransfer[];
  salaries: SalaryPayment[];
  onAddInternalTransfer: (transfer: InternalTransfer) => void;
  onDeleteInternalTransfer: (id: string) => void;
  onAddSalary: (salary: SalaryPayment) => void;
  onDeleteSalary: (id: string) => void;
}

export const TreasuryView: React.FC<TreasuryViewProps> = ({
  collections,
  expenses,
  carrierTransfers,
  internalTransfers,
  salaries,
  onAddInternalTransfer,
  onDeleteInternalTransfer,
  onAddSalary,
  onDeleteSalary,
}) => {
  const { isRTL, formatCurrency } = useLanguage();

  // Filters State
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [internalTransferModalOpen, setInternalTransferModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  // Internal Transfer Form State
  const [fromAccount, setFromAccount] = useState<string>(MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account");
  const [toAccount, setToAccount] = useState<string>(MASTER_FINANCIAL_ACCOUNTS[1] || "speedex wallet");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [transferRecorder, setTransferRecorder] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [transferNotes, setTransferNotes] = useState("");

  // Salary Form State
  const [employeeName, setEmployeeName] = useState("");
  const [salaryType, setSalaryType] = useState<"salary" | "advance">("salary");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState("يناير 2026");
  const [salaryPayingAccount, setSalaryPayingAccount] = useState<string>(MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account");
  const [salaryDate, setSalaryDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [salaryRecorder, setSalaryRecorder] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [salaryNotes, setSalaryNotes] = useState("");

  // Real-time calculation of treasury state across all 5 accounts
  const treasuryState: CompanyTreasuryState = useMemo(() => {
    return calculateTreasuryState(
      collections,
      carrierTransfers,
      expenses,
      internalTransfers,
      salaries
    );
  }, [collections, carrierTransfers, expenses, internalTransfers, salaries]);

  // Unified Transaction Feed
  const allTransactions: UnifiedTransaction[] = useMemo(() => {
    const list: UnifiedTransaction[] = [];

    collections.forEach((c) => {
      list.push({
        id: c.id,
        date: c.date,
        type: "Collection",
        account: c.receivingAccount,
        amount: c.amount,
        direction: "in",
        description: isRTL ? `تحصيل عميل: ${c.clientName}` : `Customer Collection: ${c.clientName}`,
        recorder: c.recordedBy,
        reference: c.receiptNumber,
      });
    });

    carrierTransfers.forEach((tr) => {
      list.push({
        id: tr.id,
        date: tr.date,
        type: "CarrierPayment",
        account: tr.payingAccount,
        amount: tr.amount,
        direction: "out",
        description: isRTL ? `سداد ناقل: ${tr.carrier}` : `Carrier Transfer: ${tr.carrier}`,
        recorder: tr.recordedBy,
        reference: tr.referenceNumber,
      });
    });

    expenses.forEach((e) => {
      list.push({
        id: e.id,
        date: e.date,
        type: "Expense",
        account: e.payingAccount || "CIB account",
        amount: e.amount,
        direction: "out",
        description: e.title,
        recorder: e.recorder,
        reference: e.receiptNumber,
      });
    });

    internalTransfers.forEach((tr) => {
      list.push({
        id: `${tr.id}-out`,
        rawId: tr.id,
        date: tr.date,
        type: "InternalTransfer",
        account: tr.fromAccount,
        amount: tr.amount,
        direction: "out",
        description: isRTL ? `مناقلة صادرة إلى ${tr.toAccount}` : `Transfer to ${tr.toAccount}`,
        recorder: tr.recordedBy,
        reference: tr.referenceNumber,
      });
      list.push({
        id: `${tr.id}-in`,
        rawId: tr.id,
        date: tr.date,
        type: "InternalTransfer",
        account: tr.toAccount,
        amount: tr.amount,
        direction: "in",
        description: isRTL ? `مناقلة واردة من ${tr.fromAccount}` : `Transfer from ${tr.fromAccount}`,
        recorder: tr.recordedBy,
        reference: tr.referenceNumber,
      });
    });

    salaries.forEach((s) => {
      list.push({
        id: s.id,
        date: s.date,
        type: "Salary",
        account: s.payingAccount,
        amount: s.amount,
        direction: "out",
        description: `${s.employeeName} (${s.type === "salary" ? (isRTL ? "مرتب" : "Salary") : (isRTL ? "سلفة" : "Advance")})`,
        recorder: s.recordedBy,
        reference: s.period,
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [collections, carrierTransfers, expenses, internalTransfers, salaries, isRTL]);

  // Filtered Transactions Timeline
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchesAccount =
        selectedVaultFilter === "all" ||
        tx.account.toLowerCase() === selectedVaultFilter.toLowerCase();

      const matchesType =
        selectedTypeFilter === "all" || tx.type === selectedTypeFilter;

      const matchesSearch =
        searchQuery === "" ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.reference && tx.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.recorder && tx.recorder.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesAccount && matchesType && matchesSearch;
    });
  }, [allTransactions, selectedVaultFilter, selectedTypeFilter, searchQuery]);

  // Submit Internal Vault Transfer
  const handleSubmitInternalTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    if (fromAccount === toAccount) {
      alert(isRTL ? "لا يمكن التحويل لنفس الخزينة!" : "Source and target vaults must be different!");
      return;
    }

    const newTransfer: InternalTransfer = {
      id: `it-${Date.now()}`,
      fromAccount,
      toAccount,
      amount: amountNum,
      currency: "EGP",
      date: transferDate,
      recordedBy: transferRecorder,
      notes: transferNotes.trim() || undefined,
    };

    onAddInternalTransfer(newTransfer);
    setTransferAmount("");
    setTransferNotes("");
    setInternalTransferModalOpen(false);
  };

  // Submit Salary or Advance
  const handleSubmitSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(salaryAmount);
    if (isNaN(amountNum) || amountNum <= 0 || !employeeName.trim()) return;

    const newSalary: SalaryPayment = {
      id: `sal-${Date.now()}`,
      employeeName: employeeName.trim(),
      type: salaryType,
      amount: amountNum,
      currency: "EGP",
      period: salaryPeriod,
      payingAccount: salaryPayingAccount,
      date: salaryDate,
      recordedBy: salaryRecorder,
      notes: salaryNotes.trim() || undefined,
    };

    onAddSalary(newSalary);
    setEmployeeName("");
    setSalaryAmount("");
    setSalaryNotes("");
    setSalaryModalOpen(false);
  };

  // Helper for Vault Icon
  const getVaultIcon = (accountName: string) => {
    const lower = accountName.toLowerCase();
    if (lower.includes("cib") || lower.includes("bank")) {
      return <Landmark className="h-5 w-5 text-blue-600" />;
    }
    if (lower.includes("wallet") || lower.includes("speedex")) {
      return <Wallet className="h-5 w-5 text-purple-600" />;
    }
    return <UserCheck className="h-5 w-5 text-amber-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {isRTL ? "الخزينة والسيولة النقدية" : "Treasury & Multi-Vault Liquidity"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {isRTL
                  ? "مراقبة أرصدة الحسابات الخمسة في الوقت الحقيقي، السيولة الإجمالية، والمناقلات"
                  : "Real-time monitoring of all 5 cash vaults, net liquidity, and movements"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            onClick={() => setInternalTransferModalOpen(true)}
            className="bg-brand-orange hover:bg-brand-orange-deep text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer text-xs"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>{isRTL ? "مناقلة بين الخزائن" : "Vault Transfer"}</span>
          </Button>

          <Button
            type="button"
            onClick={() => setSalaryModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer text-xs"
          >
            <Briefcase className="h-4 w-4" />
            <span>{isRTL ? "صرف مرتب / سلفة" : "Salary / Advance"}</span>
          </Button>
        </div>
      </div>

      {/* Main Liquidity Banner */}
      <Card className="border border-slate-200/80 shadow-xs bg-gradient-to-br from-brand-dark via-brand-dark-border to-brand-dark-deep text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-col lg:flex-row pt-2 items-start gap-2">
                <Badge className="bg-brand-orange text-white font-bold text-xs border-0">
                  {isRTL ? "إجمالي السيولة الفعلية" : "Company Liquid Cash"}
                </Badge>
                <span className="text-xs text-slate-400">
                  {isRTL ? "مجموع أرصدة الخزائن الخمسة" : "Combined 5 official vaults"}
                </span>
              </div>
              <h2 className="text-start lg:text-center text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white mt-2">
                {formatCurrency(treasuryState.totalCompanyCash, "EGP")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
                {isRTL
                  ? "الرصيد النقدي الحر المتاح للاستخدام الفوري بعد خصم كافة المصروفات، المدفوعات للناقلين، والمرتبات من إجمالي التحصيلات والعهد الافتتاحية."
                  : "Net unencumbered cash available for immediate disbursement across bank, e-wallets, and agent floats."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 text-start gap-4 w-full lg:w-auto shrink-0">
              <div className="p-4  rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isRTL ? "إجمالي التدفقات الواردة" : "Total Cash Inflow"}
                  </span>
                </div>
                <p className="text-xl font-black font-mono text-emerald-400 mt-1">
                  {isRTL ?
                  `${formatCurrency(treasuryState.totalInflows, "EGP")}+`
                  :
                  `+${ formatCurrency(treasuryState.totalInflows, "EGP")}`
                   }
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isRTL ? "تحصيلات العملاء والمناقلات" : "Collections & transfers in"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-rose-400">
                  <ArrowDownLeft className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isRTL ? "إجمالي التدفقات الصادرة" : "Total Cash Outflow"}
                  </span>
                </div>
                <p className="text-xl font-black font-mono text-rose-400 mt-1">
                  {isRTL ?
                  `${formatCurrency(treasuryState.totalOutflows, "EGP")}-`
                  :
                  `-${ formatCurrency(treasuryState.totalOutflows, "EGP")}`
                   }
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isRTL ? "مصروفات، ناقلين، ومرتبات" : "Expenses, carriers, salaries"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The 5 Official Vault Cards */}
      <div>
        <div className="flex  items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {isRTL ? "أرصدة الخزائن والحسابات (العهد الخمسة)" : "Active Vault Accounts (5 Official Vaults)"}
          </h2>
          <span className="text-xs text-slate-500">
            {isRTL ? "محدث بالكامل لحظة بلحظة" : "Live synchronization"}
          </span>
        </div>

        <div className="grid text-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {treasuryState.vaults.map((vault) => {
            const isNegative = vault.currentBalance < 0;

            return (
              <Card
                key={vault.accountName}
                onClick={() => {
                  setSelectedVaultFilter(
                    selectedVaultFilter === vault.accountName ? "all" : vault.accountName
                  );
                }}
                className={`border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
                  selectedVaultFilter === vault.accountName
                    ? "border-brand-orange ring-2 ring-brand-orange/20 bg-orange-50/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-slate-100">
                      {getVaultIcon(vault.accountName)}
                    </div>
                    {vault.initialFloat > 0 && (
                      <Badge variant="outline" className="text-[10px] text-slate-500 font-mono">
                        {isRTL ? "افتتاحي:" : "Float:"} {vault.initialFloat}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 truncate" title={vault.accountName}>
                    {vault.accountName}
                  </h3>

                  <p
                    className={`text-xl font-black font-mono mt-1 ${
                      isNegative ? "text-rose-600" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(vault.currentBalance, "EGP")}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">{isRTL ? "وارد (+):" : "In (+):"}</span>
                      <span className="font-mono font-bold text-emerald-600 truncate block">
                        {formatCurrency(vault.totalInflows, "EGP")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{isRTL ? "صادر (-):" : "Out (-):"}</span>
                      <span className="font-mono font-bold text-rose-600 truncate block">
                        {formatCurrency(vault.totalOutflows, "EGP")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transaction Feed & Ledger */}
      <Card className="border border-slate-200/80 shadow-2xs bg-white">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                {isRTL ? "سجل حركة النقدية والتدفقات" : "Unified Cash Flow & Transaction Ledger"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                {isRTL
                  ? "كافة سندات التحصيل، المصروفات، سداد الناقلين، المناقلات، والمرتبات"
                  : "Complete feed of collections, operational expenses, carrier transfers, and salaries"}
              </CardDescription>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 ${isRTL ? "right-2.5" : "left-2.5"}`} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? "بحث في الحركات..." : "Search transactions..."}
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

              {/* Type Filter */}
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C45B2A]"
              >
                <option value="all">{isRTL ? "جميع العمليات" : "All Types"}</option>
                <option value="Collection">{isRTL ? "تحصيل عميل (وارد)" : "Collection (In)"}</option>
                <option value="Expense">{isRTL ? "مصروف عام (صادر)" : "Expense (Out)"}</option>
                <option value="CarrierPayment">{isRTL ? "سداد ناقل (صادر)" : "Carrier Payment (Out)"}</option>
                <option value="InternalTransfer">{isRTL ? "مناقلة داخلية" : "Vault Transfer"}</option>
                <option value="Salary">{isRTL ? "مرتب / سلفة (صادر)" : "Salary / Advance (Out)"}</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FAF8F5]">
              <TableRow>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "التاريخ" : "Date"}</TableHead>
                <TableHead className="text-center text-xs font-extrabold text-slate-700">{isRTL ? "النوع" : "Type"}</TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "الخزينة" : "Vault"}</TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "البيان والتفاصيل" : "Description"}</TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "المسؤول" : "Recorder"}</TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">{isRTL ? "المبلغ (EGP)" : "Amount"}</TableHead>
                <TableHead className="text-center text-xs font-extrabold text-slate-700">{isRTL ? "إجراء" : "Action"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Landmark className="h-6 w-6 text-slate-300" />
                      <p className="text-xs font-semibold">
                        {isRTL ? "لا توجد حركات مسجلة تطابق التحديد" : "No transactions match your filter"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => {
                  const isInflow = tx.direction === "in";

                  return (
                    <TableRow key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-xs font-mono text-slate-600">
                        {tx.date}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            tx.type === "Collection"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : tx.type === "CarrierPayment"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : tx.type === "InternalTransfer"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : tx.type === "Salary"
                              ? "bg-slate-100 text-slate-800 border-slate-300"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {tx.type === "Collection"
                            ? isRTL ? "تحصيل عميل" : "Collection"
                            : tx.type === "CarrierPayment"
                            ? isRTL ? "سداد ناقل" : "Carrier Pay"
                            : tx.type === "InternalTransfer"
                            ? isRTL ? "مناقلة" : "Transfer"
                            : tx.type === "Salary"
                            ? isRTL ? "مرتب / سلفة" : "Payroll"
                            : isRTL ? "مصروف" : "Expense"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs font-bold text-slate-800">
                        {tx.account}
                      </TableCell>

                      <TableCell className="text-xs text-slate-700 max-w-fit truncate">
                        <div className="font-semibold">{tx.description}</div>
                        {tx.reference && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ref: {tx.reference}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {tx.recorder || "-"}
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-xs">
                        <span className={isInflow ? "text-emerald-600" : "text-rose-600"}>
                          {isInflow ? "+" : "-"}
                          {formatCurrency(tx.amount, "EGP")}
                        </span>
                      </TableCell>

                      <TableCell className="text-center py-2.5">
                        <div className="flex items-center justify-center">
                          {tx.type === "InternalTransfer" && tx.rawId && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(isRTL ? "حذف هذه المناقلة؟" : "Delete transfer?")) {
                                  onDeleteInternalTransfer(tx.rawId!);
                                }
                              }}
                              className="h-10 w-10 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={isRTL ? "حذف المناقلة" : "Delete transfer"}
                              aria-label={isRTL ? "حذف المناقلة" : "Delete transfer"}
                            >
                              <Trash2 className="h-6 w-6" />
                            </Button>
                          )}
                          {tx.type === "Salary" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(isRTL ? "حذف هذا المرتب/السلفة؟" : "Delete salary?")) {
                                  onDeleteSalary(tx.id);
                                }
                              }}
                              className="h-10 w-10 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={isRTL ? "حذف السجل" : "Delete record"}
                              aria-label={isRTL ? "حذف السجل" : "Delete record"}
                            >
                              <Trash2 className="h-6 w-6" />
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

      {/* Internal Transfer Modal */}
      <Dialog open={internalTransferModalOpen} onOpenChange={setInternalTransferModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 text-brand-orange">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <span>{isRTL ? "مناقلة نقدية بين الخزائن" : "Internal Vault Transfer"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isRTL
                ? "نقل سيولة بين حسابات الشركة (خصم من خزينة وإيداع في أخرى)"
                : "Transfer funds from one company vault to another"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitInternalTransfer} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "من خزينة (المصدر) *" : "From Vault *"}
                </label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
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
                  {isRTL ? "إلى خزينة (الهدف) *" : "To Vault *"}
                </label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  {MASTER_FINANCIAL_ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "المبلغ المحول (EGP) *" : "Transfer Amount (EGP) *"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "تاريخ التحويل" : "Date"}
                </label>
                <Input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "المسؤول عن المناقلة *" : "Recorded By *"}
              </label>
              <select
                value={transferRecorder}
                onChange={(e) => setTransferRecorder(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
              >
                {MASTER_AGENTS.map((ag) => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "ملاحظات المناقلة" : "Notes"}
              </label>
              <Input
                type="text"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder={isRTL ? "تغذية عهدة نقدية..." : "Transfer notes..."}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInternalTransferModalOpen(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange-deep text-white text-xs font-bold cursor-pointer"
              >
                {isRTL ? "تنفيذ المناقلة" : "Execute Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Salary & Advance Modal */}
      <Dialog open={salaryModalOpen} onOpenChange={setSalaryModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800">
                <Briefcase className="h-4 w-4" />
              </div>
              <span>{isRTL ? "صرف مرتب شهري أو سلفة" : "Disburse Salary or Advance"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isRTL
                ? "تسجيل مدفوعات الأجور والسلف وخصمها من الخزينة المحددة"
                : "Record staff salary or advance and deduct from vault balance"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSalary} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "اسم الموظف *" : "Employee Name *"}
                </label>
                <Input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. محمد أحمد"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "نوع الصرف" : "Disbursement Type"}
                </label>
                <select
                  value={salaryType}
                  onChange={(e) => setSalaryType(e.target.value as "salary" | "advance")}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="salary">{isRTL ? "مرتب شهري (Salary)" : "Monthly Salary"}</option>
                  <option value="advance">{isRTL ? "سلفة على المرتب (Advance)" : "Staff Advance"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "المبلغ (EGP) *" : "Amount (EGP) *"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "عن شهر / فترة" : "Period"}
                </label>
                <Input
                  type="text"
                  value={salaryPeriod}
                  onChange={(e) => setSalaryPeriod(e.target.value)}
                  placeholder="2026-08"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isRTL ? "الخزينة المنصرف منها *" : "Paying Vault *"}
                </label>
                <select
                  value={salaryPayingAccount}
                  onChange={(e) => setSalaryPayingAccount(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
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
                  value={salaryRecorder}
                  onChange={(e) => setSalaryRecorder(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  {MASTER_AGENTS.map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "تاريخ الصرف" : "Date"}
              </label>
              <Input
                type="date"
                value={salaryDate}
                onChange={(e) => setSalaryDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "ملاحظات" : "Notes"}
              </label>
              <Input
                type="text"
                value={salaryNotes}
                onChange={(e) => setSalaryNotes(e.target.value)}
                placeholder={isRTL ? "ملاحظات الصرف..." : "Notes..."}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSalaryModalOpen(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                {isRTL ? "حفظ وصرف" : "Disburse & Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

