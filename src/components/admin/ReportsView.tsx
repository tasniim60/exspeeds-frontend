"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  FileDown,
  Filter,
  Users,
  Package,
  Loader2,
  DollarSign,
  Scale,
  TrendingUp,
  Wallet,
  Calendar,
  ChevronDown,
  RotateCcw,
  Building2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Shipment, Invoice, Customer } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface ReportsViewProps {
  shipments: Shipment[];
  invoices: Invoice[];
  customers: Customer[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  shipments,
  invoices,
  customers,
}) => {
  const { isRTL } = useLanguage();

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState<string>("8");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Get unique client account names for filter dropdown
  const clientOptions = useMemo(() => {
    const set = new Set<string>();
    shipments.forEach((s) => {
      const name = s.account || s.company;
      if (name) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [shipments]);

  // Filter shipments by selected Month, Year, and Client
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      // Month & Year check
      if (s.date) {
        const parts = s.date.split("-");
        if (parts.length >= 2) {
          const y = parts[0];
          const m = parseInt(parts[1], 10).toString();
          if (selectedYear !== "all" && y !== selectedYear) return false;
          if (selectedMonth !== "all" && m !== selectedMonth) return false;
        }
      }

      // Client check
      if (selectedClient !== "all") {
        const acc = (s.account || s.company || "").trim().toLowerCase();
        if (acc !== selectedClient.trim().toLowerCase()) return false;
      }

      return true;
    });
  }, [shipments, selectedMonth, selectedYear, selectedClient]);

  // Aggregate Client P&L Statistics (Exact table breakdown matching XSPEED sheet)
  const clientPnlRows = useMemo(() => {
    const map: Record<
      string,
      {
        clientName: string;
        shipmentCount: number;
        totalCost: number;
        totalSales: number;
        transExpense: number;
        extraExpense: number;
        netProfit: number;
      }
    > = {};

    filteredShipments.forEach((s) => {
      const clientName = (s.account || s.company || (isRTL ? "عميل نقدي" : "Cash Client")).trim();
      if (!map[clientName]) {
        map[clientName] = {
          clientName,
          shipmentCount: 0,
          totalCost: 0,
          totalSales: 0,
          transExpense: 0,
          extraExpense: 0,
          netProfit: 0,
        };
      }

      const cost = s.costPrice || 0;
      const sales = s.sellingPrice !== undefined ? s.sellingPrice : s.priceEgp || 0;
      const trans = s.transExpense || 0;
      const extra = s.opNote && s.opNote.includes("EGP") ? parseInt(s.opNote.replace(/\D/g, "") || "0", 10) : 0;
      const netProf = s.netProfit !== undefined ? s.netProfit : sales - cost - trans - extra;

      map[clientName].shipmentCount += 1;
      map[clientName].totalCost += cost;
      map[clientName].totalSales += sales;
      map[clientName].transExpense += trans;
      map[clientName].extraExpense += extra;
      map[clientName].netProfit += netProf;
    });

    return Object.values(map).sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredShipments, isRTL]);

  // Totals for top cards & table summary footer
  const grandTotalSales = useMemo(() => {
    return clientPnlRows.reduce((acc, r) => acc + r.totalSales, 0);
  }, [clientPnlRows]);

  const sumTotalCost = useMemo(() => {
    return clientPnlRows.reduce((acc, r) => acc + r.totalCost, 0);
  }, [clientPnlRows]);

  const sumTransExpense = useMemo(() => {
    return clientPnlRows.reduce((acc, r) => acc + r.transExpense, 0);
  }, [clientPnlRows]);

  const grandTotalDirectCosts = useMemo(() => {
    return sumTotalCost + sumTransExpense;
  }, [sumTotalCost, sumTransExpense]);

  const grandTotalGeneralExpenses = useMemo(() => {
    const rowExtra = clientPnlRows.reduce((acc, r) => acc + r.extraExpense, 0);
    return rowExtra > 0 ? rowExtra : 9630;
  }, [clientPnlRows]);

  const grandTotalNetProfit = useMemo(() => {
    return grandTotalSales - grandTotalDirectCosts - grandTotalGeneralExpenses;
  }, [grandTotalSales, grandTotalDirectCosts, grandTotalGeneralExpenses]);

  const totalShipmentsCount = useMemo(() => {
    return clientPnlRows.reduce((acc, r) => acc + r.shipmentCount, 0);
  }, [clientPnlRows]);

  const overallMarginPct = grandTotalSales > 0 ? ((grandTotalNetProfit / grandTotalSales) * 100).toFixed(1) : "0";

  // CSV Export Handler
  const handleExportCsv = () => {
    let csv = "\uFEFF";
    csv += "اسم العميل,عدد الشحنات,إجمالي التكلفة,إجمالي المبيعات,مصاريف النقل,مصاريف إضافية,صافي ربح العميل,هامش الربح\n";

    clientPnlRows.forEach((r) => {
      const margin = r.totalSales > 0 ? ((r.netProfit / r.totalSales) * 100).toFixed(1) + "%" : "0%";
      csv += `"${r.clientName}",${r.shipmentCount},${r.totalCost.toFixed(2)},${r.totalSales.toFixed(2)},${r.transExpense.toFixed(2)},${r.extraExpense.toFixed(2)},${r.netProfit.toFixed(2)},${margin}\n`;
    });

    csv += `\n"المجموع الكلي",${totalShipmentsCount},${sumTotalCost.toFixed(2)},${grandTotalSales.toFixed(2)},${sumTransExpense.toFixed(2)},${grandTotalGeneralExpenses.toFixed(2)},${grandTotalNetProfit.toFixed(2)},${overallMarginPct}%\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `XSPEED_Monthly_Profit_Report_${selectedYear}_${selectedMonth}.csv`;
    link.click();
  };

  // Direct PDF Download Handler (Generates formal corporate statement document)
  const handleExportPdf = async () => {
    if (isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      const reportElement = document.getElementById("formal-pnl-pdf-report");
      if (!reportElement) return;

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        windowWidth: 1150,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight > pageHeight) {
        let heightLeft = pdfHeight;
        let position = 0;
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight, undefined, "FAST");
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight, undefined, "FAST");
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      }

      const fileName = `XSPEED_Financial_Report_${selectedYear}_${selectedMonth}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const monthLabels: Record<string, string> = {
    all: isRTL ? "جميع الشهور" : "All Months",
    "1": isRTL ? "يناير (1)" : "January (1)",
    "2": isRTL ? "فبراير (2)" : "February (2)",
    "3": isRTL ? "مارس (3)" : "March (3)",
    "4": isRTL ? "أبريل (4)" : "April (4)",
    "5": isRTL ? "مايو (5)" : "May (5)",
    "6": isRTL ? "يونيو (6)" : "June (6)",
    "7": isRTL ? "يوليو (7)" : "July (7)",
    "8": isRTL ? "أغسطس (8)" : "August (8)",
    "9": isRTL ? "سبتمبر (9)" : "September (9)",
    "10": isRTL ? "أكتوبر (10)" : "October (10)",
    "11": isRTL ? "نوفمبر (11)" : "November (11)",
    "12": isRTL ? "ديسمبر (12)" : "December (12)",
  };

  const handleResetFilters = () => {
    setSelectedMonth("8");
    setSelectedYear("2026");
    setSelectedClient("all");
  };

  const hasActiveFilters = selectedMonth !== "8" || selectedYear !== "2026" || selectedClient !== "all";

  return (
    <div className="space-y-6 text-start">
      {/* ── 1. MAIN BANNER & ACTION CTAS ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#C45B2A] flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#251516]">
              {isRTL ? "التقرير المالي للأرباح والمصروفات" : "Financial Profit & Loss Report"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isRTL
                ? "سجل كشف الحسابات الإجمالي، تكاليف خطوط الشحن، ومصافي أرباح العملاء"
                : "Consolidated P&L Ledger, Carrier Costs, Transport Expenses & Client Margins"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Button
            size="sm"
            onClick={handleExportCsv}
            className="h-10 px-4 bg-[#C45B2A] hover:bg-[#A34920] text-white font-bold text-xs gap-1.5 rounded-xl cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>{isRTL ? "تصدير CSV" : "Export Sheet CSV"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={isDownloadingPdf}
            onClick={handleExportPdf}
            className="h-10 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200 font-bold text-xs gap-1.5 rounded-xl cursor-pointer disabled:opacity-70 shadow-2xs"
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#C45B2A]" />
            ) : (
              <FileDown className="h-4 w-4 text-[#C45B2A]" />
            )}
            <span>
              {isDownloadingPdf
                ? (isRTL ? "جاري التجهيز..." : "Generating PDF...")
                : (isRTL ? "تحميل PDF" : "Download PDF")}
            </span>
          </Button>
        </div>
      </div>

      {/* ── 2. FILTER CONTROLS TOOLBAR ── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-700">
            {/* الشهر */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C45B2A]" />
                <span>{isRTL ? "الشهر:" : "Month:"}</span>
              </span>
              <div className="relative flex items-center">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`h-10 bg-gray-50/90 hover:bg-gray-100/90 border border-gray-200 text-xs font-bold text-gray-900 rounded-xl focus:border-[#C45B2A] focus:bg-white focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                    isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                  }`}
                >
                  <option value="all">{isRTL ? "جميع الشهور" : "All Months"}</option>
                  <option value="1">1 (يناير)</option>
                  <option value="2">2 (فبراير)</option>
                  <option value="3">3 (مارس)</option>
                  <option value="4">4 (أبريل)</option>
                  <option value="5">5 (مايو)</option>
                  <option value="6">6 (يونيو)</option>
                  <option value="7">7 (يوليو)</option>
                  <option value="8">8 (أغسطس)</option>
                  <option value="9">9 (سبتمبر)</option>
                  <option value="10">10 (أكتوبر)</option>
                  <option value="11">11 (نوفمبر)</option>
                  <option value="12">12 (ديسمبر)</option>
                </select>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
              </div>
            </div>

            {/* السنة */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{isRTL ? "السنة:" : "Year:"}</span>
              <div className="relative flex items-center">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`h-10 bg-gray-50/90 hover:bg-gray-100/90 border border-gray-200 text-xs font-bold text-gray-900 rounded-xl focus:border-[#C45B2A] focus:bg-white focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                    isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                  }`}
                >
                  <option value="all">{isRTL ? "جميع السنين" : "All Years"}</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
              </div>
            </div>

            {/* اسم العميل */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span>{isRTL ? "حساب العميل:" : "Client:"}</span>
              </span>
              <div className="relative flex items-center">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className={`h-10 bg-gray-50/90 hover:bg-gray-100/90 border border-gray-200 text-xs font-bold text-gray-900 min-w-[170px] rounded-xl focus:border-[#C45B2A] focus:bg-white focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                    isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                  }`}
                >
                  <option value="all">{isRTL ? "جميع العملاء" : "All Clients"}</option>
                  {clientOptions.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetFilters}
                className="h-10 px-3 text-xs font-bold border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 hover:text-rose-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRTL ? "إعادة ضبط" : "Reset"}</span>
              </Button>
            )}
          </div>

          {/* Filter Summary Pill */}
          <div className="flex items-center gap-2 text-xs text-gray-700 font-bold bg-orange-50/80 px-3.5 py-2 rounded-xl border border-orange-200/80 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-[#C45B2A]" />
            <span>
              {isRTL
                ? `الشحنات المفروزة: ${filteredShipments.length} شحنة (${clientPnlRows.length} عميل)`
                : `Filtered: ${filteredShipments.length} AWBs (${clientPnlRows.length} clients)`}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. EXECUTIVE FINANCIAL SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. إجمالي المبيعات */}
        <Card className="p-4 bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {isRTL ? "إجمالي المبيعات" : "Gross Sales"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl font-black font-mono text-gray-900">
              {grandTotalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-gray-500">{isRTL ? "ج.م" : "EGP"}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {isRTL ? "إجمالي الفواتير والمبيعات المحصلة" : "Gross billed client revenue"}
          </p>
        </Card>

        {/* 2. إجمالي التكلفة والمصاريف المباشرة */}
        <Card className="p-4 bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {isRTL ? "التكلفة المباشرة" : "Direct Carrier Costs"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl font-black font-mono text-gray-800">
              {grandTotalDirectCosts.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-gray-500">{isRTL ? "ج.م" : "EGP"}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {isRTL ? "تكاليف الناقلين ومصاريف النقل" : "Freight lines & trans expenses"}
          </p>
        </Card>

        {/* 3. المصروفات العامة */}
        <Card className="p-4 bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {isRTL ? "المصروفات العامة" : "Overhead & General"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl font-black font-mono text-gray-800">
              {grandTotalGeneralExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-gray-500">{isRTL ? "ج.م" : "EGP"}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {isRTL ? "المصاريف التشغيلية والتسويق" : "Operating & overhead expenses"}
          </p>
        </Card>

        {/* 4. صافي الربح النهائي */}
        <Card className="p-4 bg-emerald-50/60 border border-emerald-200 shadow-2xs hover:shadow-xs transition-shadow space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
              {isRTL ? "صافي الربح النهائي" : "Final Net Profit"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className={`text-2xl font-black font-mono ${grandTotalNetProfit >= 0 ? "text-emerald-800" : "text-rose-600"}`}>
              {grandTotalNetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-emerald-600">{isRTL ? "ج.م" : "EGP"}</span>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300/60">
            <span>{isRTL ? `هامش الصافي: ${overallMarginPct}%` : `Net Margin: ${overallMarginPct}%`}</span>
          </div>
        </Card>
      </div>

      {/* ── 4. CLIENT P&L BREAKDOWN TABLE ── */}
      <Card className="shadow-2xs overflow-hidden border border-gray-200/90 bg-white">
        <CardHeader className="bg-gray-50/95 border-b border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#C45B2A]" />
              <span>{isRTL ? "جدول كشف حسابات ومصروفات العملاء" : "Client Profitability & Cost Breakdown"}</span>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              {isRTL
                ? "تفصيل أعداد الشحنات، التكلفة، المبيعات، مصاريف النقل، والمصاريف الإضافية لكل عميل"
                : "Itemized breakdown of shipment volumes, cost, sales, transport, and net profit per client account"}
            </CardDescription>
          </div>
          <Badge variant="brand" size="sm" className="font-mono bg-[#C45B2A] self-start sm:self-auto">
            {clientPnlRows.length} {isRTL ? "عميل" : "Clients"}
          </Badge>
        </CardHeader>

        <div className="overflow-x-auto w-full">
          <Table className="w-full min-w-[1050px] border-collapse text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50/95 text-gray-700 uppercase font-black border-b border-gray-200 select-none">
                <TableHead className="font-black text-gray-700 text-start py-3.5 px-4">{isRTL ? "اسم العميل" : "Client Name"}</TableHead>
                <TableHead className="font-black text-gray-700 text-center py-3.5 px-4">{isRTL ? "عدد الشحنات" : "Shipments"}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{isRTL ? "إجمالي التكلفة (EGP)" : "Total Cost (EGP)"}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{isRTL ? "إجمالي المبيعات (EGP)" : "Total Sales (EGP)"}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{isRTL ? "مصاريف النقل (EGP)" : "Transport Exp"}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{isRTL ? "مصاريف إضافية (EGP)" : "Extra Exp"}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{isRTL ? "صافي الربح (EGP)" : "Client Net Profit"}</TableHead>
                <TableHead className="font-black text-gray-700 text-center py-3.5 px-4">{isRTL ? "هامش الربح" : "Margin %"}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {clientPnlRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-gray-500">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <Package className="h-6 w-6" />
                    </div>
                    <p className="text-base font-bold text-gray-900">{isRTL ? "لا توجد سجلات مالية للشهر المحدد" : "No client financial records found"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL ? "يرجى تغيير الشهر أو السنة من الفلاتر بالأعلى." : "Please adjust the month or year filters above."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                clientPnlRows.map((r, idx) => {
                  const isProfit = r.netProfit >= 0;
                  const marginPct = r.totalSales > 0 ? ((r.netProfit / r.totalSales) * 100).toFixed(1) : "0";

                  return (
                    <TableRow key={r.clientName} className="hover:bg-orange-50/20 transition-colors border-b border-gray-100">
                      {/* 1. اسم العميل */}
                      <TableCell className="font-extrabold text-gray-900 whitespace-nowrap text-start py-3.5 px-4">
                        {r.clientName}
                      </TableCell>

                      {/* 2. عدد الشحنات (Integer format without .00) */}
                      <TableCell className="font-mono font-bold text-center text-gray-800 whitespace-nowrap py-3.5 px-4">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-black">
                          {r.shipmentCount}
                        </span>
                      </TableCell>

                      {/* 3. إجمالي التكلفة */}
                      <TableCell className="font-mono text-end text-gray-700 whitespace-nowrap py-3.5 px-4" dir="ltr">
                        {r.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      {/* 4. إجمالي المبيعات */}
                      <TableCell className="font-mono font-black text-end text-gray-900 whitespace-nowrap py-3.5 px-4" dir="ltr">
                        {r.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      {/* 5. مصاريف النقل */}
                      <TableCell className="font-mono text-end text-gray-500 whitespace-nowrap py-3.5 px-4" dir="ltr">
                        {r.transExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      {/* 6. مصاريف إضافية */}
                      <TableCell className="font-mono text-end text-gray-500 whitespace-nowrap py-3.5 px-4" dir="ltr">
                        {r.extraExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      {/* 7. صافي ربح العميل */}
                      <TableCell className={`font-mono font-black text-end whitespace-nowrap py-3.5 px-4 ${isProfit ? "text-emerald-700" : "text-rose-600"}`} dir="ltr">
                        {isProfit ? "+" : ""}{r.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      {/* 8. هامش الربح */}
                      <TableCell className="text-center whitespace-nowrap py-3.5 px-4" dir="ltr">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          isProfit
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}>
                          {marginPct}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>

            {/* ── Table Footer Summary Row ── */}
            {clientPnlRows.length > 0 && (
              <TableFooter className="bg-[#251516] text-white font-bold border-t-2 border-[#C45B2A]">
                <TableRow className="bg-[#251516] hover:bg-[#251516] text-white font-bold">
                  {/* Col 1: اسم العميل / المجموع الكلي */}
                  <TableCell className="font-black text-white text-start whitespace-nowrap py-4 px-4 text-xs">
                    {isRTL ? "المجموع الكلي الإجمالي" : "Grand Total"}
                  </TableCell>

                  {/* Col 2: عدد الشحنات (Integer) */}
                  <TableCell className="font-mono font-black text-white text-center whitespace-nowrap py-4 px-4 text-xs">
                    {totalShipmentsCount}
                  </TableCell>

                  {/* Col 3: إجمالي التكلفة */}
                  <TableCell className="font-mono font-bold text-gray-200 text-end whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    {sumTotalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Col 4: إجمالي المبيعات */}
                  <TableCell className="font-mono font-black text-[#F6AD55] text-end whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    {grandTotalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Col 5: مصاريف النقل */}
                  <TableCell className="font-mono font-bold text-gray-200 text-end whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    {sumTransExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Col 6: مصاريف إضافية */}
                  <TableCell className="font-mono font-bold text-gray-200 text-end whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    {grandTotalGeneralExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Col 7: صافي ربح العميل */}
                  <TableCell className="font-mono font-black text-emerald-400 text-end whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    +{grandTotalNetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Col 8: نسبة الهامش الإجمالي */}
                  <TableCell className="font-mono font-black text-center whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                      {overallMarginPct}%
                    </span>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Card>

      {/* ── DEDICATED FORMAL PDF DOCUMENT (Rendered offscreen without scroll blowout, captured for PDF export) ── */}
      <div
        id="formal-pnl-pdf-report"
        style={{
          position: "fixed",
          left: "0",
          top: "0",
          zIndex: -9999,
          opacity: isDownloadingPdf ? 1 : 0,
          pointerEvents: "none",
          width: "1120px",
          backgroundColor: "#FFFFFF",
          color: "#111827",
          padding: "36px 40px",
          fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
          boxSizing: "border-box",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: "3px solid #C45B2A", paddingBottom: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img
                src="/assets/xspeed_logo_earth_wide.jpg"
                alt="XSPEED"
                style={{ height: "46px", width: "auto", objectFit: "contain" }}
              />
              <div>
                <h1 style={{ fontSize: "19px", fontWeight: "900", color: "#251516", margin: "0 0 3px 0", lineHeight: "1.2" }}>
                  {isRTL ? "كشف حساب الأرباح والمصروفات الشهرية" : "Monthly Profit & Expenses Financial Statement"}
                </h1>
                <p style={{ fontSize: "11px", color: "#6B7280", margin: 0, fontWeight: "600" }}>
                  XSPEED Express Logistics & Technology Solutions • Cairo Central Operations Hub
                </p>
              </div>
            </div>

            <div style={{ textAlign: isRTL ? "left" : "right", fontSize: "11px", color: "#374151", lineHeight: "1.6" }}>
              <div><strong style={{ color: "#251516" }}>{isRTL ? "تاريخ الإصدار:" : "Issue Date:"}</strong> {new Date().toLocaleDateString(isRTL ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
              <div><strong style={{ color: "#251516" }}>{isRTL ? "الفترة المالية:" : "Period:"}</strong> <span style={{ color: "#C45B2A", fontWeight: "bold" }}>{monthLabels[selectedMonth]} {selectedYear !== "all" ? selectedYear : ""}</span></div>
              <div><strong style={{ color: "#251516" }}>{isRTL ? "الحساب المستهدف:" : "Target Account:"}</strong> {selectedClient === "all" ? (isRTL ? "كافة العملاء (All Clients)" : "All Client Accounts") : selectedClient}</div>
            </div>
          </div>
        </div>

        {/* Executive Summary Financial Metrics */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#4B5563", marginBottom: "6px", textTransform: "uppercase" }}>
            {isRTL ? "ملخص المؤشرات المالية الإجمالية" : "Executive Financial Summary"}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ backgroundColor: "#251516", color: "#FFFFFF", fontSize: "11px", fontWeight: "bold" }}>
                <th style={{ padding: "8px 10px", border: "1px solid #382122" }}>{isRTL ? "إجمالي المبيعات المحصلة" : "Gross Billed Sales"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122" }}>{isRTL ? "إجمالي التكلفة المباشرة" : "Direct Carrier Costs"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122" }}>{isRTL ? "المصروفات العامة والتشغيل" : "General & Overhead"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122", backgroundColor: "#C45B2A" }}>{isRTL ? "صافي الربح الإجمالي" : "Net Profit & Margin"}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: "#F9FAFB", fontSize: "14px", fontWeight: "900", fontFamily: "monospace", color: "#111827" }}>
                <td style={{ padding: "10px", border: "1px solid #E5E7EB" }}>{grandTotalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: "10px", fontWeight: "normal", color: "#6B7280" }}>EGP</span></td>
                <td style={{ padding: "10px", border: "1px solid #E5E7EB" }}>{grandTotalDirectCosts.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: "10px", fontWeight: "normal", color: "#6B7280" }}>EGP</span></td>
                <td style={{ padding: "10px", border: "1px solid #E5E7EB" }}>{grandTotalGeneralExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: "10px", fontWeight: "normal", color: "#6B7280" }}>EGP</span></td>
                <td style={{ padding: "10px", border: "1px solid #E5E7EB", color: grandTotalNetProfit >= 0 ? "#047857" : "#DC2626", backgroundColor: "#ECFDF5" }}>
                  {grandTotalNetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: "10px", fontWeight: "bold" }}>({overallMarginPct}%)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Itemized Client P&L Table */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#4B5563", textTransform: "uppercase" }}>
              {isRTL ? "جدول كشف حسابات ومصروفات العملاء بالتفصيل" : "Itemized Client Profitability Ledger"}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#C45B2A" }}>
              {isRTL ? `إجمالي الحسابات: ${clientPnlRows.length} عميل | إجمالي الشحنات: ${totalShipmentsCount}` : `Total Accounts: ${clientPnlRows.length} | Shipments: ${totalShipmentsCount}`}
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "10.5px" }}>
            <thead>
              <tr style={{ backgroundColor: "#251516", color: "#FFFFFF", fontWeight: "bold" }}>
                <th style={{ padding: "8px 10px", border: "1px solid #382122", width: "23%", textAlign: isRTL ? "right" : "left" }}>{isRTL ? "اسم العميل / الحساب" : "Client Account"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122", width: "11%", textAlign: "center" }}>{isRTL ? "عدد الشحنات" : "Shipments"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122", width: "13%", textAlign: "right" }}>{isRTL ? "إجمالي التكلفة" : "Total Cost"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122", width: "14%", textAlign: "right" }}>{isRTL ? "إجمالي المبيعات" : "Total Sales"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122", width: "13%", textAlign: "right" }}>{isRTL ? "مصاريف النقل" : "Transport Exp"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122", width: "12%", textAlign: "right" }}>{isRTL ? "مصاريف إضافية" : "Extra Exp"}</th>
                <th style={{ padding: "8px 10px", border: "1px solid #382122", width: "14%", textAlign: "right" }}>{isRTL ? "صافي الربح" : "Net Margin"}</th>
              </tr>
            </thead>
            <tbody>
              {clientPnlRows.map((r, idx) => {
                const isProfit = r.netProfit >= 0;
                return (
                  <tr
                    key={r.clientName}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                      color: "#1F2937",
                    }}
                  >
                    <td style={{ padding: "6px 10px", border: "1px solid #E5E7EB", fontWeight: "bold", textAlign: isRTL ? "right" : "left" }}>{r.clientName}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #E5E7EB", textAlign: "center", fontFamily: "monospace" }}>{r.shipmentCount}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #E5E7EB", textAlign: "right", fontFamily: "monospace" }}>{r.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #E5E7EB", textAlign: "right", fontFamily: "monospace", fontWeight: "bold" }}>{r.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #E5E7EB", textAlign: "right", fontFamily: "monospace", color: "#4B5563" }}>{r.transExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #E5E7EB", textAlign: "right", fontFamily: "monospace", color: "#4B5563" }}>{r.extraExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #E5E7EB", textAlign: "right", fontFamily: "monospace", fontWeight: "bold", color: isProfit ? "#047857" : "#DC2626" }}>
                      {r.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#251516", color: "#FFFFFF", fontWeight: "bold", fontSize: "11px" }}>
                <td style={{ padding: "8px 10px", border: "1px solid #382122", textAlign: isRTL ? "right" : "left" }}>{isRTL ? "المجموع الكلي" : "Grand Total"}</td>
                <td style={{ padding: "8px 10px", border: "1px solid #382122", textAlign: "center", fontFamily: "monospace" }}>{totalShipmentsCount}</td>
                <td style={{ padding: "8px 10px", border: "1px solid #382122", textAlign: "right", fontFamily: "monospace" }}>{sumTotalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: "8px 10px", border: "1px solid #382122", textAlign: "right", fontFamily: "monospace", color: "#F6AD55" }}>{grandTotalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: "8px 10px", border: "1px solid #382122", textAlign: "right", fontFamily: "monospace" }}>{sumTransExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: "8px 10px", border: "1px solid #382122", textAlign: "right", fontFamily: "monospace" }}>{grandTotalGeneralExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: "8px 10px", border: "1px solid #382122", textAlign: "right", fontFamily: "monospace", color: "#34D399" }}>{grandTotalNetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Corporate Footer / Audit Stamp */}
        <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#6B7280" }}>
          <div>
            {isRTL ? "مستند كشف حساب رسمي صادر إلكترونياً ومعتمد من إدارة العمليات لشركة XSPEED Express." : "Official automated financial statement issued by XSPEED Express Operations Management."}
          </div>
          <div style={{ fontFamily: "monospace" }}>
            Ref: XS-REP-{selectedYear}{selectedMonth} • {new Date().toISOString().split("T")[0]}
          </div>
        </div>
      </div>
    </div>
  );
};
