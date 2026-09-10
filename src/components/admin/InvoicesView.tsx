"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Printer,
  Download,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  QrCode,
  CreditCard,
  Send,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Invoice, Customer, Shipment } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  shipments: Shipment[];
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoice: (inv: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  customers,
  shipments,
  onAddInvoice,
  onUpdateInvoice,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [printableInvoice, setPrintableInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Form State for New Invoice
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(8800 + Math.random() * 99)}`);
  const [customerId, setCustomerId] = useState("CUST-401");
  const [dueDate, setDueDate] = useState("2026-09-15");
  const [subtotal, setSubtotal] = useState("9400");
  const [fuelSurcharge, setFuelSurcharge] = useState("450");
  const [customsDuties, setCustomsDuties] = useState("800");
  const [discount, setDiscount] = useState("0");
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const [linkedAwb, setLinkedAwb] = useState("XS-98421054");

  // Payment Recording Form
  const [paymentMethod, setPaymentMethod] = useState<Invoice["paymentMethod"]>("Bank Wire");

  const selectedCust = customers.find((c) => c.id === customerId) || customers[0];

  const subNum = parseFloat(subtotal) || 0;
  const fuelNum = parseFloat(fuelSurcharge) || 0;
  const custNum = parseFloat(customsDuties) || 0;
  const discNum = parseFloat(discount) || 0;
  const taxable = subNum + fuelNum + custNum - discNum;
  const vatAmount = taxable * 0.14;
  const totalCalculated = taxable + vatAmount;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber,
      date: new Date().toISOString().split("T")[0],
      dueDate: dueDate,
      customerId: selectedCust.id,
      customerName: selectedCust.name,
      companyName: selectedCust.company,
      customerTaxNumber: selectedCust.taxRegistrationNumber,
      linkedAwbs: [linkedAwb],
      subtotal: subNum,
      fuelSurcharge: fuelNum,
      customsDuties: custNum,
      vatRate: 0.14,
      vatAmount: Math.round(vatAmount * 100) / 100,
      discount: discNum,
      totalAmount: Math.round(totalCalculated * 100) / 100,
      currency: currency,
      status: "Pending",
      notes: "Standard Net 30 terms. Electronic wire payment accepted.",
    };

    onAddInvoice(newInv);
    setCreateModalOpen(false);
    setPrintableInvoice(newInv);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalInvoice) return;
    const updated: Invoice = {
      ...paymentModalInvoice,
      status: "Paid",
      paymentMethod: paymentMethod,
      paidDate: new Date().toISOString().split("T")[0],
    };
    onUpdateInvoice(updated);
    setPaymentModalInvoice(null);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.companyName.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBilled = invoices.reduce((acc, i) => acc + (i.currency === "USD" ? i.totalAmount * 31 : i.totalAmount), 0);
  const paidBilled = invoices.filter((i) => i.status === "Paid").reduce((acc, i) => acc + (i.currency === "USD" ? i.totalAmount * 31 : i.totalAmount), 0);
  const pendingBilled = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue").reduce((acc, i) => acc + (i.currency === "USD" ? i.totalAmount * 31 : i.totalAmount), 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {t("admin.invoices.title")} ({invoices.length})
            </h2>
            <p className="text-xs text-gray-500">
              {t("admin.invoices.subtitle")}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="brand"
          onClick={() => {
            setInvoiceNumber(`INV-2026-${Math.floor(8800 + Math.random() * 99)}`);
            setCreateModalOpen(true);
          }}
          className="text-xs font-bold shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.invoices.createInvoice")}</span>
        </Button>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 shadow-2xs text-start">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isRTL ? "إجمالي الفواتير الصادرة" : "Gross Billed Total"}</span>
          <p className="text-2xl font-black font-display text-gray-900 ltr-preserve">
            {(totalBilled / 1000000).toFixed(2)}M <span className="text-xs font-mono text-gray-400">{t("common.egp")}</span>
          </p>
          <p className="text-[11px] text-gray-500">{isRTL ? "شامل الشحن وضريبة القيمة المضافة 14%" : "Includes freight & VAT 14%"}</p>
        </Card>

        <Card className="p-5 space-y-2 shadow-2xs text-start">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isRTL ? "الإيرادات المحصلة" : "Collected Revenue"}</span>
          <p className="text-2xl font-black font-display text-emerald-600 ltr-preserve">
            {(paidBilled / 1000000).toFixed(2)}M <span className="text-xs font-mono text-gray-400">{t("common.egp")}</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {Math.round((paidBilled / (totalBilled || 1)) * 100)}% {isRTL ? "نسبة التحصيل" : "Collection Rate"}
          </p>
        </Card>

        <Card className="p-5 space-y-2 shadow-2xs text-start">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isRTL ? "المستحقات المعلقة" : "Pending Receivables"}</span>
          <p className="text-2xl font-black font-display text-[#C45B2A] ltr-preserve">
            {Math.round(pendingBilled).toLocaleString()} <span className="text-xs font-mono text-gray-400">{t("common.egp")}</span>
          </p>
          <p className="text-[11px] text-gray-500">Net 30</p>
        </Card>

        <Card className="p-5 space-y-2 shadow-2xs text-start">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isRTL ? "فواتير متأخرة" : "Overdue Alerts"}</span>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black font-display text-red-600">{overdueCount}</p>
            {overdueCount > 0 && <Badge variant="destructive" size="sm">{isRTL ? "تنبيه" : "Action Required"}</Badge>}
          </div>
          <p className="text-[11px] text-gray-500">{isRTL ? "إشعارات تذكير آلية" : "Automated reminder queued"}</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-2.5 h-4 w-4 text-gray-400`} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.invoices.searchPlaceholder")}
            className={`text-xs ${isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            {t("common.status")}:
          </span>
          {["all", "Paid", "Pending", "Overdue", "Draft"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#251516] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st === "all" ? t("admin.invoices.allStatuses") : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Master Table */}
      <Card className="shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">{t("admin.invoices.table.invoiceNo")}</TableHead>
              <TableHead className="text-start">{t("admin.invoices.table.client")}</TableHead>
              <TableHead className="text-start">{t("admin.invoices.table.linkedAwbs")}</TableHead>
              <TableHead className="text-start">{t("admin.invoices.table.dueDate")}</TableHead>
              <TableHead className="text-start">{isRTL ? "المجموع الفرعي + الضريبة" : "Subtotal + VAT 14%"}</TableHead>
              <TableHead className="text-start">{t("admin.invoices.table.totalAmount")}</TableHead>
              <TableHead className="text-start">{t("admin.invoices.table.status")}</TableHead>
              <TableHead className="text-end">{t("admin.invoices.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => (
              <TableRow
                key={inv.id}
                onClick={() => setPrintableInvoice(inv)}
                className="cursor-pointer hover:bg-gray-50/90"
              >
                <TableCell>
                  <div className="space-y-0.5 text-start">
                    <span className="font-mono font-bold text-xs text-[#251516] flex items-center gap-1.5 ltr-preserve">
                      <FileText className="h-3.5 w-3.5 text-[#C45B2A]" />
                      {inv.invoiceNumber}
                    </span>
                    <p className="text-[10px] text-gray-400">{inv.date}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 text-start">
                    <p className="text-xs font-bold text-gray-900">{inv.companyName}</p>
                    <p className="text-[10px] text-gray-400 font-mono ltr-preserve">CR: {inv.customerTaxNumber}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {inv.linkedAwbs.map((awb) => (
                      <span key={awb} className="font-mono text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 ltr-preserve">
                        {awb}
                      </span>
                    ))}
                  </div>
                </TableCell>

                <TableCell>
                  <p className={`text-xs font-mono font-bold text-start ltr-preserve ${inv.status === "Overdue" ? "text-red-600" : "text-gray-700"}`}>
                    {inv.dueDate}
                  </p>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5 font-mono text-xs text-start">
                    <span className="text-gray-700">${inv.subtotal}</span>
                    <p className="text-[10px] text-gray-400">+${inv.vatAmount} VAT</p>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono font-black text-xs text-gray-900 text-start ltr-preserve">
                    {inv.currency === "USD" ? `$${inv.totalAmount}` : `${inv.totalAmount.toLocaleString()} ${t("common.egp")}`}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={inv.status === "Paid" ? "success" : inv.status === "Overdue" ? "destructive" : "warning"}
                    size="sm"
                  >
                    {inv.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrintableInvoice(inv);
                      }}
                      className="text-xs cursor-pointer"
                    >
                      <Printer className="h-3 w-3" />
                      <span>PDF</span>
                    </Button>
                    {inv.status !== "Paid" && (
                      <Button
                        size="xs"
                        variant="brand"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentModalInvoice(inv);
                        }}
                        className="text-xs cursor-pointer"
                      >
                        {isRTL ? "تسجيل دفع" : "Record Pay"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm space-y-2">
            <FileText className="h-8 w-8 mx-auto text-gray-300" />
            <p className="font-bold text-gray-700">{isRTL ? "لا توجد فواتير مطابقة" : "No invoices found"}</p>
          </div>
        )}
      </Card>

      {/* ── Printable Formal Tax Invoice Modal ── */}
      {printableInvoice && (
        <Dialog open={!!printableInvoice} onOpenChange={(o) => !o && setPrintableInvoice(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-start" onClose={() => setPrintableInvoice(null)}>
            <div className="p-4 bg-white text-gray-900 space-y-4 text-xs font-sans">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <h3 className="font-black text-lg tracking-wider text-[#251516]">XSPEED LOGISTICS LLC</h3>
                  <p className="text-[11px] text-gray-500">Tax Registration: EG-849-210-994</p>
                  <p className="text-[11px] text-gray-500">Cairo Airport Cargo Village, Terminal 3</p>
                </div>
                <div className="text-end">
                  <Badge variant="outline" className="font-mono text-sm font-bold text-[#C45B2A] border-[#C45B2A] ltr-preserve">
                    {printableInvoice.invoiceNumber}
                  </Badge>
                  <p className="text-[11px] text-gray-500 mt-1">{printableInvoice.date}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{isRTL ? "بيانات العميل:" : "BILL TO:"}</span>
                  <p className="font-bold text-gray-900 mt-0.5">{printableInvoice.companyName}</p>
                  <p className="text-gray-600 font-mono text-[11px] ltr-preserve">CR: {printableInvoice.customerTaxNumber}</p>
                </div>
                <div className="text-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{isRTL ? "حالة الدفع:" : "PAYMENT STATUS:"}</span>
                  <p className="font-bold text-[#C45B2A] mt-0.5">{printableInvoice.status}</p>
                  <p className="text-gray-500 text-[11px] ltr-preserve">Due: {printableInvoice.dueDate}</p>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-gray-200 pt-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span>{isRTL ? "المجموع الفرعي للشحن:" : "Freight Subtotal:"}</span>
                  <span>${printableInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? "ضريبة القيمة المضافة (14%):" : "VAT (14%):"}</span>
                  <span>+${printableInvoice.vatAmount}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#C45B2A] pt-2 border-t border-gray-200">
                  <span>{isRTL ? "الإجمالي الكلي:" : "TOTAL DUE:"}</span>
                  <span className="ltr-preserve">${printableInvoice.totalAmount} USD</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="brand"
                size="sm"
                onClick={() => window.print()}
                className="w-full sm:w-auto h-10 text-xs font-bold cursor-pointer justify-center"
              >
                <Printer className="h-4 w-4 shrink-0" />
                <span>{isRTL ? "طباعة الفاتورة" : "Print Official PDF"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrintableInvoice(null)}
                className="w-full sm:w-auto h-10 text-xs cursor-pointer justify-center"
              >
                {t("common.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Record Payment Modal ── */}
      {paymentModalInvoice && (
        <Dialog open={!!paymentModalInvoice} onOpenChange={(o) => !o && setPaymentModalInvoice(null)}>
          <DialogContent className="max-w-md text-start p-4 sm:p-6" onClose={() => setPaymentModalInvoice(null)}>
            <DialogHeader>
              <DialogTitle>
                <CreditCard className="h-5 w-5 text-emerald-600" />
                {t("admin.invoices.modal.recordPayment")}
              </DialogTitle>
              <DialogDescription className="ltr-preserve">
                {paymentModalInvoice.invoiceNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-start">
                <p className="text-emerald-900 font-bold">{isRTL ? "المبلغ المراد سداده:" : "Total Amount to Settle:"}</p>
                <p className="text-xl font-black font-mono text-emerald-800 mt-0.5 ltr-preserve">
                  {paymentModalInvoice.currency === "USD"
                    ? `$${paymentModalInvoice.totalAmount}`
                    : `${paymentModalInvoice.totalAmount.toLocaleString()} ${t("common.egp")}`}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "طريقة الدفع" : "Payment Method"}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="Bank Wire">{isRTL ? "تحويل بنكي" : "Bank Wire Transfer"}</option>
                  <option value="Cash on Delivery">{isRTL ? "الدفع عند الاستلام (COD)" : "Cash on Delivery (COD)"}</option>
                  <option value="Corporate Credit">{isRTL ? "خصم من رصيد الشركة" : "Corporate Fleet Credit Deduction"}</option>
                  <option value="Credit Card">{isRTL ? "بطاقة ائتمان / خصم مباشر" : "Credit / Debit Card"}</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentModalInvoice(null)}
                className="w-full sm:w-auto h-10 text-xs cursor-pointer justify-center"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="brand"
                onClick={handleConfirmPayment}
                className="w-full sm:w-auto h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 cursor-pointer justify-center"
              >
                <Check className="h-4 w-4 shrink-0" />
                <span className="truncate">{isRTL ? "تأكيد استلام الدفعة" : "Confirm Payment Received"}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Create Invoice Modal ── */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-xl text-start p-4 sm:p-6" onClose={() => setCreateModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              <FileText className="h-5 w-5 text-[#C45B2A]" />
              {t("admin.invoices.modal.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.invoices.modal.createSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.invoices.table.invoiceNo")}
                </label>
                <Input
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="font-mono text-xs uppercase font-bold ltr-preserve"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.invoices.modal.customer")}
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "رقم بوليصة الشحن (AWB)" : "Linked AWB Reference"}
                </label>
                <Input
                  required
                  value={linkedAwb}
                  onChange={(e) => setLinkedAwb(e.target.value)}
                  className="font-mono text-xs uppercase ltr-preserve"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.invoices.table.dueDate")}
                </label>
                <Input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {t("admin.invoices.modal.subtotal")}
                </label>
                <Input
                  type="number"
                  required
                  value={subtotal}
                  onChange={(e) => setSubtotal(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "رسوم الوقود" : "Fuel Surcharge"}
                </label>
                <Input
                  type="number"
                  value={fuelSurcharge}
                  onChange={(e) => setFuelSurcharge(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "الرسوم الجمركية" : "Customs Fees"}
                </label>
                <Input
                  type="number"
                  value={customsDuties}
                  onChange={(e) => setCustomsDuties(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-gray-600">
                <span>{isRTL ? "المبلغ الخاضع للضريبة:" : "Taxable Base:"}</span>
                <span>${taxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{isRTL ? "ضريبة القيمة المضافة 14%:" : "VAT 14%:"}</span>
                <span>+${vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#C45B2A] pt-1 border-t border-gray-200">
                <span>{isRTL ? "القيمة الإجمالية:" : "Total Invoice Value:"}</span>
                <span className="ltr-preserve">${totalCalculated.toFixed(2)} USD</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="w-full sm:w-auto h-10 text-xs cursor-pointer justify-center"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="w-full sm:w-auto h-10 text-xs font-bold cursor-pointer justify-center"
              >
                {t("admin.invoices.modal.saveBtn")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
