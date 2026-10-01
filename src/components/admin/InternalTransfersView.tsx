"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowRightLeft,
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
  ArrowRight,
  TrendingUp,
  CheckCircle2,
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
  InternalTransfer,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
} from "@/lib/adminData";

interface InternalTransfersViewProps {
  internalTransfers: InternalTransfer[];
  onAddInternalTransfer: (transfer: InternalTransfer) => void;
  onDeleteInternalTransfer: (id: string) => void;
}

export const InternalTransfersView: React.FC<InternalTransfersViewProps> = ({
  internalTransfers = [],
  onAddInternalTransfer,
  onDeleteInternalTransfer,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFromFilter, setSelectedFromFilter] = useState<string>("all");
  const [selectedToFilter, setSelectedToFilter] = useState<string>("all");

  // Modal State: Record Internal Transfer
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [transferOfficer, setTransferOfficer] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [fromAccount, setFromAccount] = useState<string>(
    MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account"
  );
  const [toAccount, setToAccount] = useState<string>(
    MASTER_FINANCIAL_ACCOUNTS[1] || "speedex wallet"
  );
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const [fee, setFee] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("تحويل بنكي فوري / إنستاباي");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [recorder, setRecorder] = useState<string>(MASTER_AGENTS[0] || "مصطفي");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Modal State: Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<InternalTransfer | null>(null);

  // Submit Internal Transfer
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert(isRTL ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Please enter a valid amount");
      return;
    }

    if (fromAccount === toAccount) {
      alert(isRTL ? "لا يمكن التحويل لنفس الحساب" : "Source and destination accounts must be different");
      return;
    }

    setSubmitting(true);
    try {
      const newTransfer: InternalTransfer = {
        id: `int-${Date.now()}`,
        fromAccount,
        toAccount,
        amount: parsedAmount,
        currency,
        date,
        fee: parseFloat(fee) || 0,
        referenceNumber: referenceNumber.trim() || `TRF-${Date.now().toString().slice(-6)}`,
        transferOfficer,
        paymentMethod,
        recordedBy: recorder,
        notes: notes.trim() || `تحويل من ${fromAccount} إلى ${toAccount}`,
      };

      onAddInternalTransfer(newTransfer);
      setAddModalOpen(false);

      // Reset form
      setAmount("");
      setFee("0");
      setReferenceNumber("");
      setNotes("");
    } catch (err) {
      console.error("Failed to add internal transfer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    let totalVolumeEgp = 0;
    const nowStr = new Date().toISOString().slice(0, 7);
    let thisMonthTotal = 0;

    internalTransfers.forEach((t) => {
      const inEgp = t.currency === "USD" ? (t.amount || 0) * 50 : t.amount || 0;
      totalVolumeEgp += inEgp;
      if (t.date?.startsWith(nowStr)) {
        thisMonthTotal += inEgp;
      }
    });

    return {
      totalVolumeEgp,
      count: internalTransfers.length,
      thisMonthTotal,
    };
  }, [internalTransfers]);

  // Filtered list
  const filteredList = useMemo(() => {
    return internalTransfers.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        t.fromAccount?.toLowerCase().includes(q) ||
        t.toAccount?.toLowerCase().includes(q) ||
        t.transferOfficer?.toLowerCase().includes(q) ||
        t.referenceNumber?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q) ||
        t.recordedBy?.toLowerCase().includes(q);

      const matchesFrom = selectedFromFilter === "all" || t.fromAccount === selectedFromFilter;
      const matchesTo = selectedToFilter === "all" || t.toAccount === selectedToFilter;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [internalTransfers, searchQuery, selectedFromFilter, selectedToFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#251516] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800 flex items-center justify-center shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <span>{isRTL ? "التحويلات والمناقلات الداخلية بين الخزائن" : "Internal Vault Transfers"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isRTL
              ? "تسجيل ومتابعة حركة السيولة والمناقلات بين الحسابات البنكية والمحافظ والعهد النقدية"
              : "Reconcile liquid fund movements and custody handovers between corporate vaults"}
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? "تسجيل تحويل داخلي جديد" : "New Internal Transfer"}</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "إجمالي حجم المناقلات" : "Total Transfers Volume"}</p>
              <p className="text-xl sm:text-2xl font-black text-cyan-800">{formatCurrency(kpis.totalVolumeEgp, "EGP")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center border border-cyan-200">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "مناقلات الشهر الحالي" : "This Month"}</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{formatCurrency(kpis.thisMonthTotal, "EGP")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 shadow-2xs col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "عدد عمليات المناقلة" : "Transfers Count"}</p>
              <p className="text-2xl font-black text-gray-900">{kpis.count}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
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
                placeholder={isRTL ? "بحث باسم الحساب، المسؤول، رقم المرجع، أو الملاحظات..." : "Search account, officer, ref..."}
                className={`h-10 rounded-xl bg-gray-50/60 border-gray-200 text-xs sm:text-sm ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedFromFilter}
                onChange={(e) => setSelectedFromFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-cyan-700 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل الحسابات المرسلة" : "All Source Vaults"}</option>
                {MASTER_FINANCIAL_ACCOUNTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                value={selectedToFilter}
                onChange={(e) => setSelectedToFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-cyan-700 cursor-pointer"
              >
                <option value="all">{isRTL ? "كل الحسابات المستلمة" : "All Dest Vaults"}</option>
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

      {/* Internal Transfers Table */}
      <Card className="rounded-2xl border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/90 border-b border-gray-200">
              <TableRow>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "التاريخ / المرجع" : "Date / Ref"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "مسار المناقلة (من ⬅ إلى)" : "Transfer Route"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المبلغ المحول" : "Amount"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المسؤول المحول" : "Transfer Officer"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "طريقة التحويل / البيان" : "Method & Notes"}
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
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <ArrowRightLeft className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{isRTL ? "لا توجد مناقلات داخلية مسجلة" : "No internal transfers found"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isRTL ? "اضغط على زر تسجيل تحويل داخلي لنقل سيولة بين الخزائن" : "Click New Internal Transfer to move funds"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((t) => (
                  <TableRow key={t.id} className="hover:bg-cyan-50/20 transition-colors">
                    <TableCell className="text-xs text-gray-700 font-mono">
                      <div className="font-bold text-gray-900">{t.referenceNumber || t.id}</div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{t.date}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {t.fromAccount}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 text-cyan-700 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                        <span className="font-bold text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          {t.toAccount}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-black text-cyan-900 font-mono">
                        {formatCurrency(t.amount, t.currency || "EGP")}
                      </span>
                      {t.fee && t.fee > 0 ? (
                        <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                          {isRTL ? "رسوم: " : "Fee: "}
                          {formatCurrency(t.fee, t.currency || "EGP")}
                        </div>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-cyan-700" />
                        <span>{t.transferOfficer || "مصطفي"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-gray-700 max-w-[200px]">
                      <div className="font-semibold text-gray-900">{t.paymentMethod || "تحويل بنكي"}</div>
                      {t.notes && <div className="text-[11px] text-gray-500 truncate mt-0.5">{t.notes}</div>}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {t.recordedBy || "مصطفي"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(t)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                        title={isRTL ? "حذف التحويل" : "Delete Transfer"}
                        aria-label={isRTL ? "حذف التحويل" : "Delete Transfer"}
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

      {/* Modal: Add Internal Transfer */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-900 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <span>{isRTL ? "تسجيل تحويل ومناقلة داخلية بين الخزائن" : "Record Internal Vault Transfer"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isRTL
                ? "يتم خصم المبلغ من الحساب المرسل وإضافته في الحساب المستلم تلقائياً"
                : "Deducts from source vault and credits destination vault automatically"}
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

            {/* Transfer Officer */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "اسم المسؤول (المحول):" : "Transfer Officer:"}</label>
              <select
                value={transferOfficer}
                onChange={(e) => setTransferOfficer(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none"
              >
                {MASTER_AGENTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* From / To Accounts */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "من حساب (المرسل):" : "From Account (Source):"}</label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
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
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "إلى حساب (المستلم):" : "To Account (Destination):"}</label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none"
                >
                  {MASTER_FINANCIAL_ACCOUNTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "المبلغ المحول:" : "Amount:"}</label>
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

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "طريقة التحويل:" : "Payment Method:"}</label>
                <Input
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder={isRTL ? "تحويل بنكي فوري، إنستاباي، نقدي" : "Wire, InstaPay, Cash"}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "رسوم التحويل إن وجدت:" : "Fee (Optional):"}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "البيان / رقم العملية:" : "Reference / Notes:"}</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRTL ? "تغذية عهدة، سحب سيولة، إلخ" : "Details..."}
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
                className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold h-10 px-5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <CheckCircle2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isRTL ? "حفظ التحويل الداخلي" : "Save Internal Transfer"}</span>
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
            {isRTL ? "تأكيد حذف التحويل الداخلي" : "Confirm Delete"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {isRTL
              ? `هل أنت متأكد من حذف التحويل الداخلي بمبلغ ${deleteTarget?.amount} ${deleteTarget?.currency} من ${deleteTarget?.fromAccount} إلى ${deleteTarget?.toAccount}؟`
              : `Delete transfer ${deleteTarget?.referenceNumber}?`}
          </DialogDescription>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="h-10 rounded-xl">
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (deleteTarget) {
                  onDeleteInternalTransfer(deleteTarget.id);
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
