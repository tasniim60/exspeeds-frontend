"use client";

import React, { useState, useMemo } from "react";
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Briefcase,
  Layers,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  calculateTreasuryState,
  CompanyTreasuryState,
  CustomerCollection,
  BusinessExpense,
  CarrierTransfer,
  InternalTransfer,
  SalaryPayment,
  MASTER_FINANCIAL_ACCOUNTS,
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
  onAddInternalTransfer?: (transfer: InternalTransfer) => void;
  onDeleteInternalTransfer?: (id: string) => void;
  onAddSalary?: (salary: SalaryPayment) => void;
  onDeleteSalary?: (id: string) => void;
}

export const TreasuryView: React.FC<TreasuryViewProps> = ({
  collections = [],
  expenses = [],
  carrierTransfers = [],
  internalTransfers = [],
  salaries = [],
}) => {
  const { isRTL, formatCurrency } = useLanguage();

  // Filters State
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

    // 1. Collections (Inflow)
    collections.forEach((c) => {
      list.push({
        id: `col-${c.id}`,
        rawId: c.id,
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

    // 2. Carrier Payments (Outflow)
    carrierTransfers.forEach((tr) => {
      list.push({
        id: `ct-${tr.id}`,
        rawId: tr.id,
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

    // 3. Operating & Extra Expenses (Outflow)
    expenses.forEach((e) => {
      list.push({
        id: `exp-${e.id}`,
        rawId: e.id,
        date: e.date,
        type: "Expense",
        account: e.payingAccount || "CIB account",
        amount: e.amount,
        direction: "out",
        description: e.title,
        recorder: e.recorder,
        reference: e.receiptNumber || (e.linkedAwb ? `AWB: ${e.linkedAwb}` : undefined),
      });
    });

    // 4. Internal Vault Transfers (In & Out pairs)
    internalTransfers.forEach((it) => {
      list.push({
        id: `it-out-${it.id}`,
        rawId: it.id,
        date: it.date,
        type: "InternalTransfer",
        account: it.fromAccount,
        amount: it.amount + (it.fee || 0),
        direction: "out",
        description: isRTL
          ? `تحويل خارج إلى (${it.toAccount}) ${it.fee ? `+ مصاريف ${it.fee}` : ""}`
          : `Transfer out to (${it.toAccount})`,
        recorder: it.recordedBy,
        reference: it.referenceNumber,
      });

      list.push({
        id: `it-in-${it.id}`,
        rawId: it.id,
        date: it.date,
        type: "InternalTransfer",
        account: it.toAccount,
        amount: it.amount,
        direction: "in",
        description: isRTL ? `تحويل وارد من (${it.fromAccount})` : `Transfer in from (${it.fromAccount})`,
        recorder: it.recordedBy,
        reference: it.referenceNumber,
      });
    });

    // 5. Salaries & Advances (Outflow)
    salaries.forEach((s) => {
      list.push({
        id: `sal-${s.id}`,
        rawId: s.id,
        date: s.date,
        type: "Salary",
        account: s.payingAccount,
        amount: s.amount,
        direction: "out",
        description: isRTL
          ? `صرف ${s.type === "salary" ? "مرتب" : "سلفة"}: ${s.employeeName} (${s.period})`
          : `Disbursement (${s.type}): ${s.employeeName}`,
        recorder: s.recordedBy,
        reference: s.notes,
      });
    });

    // Sort newest date first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [collections, carrierTransfers, expenses, internalTransfers, salaries, isRTL]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchesVault =
        selectedVaultFilter === "all" ||
        tx.account.toLowerCase() === selectedVaultFilter.toLowerCase();

      const matchesType =
        selectedTypeFilter === "all" ||
        tx.type === selectedTypeFilter;

      const matchesSearch =
        searchQuery === "" ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.recorder && tx.recorder.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.reference && tx.reference.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesVault && matchesType && matchesSearch;
    });
  }, [allTransactions, selectedVaultFilter, selectedTypeFilter, searchQuery]);

  // Export Unified Ledger to CSV
  const handleExportCsv = () => {
    const headers = [
      isRTL ? "التاريخ" : "Date",
      isRTL ? "النوع" : "Type",
      isRTL ? "الخزينة / الحساب" : "Vault / Account",
      isRTL ? "البيان / الوصف" : "Description",
      isRTL ? "المسؤول" : "Recorder",
      isRTL ? "المرجع" : "Reference",
      isRTL ? "الاتجاه" : "Direction",
      isRTL ? "المبلغ" : "Amount",
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.type,
      `"${tx.account}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.recorder || ""}"`,
      `"${tx.reference || ""}"`,
      tx.direction === "in" ? (isRTL ? "وارد" : "Inflow") : (isRTL ? "منصرف" : "Outflow"),
      tx.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `treasury_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 shadow-2xs">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{isRTL ? "الخزينة العامة والسيولة النقدية" : "Treasury & Multi-Vault Liquidity"}</span>
                <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                  {MASTER_FINANCIAL_ACCOUNTS.length} {isRTL ? "خزائن وعهد" : "Vaults"}
                </Badge>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {isRTL
                  ? "متابعة أرصدة الخزائن الـ 5، والتدفقات النقدية الواردة والمنصرفة، وسجل الحركات المالية الموحد"
                  : "Track balances across all 5 financial vaults, cashflows, and consolidated ledger"}
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
            <span>{isRTL ? "تصدير كشف حركة الخزينة" : "Export Ledger CSV"}</span>
          </Button>
        </div>
      </div>

      {/* Top Level Summary: Total Inflow, Outflow, Net Liquidity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "إجمالي المقبوضات (الوارد)" : "Total Cash Inflow"}
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                  {formatCurrency(treasuryState.totalInflows, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {collections.length} {isRTL ? "حركة تحصيل عملاء" : "customer collections"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <ArrowDownLeft className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "إجمالي المدفوعات (المنصرف)" : "Total Cash Outflow"}
                </p>
                <h3 className="text-2xl font-black text-rose-600 mt-1 font-mono">
                  {formatCurrency(treasuryState.totalOutflows, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {isRTL ? "مصروفات، وسداد نواقل، ومرتبات" : "Expenses, carriers & payroll"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isRTL ? "صافي السيولة النقدية" : "Net Treasury Liquidity"}
                </p>
                <h3
                  className={`text-2xl font-black mt-1 font-mono ${
                    treasuryState.totalCompanyCash >= 0 ? "text-slate-900" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(treasuryState.totalCompanyCash, "EGP")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {isRTL ? "الرصيد المتاح عبر كافة الخزائن" : "Available balance across 5 vaults"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5 Vaults Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#C45B2A]" />
            <span>{isRTL ? "أرصدة الخزائن والعهد المالية المعتمدة" : "Designated Vault & Account Balances"}</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold">5 {isRTL ? "حسابات نشطة" : "Active Accounts"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {treasuryState.vaults.map((vault) => {
            const accName = vault.accountName;
            const isCib = accName.toLowerCase().includes("cib");
            const isWallet = accName.toLowerCase().includes("wallet") || accName.toLowerCase().includes("speedex");

            return (
              <Card
                key={accName}
                className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => setSelectedVaultFilter(accName === selectedVaultFilter ? "all" : accName)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-800 truncate" title={accName}>
                      {accName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 font-bold ${
                        selectedVaultFilter.toLowerCase() === accName.toLowerCase()
                          ? "bg-[#C45B2A] text-white border-[#C45B2A]"
                          : isCib
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : isWallet
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {selectedVaultFilter.toLowerCase() === accName.toLowerCase()
                        ? isRTL ? "محدد" : "Selected"
                        : isCib ? "Bank" : isWallet ? "Wallet" : "Cash"}
                    </Badge>
                  </div>

                  <div className="pt-1">
                    <div className="text-lg font-black font-mono text-slate-900">
                      {formatCurrency(vault.currentBalance, "EGP")}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">{isRTL ? "وارد:" : "In:"}</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {vault.totalInflows > 0
                          ? `+${vault.totalInflows.toLocaleString()}`
                          : "0"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{isRTL ? "منصرف:" : "Out:"}</span>
                      <span className="font-mono font-bold text-rose-600">
                        {vault.totalOutflows > 0
                          ? `-${vault.totalOutflows.toLocaleString()}`
                          : "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search
                  className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 ${
                    isRTL ? "right-3" : "left-3"
                  }`}
                />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? "بحث في القيود والبيان..." : "Search transactions..."}
                  className={`${
                    isRTL ? "pr-8.5 text-right" : "pl-8.5 text-left"
                  } h-9 text-xs bg-[#FAF8F5] border-slate-300 w-52 rounded-xl`}
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#C45B2A] cursor-pointer"
              >
                <option value="all">{isRTL ? "جميع أنواع الحركات" : "All Transaction Types"}</option>
                <option value="Collection">{isRTL ? "تحصيلات عملاء (وارد)" : "Collections (In)"}</option>
                <option value="Expense">{isRTL ? "مصروفات تشغيلية (منصرف)" : "Expenses (Out)"}</option>
                <option value="CarrierPayment">{isRTL ? "سداد شركات شحن (منصرف)" : "Carrier Payments (Out)"}</option>
                <option value="InternalTransfer">{isRTL ? "مناقلات داخلية" : "Internal Transfers"}</option>
                <option value="Salary">{isRTL ? "مرتبات وسلف (منصرف)" : "Salaries & Advances (Out)"}</option>
              </select>

              {/* Vault Filter */}
              <select
                value={selectedVaultFilter}
                onChange={(e) => setSelectedVaultFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#C45B2A] cursor-pointer"
              >
                <option value="all">{isRTL ? "جميع الخزائن" : "All Vaults"}</option>
                {MASTER_FINANCIAL_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-bold self-center">
              {isRTL ? "المعروض:" : "Showing:"} {filteredTransactions.length} / {allTransactions.length} {isRTL ? "حركة مالية" : "transactions"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Transaction Feed Table */}
      <Card className="border border-slate-200/80 shadow-2xs bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FAF8F5]">
              <TableRow>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "التاريخ" : "Date"}
                </TableHead>
                <TableHead className="text-center text-xs font-extrabold text-slate-700">
                  {isRTL ? "نوع الحركة" : "Type"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "الخزينة / الحساب" : "Vault / Account"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "البيان والتفاصيل" : "Description & Notes"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "المسؤول" : "Recorder"}
                </TableHead>
                <TableHead className="text-start text-xs font-extrabold text-slate-700">
                  {isRTL ? "المرجع" : "Reference"}
                </TableHead>
                <TableHead className="text-end text-xs font-extrabold text-slate-700">
                  {isRTL ? "المبلغ" : "Amount"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 rounded-2xl bg-slate-100 text-slate-400">
                        <Landmark className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        {isRTL ? "لا توجد قيود مالية مسجلة تطابق التحديد" : "No treasury records found"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {isRTL ? "يتم تغذية الخزينة آليًا من التحصيلات والمصروفات وسداد النواقل والمناقلات" : "Ledger feeds automatically from collections, expenses, carriers and payroll"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
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
                            : tx.type === "Expense"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : tx.type === "CarrierPayment"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : tx.type === "InternalTransfer"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {tx.type === "Collection"
                          ? isRTL ? "تحصيل عميل" : "Collection"
                          : tx.type === "Expense"
                          ? isRTL ? "مصروف" : "Expense"
                          : tx.type === "CarrierPayment"
                          ? isRTL ? "سداد ناقل" : "Carrier Pay"
                          : tx.type === "InternalTransfer"
                          ? isRTL ? "مناقلة" : "Transfer"
                          : isRTL ? "مرتب/سلفة" : "Payroll"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-slate-800">
                      <Badge variant="outline" className="text-[11px] font-mono bg-slate-50 text-slate-700 border-slate-200">
                        {tx.account}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs font-bold text-slate-900">
                      <div>{tx.description}</div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {tx.recorder || "-"}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-slate-500">
                      {tx.reference || "-"}
                    </TableCell>

                    <TableCell
                      className={`text-end font-mono font-bold text-xs ${
                        tx.direction === "in" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {tx.direction === "in" ? "+" : "-"}
                      {formatCurrency(tx.amount, "EGP")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
