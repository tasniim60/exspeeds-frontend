"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileSpreadsheet,
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
  Plus,
  Trash2,
  Receipt,
  Percent,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Shipment,
  Invoice,
  Customer,
  BusinessExpense,
  InvoiceLoss,
  AdminStorage,
  MASTER_FINANCIAL_ACCOUNTS,
  MASTER_AGENTS,
  MASTER_EXPENSE_ITEMS,
  MASTER_EXTRA_EXPENSES,
  MASTER_CLIENT_ACCOUNTS,
} from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface ReportsViewProps {
  shipments: Shipment[];
  invoices: Invoice[];
  customers: Customer[];
  invoiceLosses?: InvoiceLoss[];
  onAddInvoiceLoss?: (loss: InvoiceLoss) => void;
  onDeleteInvoiceLoss?: (id: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  shipments,
  invoices,
  customers,
  invoiceLosses,
  onAddInvoiceLoss,
  onDeleteInvoiceLoss,
}) => {
  const { t, isRTL } = useLanguage();

  // Filters State
  const [filterMode, setFilterMode] = useState<"preset" | "custom">("preset");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string>("all");

  // Currency & VAT State
  const [selectedCurrency, setSelectedCurrency] = useState<"EGP" | "USD">("EGP");
  const [usdExchangeRate, setUsdExchangeRate] = useState<number>(50.0);
  const [includeVat, setIncludeVat] = useState<boolean>(true);

  // Expense Management State
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [expenseNature, setExpenseNature] = useState<"general" | "shipment_extra">("general");
  const [expenseItem, setExpenseItem] = useState<string>(MASTER_EXPENSE_ITEMS[0]);
  const [customExpenseTitle, setCustomExpenseTitle] = useState<string>("");
  const [extraExpenseType, setExtraExpenseType] = useState<string>(MASTER_EXTRA_EXPENSES[0]);
  const [payingAccount, setPayingAccount] = useState<string>(MASTER_FINANCIAL_ACCOUNTS[0]);
  const [recorder, setRecorder] = useState<string>(MASTER_AGENTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("نقدي (كاش)");
  const [isClientSplit, setIsClientSplit] = useState<boolean>(false);
  const [allocatedClient, setAllocatedClient] = useState<string>(MASTER_CLIENT_ACCOUNTS[0] || "");
  const [linkedAwb, setLinkedAwb] = useState<string>("");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<BusinessExpense["category"]>("Rent & Facilities");
  const [expenseAmount, setExpenseAmount] = useState<string>("");
  const [expenseCurrency, setExpenseCurrency] = useState<"EGP" | "USD">("EGP");
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [expenseReceipt, setExpenseReceipt] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");

  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Load expenses on mount
  // Invoice Losses State
  const [localInvoiceLosses, setLocalInvoiceLosses] = useState<InvoiceLoss[]>([]);
  const [isAddLossOpen, setIsAddLossOpen] = useState<boolean>(false);
  const [lossAwb, setLossAwb] = useState("");
  const [lossOriginalDate, setLossOriginalDate] = useState("");
  const [lossClient, setLossClient] = useState("");
  const [lossAmount, setLossAmount] = useState("");
  const [lossCurrency, setLossCurrency] = useState<"EGP" | "USD">("EGP");
  const [lossReason, setLossReason] = useState("");
  const [lossPayingAccount, setLossPayingAccount] = useState(MASTER_FINANCIAL_ACCOUNTS[0] || "CIB account");
  const [lossRecorder, setLossRecorder] = useState(MASTER_AGENTS[0] || "مصطفي");
  const [lossDate, setLossDate] = useState(new Date().toISOString().split("T")[0]);
  const [lossNotes, setLossNotes] = useState("");

  // Load expenses and invoice losses on mount
  useEffect(() => {
    setExpenses(AdminStorage.getExpenses());
    setLocalInvoiceLosses(AdminStorage.getInvoiceLosses());
  }, []);

  const activeInvoiceLosses = invoiceLosses && invoiceLosses.length > 0 ? invoiceLosses : localInvoiceLosses;

  // Helper currency conversion
  const convertAmount = (amountInEgp: number): number => {
    if (selectedCurrency === "USD") {
      return amountInEgp / (usdExchangeRate || 50.0);
    }
    return amountInEgp;
  };

  const formatCurrency = (amountInEgp: number): string => {
    const val = convertAmount(amountInEgp);
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const currencySymbol = selectedCurrency === "EGP" ? (isRTL ? "ج.م" : "EGP") : "$";

  // Month Labels Mapping
  const monthLabels: Record<string, string> = {
    all: isRTL ? "جميع الشهور" : "All Months",
    "1": isRTL ? "يناير" : "January",
    "2": isRTL ? "فبراير" : "February",
    "3": isRTL ? "مارس" : "March",
    "4": isRTL ? "أبريل" : "April",
    "5": isRTL ? "مايو" : "May",
    "6": isRTL ? "يونيو" : "June",
    "7": isRTL ? "يوليو" : "July",
    "8": isRTL ? "أغسطس" : "August",
    "9": isRTL ? "سبتمبر" : "September",
    "10": isRTL ? "أكتوبر" : "October",
    "11": isRTL ? "نوفمبر" : "November",
    "12": isRTL ? "ديسمبر" : "December",
  };

  // Get unique client account names for filter dropdown
  const clientOptions = useMemo(() => {
    const set = new Set<string>();
    shipments.forEach((s) => {
      const name = s.account || s.company;
      if (name) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [shipments]);

  // Date Check Helper
  const isDateInFilter = (dateStr?: string) => {
    if (!dateStr) return true;
    if (filterMode === "custom") {
      if (!startDate && !endDate) return true;
      const d = new Date(dateStr).getTime();
      if (startDate && d < new Date(startDate).getTime()) return false;
      if (endDate && d > new Date(endDate + "T23:59:59").getTime()) return false;
      return true;
    } else {
      // Preset Month & Year check
      const parts = dateStr.split(/[-/]/);
      if (parts.length >= 2) {
        let y = parts[0];
        let m = parseInt(parts[1], 10).toString();
        // Handle d/m/y format fallback
        if (parts[0].length <= 2 && parts[2]?.length === 4) {
          y = parts[2];
          m = parseInt(parts[0], 10).toString();
        }
        if (selectedYear !== "all" && y !== selectedYear) return false;
        if (selectedMonth !== "all" && m !== selectedMonth) return false;
      }
      return true;
    }
  };

  // Filter shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (!isDateInFilter(s.date)) return false;

      // Client check
      if (selectedClient !== "all") {
        const acc = (s.account || s.company || "").trim().toLowerCase();
        if (acc !== selectedClient.trim().toLowerCase()) return false;
      }

      return true;
    });
  }, [shipments, filterMode, selectedMonth, selectedYear, startDate, endDate, selectedClient]);

  // Filter general expenses by active date range
  // Filter Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => isDateInFilter(e.date));
  }, [expenses, filterMode, selectedMonth, selectedYear, startDate, endDate]);

  // Unique list of clients for filter dropdown
  const uniqueClients = useMemo(() => {
    const set = new Set<string>();
    shipments.forEach((s) => {
      const c = (s.account || s.company || "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [shipments]);

  // Aggregate Client P&L Statistics
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

  // Financial Totals
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

  // General Expenses: Real sum of recorded operational expenses in EGP
  const grandTotalGeneralExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => {
      const inEgp = e.currency === "USD" ? e.amount * (usdExchangeRate || 50) : e.amount;
      return acc + inEgp;
    }, 0);
  }, [filteredExpenses, usdExchangeRate]);

  // AWB-Attributed Invoice Losses: Deducted from P&L based on original AWB shipment date
  const attributedInvoiceLosses = useMemo(() => {
    const awbSet = new Set(filteredShipments.map((s) => s.awb));
    return activeInvoiceLosses.filter((loss) => {
      if (loss.awb && awbSet.has(loss.awb)) return true;
      const dateToCheck = loss.shipmentDate || loss.lossDate;
      if (!dateToCheck) return false;
      if (filterMode === "preset") {
        if (selectedYear !== "all" && !dateToCheck.startsWith(selectedYear)) return false;
        if (selectedMonth !== "all") {
          const parts = dateToCheck.split("-");
          const m = parts[1];
          const targetM = selectedMonth.padStart(2, "0");
          if (m !== targetM && m !== selectedMonth) return false;
        }
        return true;
      } else {
        if (startDate && dateToCheck < startDate) return false;
        if (endDate && dateToCheck > endDate) return false;
        return true;
      }
    });
  }, [activeInvoiceLosses, filteredShipments, filterMode, selectedMonth, selectedYear, startDate, endDate]);

  const grandTotalInvoiceLosses = useMemo(() => {
    return attributedInvoiceLosses.reduce((acc, l) => {
      const inEgp = l.currency === "USD" ? l.lossAmount * (usdExchangeRate || 50) : l.lossAmount;
      return acc + inEgp;
    }, 0);
  }, [attributedInvoiceLosses, usdExchangeRate]);

  // 14% VAT
  const vatAmount = useMemo(() => {
    if (!includeVat) return 0;
    return grandTotalSales * 0.14;
  }, [grandTotalSales, includeVat]);

  // Final Net Profit = Total Revenue - (Direct Costs + Recorded Expenses + Attributed Invoice Losses + VAT)
  const grandTotalNetProfit = useMemo(() => {
    return (
      grandTotalSales -
      grandTotalDirectCosts -
      grandTotalGeneralExpenses -
      grandTotalInvoiceLosses -
      vatAmount
    );
  }, [
    grandTotalSales,
    grandTotalDirectCosts,
    grandTotalGeneralExpenses,
    grandTotalInvoiceLosses,
    vatAmount,
  ]);

  const totalShipmentsCount = useMemo(() => {
    return clientPnlRows.reduce((acc, r) => acc + r.shipmentCount, 0);
  }, [clientPnlRows]);

  const overallMarginPct =
    grandTotalSales > 0 ? ((grandTotalNetProfit / grandTotalSales) * 100).toFixed(1) : "0";

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(expenseAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    let finalTitle = "";
    let finalCategory = expenseCategory;

    if (expenseNature === "general") {
      finalTitle = expenseItem === "أخرى" && customExpenseTitle.trim()
        ? customExpenseTitle.trim()
        : (customExpenseTitle.trim() || expenseItem);
    } else {
      finalTitle = `${extraExpenseType}${linkedAwb ? ` - ${isRTL ? "بوليصة" : "AWB"} ${linkedAwb}` : ""}`;
      finalCategory = "Customs & Port Demurrage";
    }

    if (!finalTitle.trim()) return;

    const newExp: BusinessExpense = {
      id: `exp-${Date.now()}`,
      title: finalTitle,
      category: finalCategory,
      amount: parsedAmount,
      currency: expenseCurrency,
      date: expenseDate || new Date().toISOString().split("T")[0],
      notes: expenseNotes.trim() || undefined,
      receiptNumber: expenseReceipt.trim() || undefined,
      payingAccount: payingAccount,
      recorder: recorder,
      paymentMethod: paymentMethod,
      allocatedClient: (expenseNature === "shipment_extra" || isClientSplit) ? allocatedClient : undefined,
      linkedAwb: expenseNature === "shipment_extra" && linkedAwb ? linkedAwb : undefined,
      expenseNature: expenseNature,
    };

    AdminStorage.addExpense(newExp);
    setExpenses(AdminStorage.getExpenses());
    setIsAddExpenseOpen(false);

    // Reset Form
    setExpenseTitle("");
    setCustomExpenseTitle("");
    setExpenseAmount("");
    setExpenseReceipt("");
    setExpenseNotes("");
    setIsClientSplit(false);
    setLinkedAwb("");
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذا المصروف؟" : "Delete this expense record?")) {
      AdminStorage.deleteExpense(id);
      setExpenses(AdminStorage.getExpenses());
    }
  };

  const handleLossAwbChange = (val: string) => {
    setLossAwb(val);
    const trimmed = val.trim().toLowerCase();
    if (trimmed) {
      const found = shipments.find((s) => s.awb.toLowerCase() === trimmed);
      if (found) {
        if (found.date) setLossOriginalDate(found.date);
        const cl = found.account || found.company;
        if (cl) setLossClient(cl);
      }
    }
  };

  const handleAddInvoiceLoss = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(lossAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newLoss: InvoiceLoss = {
      id: `loss-${Date.now()}`,
      awb: lossAwb.trim() || "",
      shipmentDate: lossOriginalDate || lossDate,
      clientName: lossClient.trim() || "",
      lossAmount: amountNum,
      currency: lossCurrency,
      lossDate: lossDate,
      reason: lossReason.trim() || "damage",
      status: "deducted",
      recordedBy: lossRecorder,
      notes: lossNotes.trim() || undefined,
    };

    if (onAddInvoiceLoss) {
      onAddInvoiceLoss(newLoss);
    } else {
      AdminStorage.addInvoiceLoss(newLoss);
      setLocalInvoiceLosses(AdminStorage.getInvoiceLosses());
    }

    setIsAddLossOpen(false);
    setLossAwb("");
    setLossOriginalDate("");
    setLossClient("");
    setLossAmount("");
    setLossReason("");
    setLossNotes("");
  };

  const handleDeleteInvoiceLoss = (id: string) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف خسارة الفاتورة هذه؟" : "Delete this invoice loss?")) {
      if (onDeleteInvoiceLoss) {
        onDeleteInvoiceLoss(id);
      } else {
        AdminStorage.deleteInvoiceLoss(id);
        setLocalInvoiceLosses(AdminStorage.getInvoiceLosses());
      }
    }
  };

  const handleResetFilters = () => {
    setFilterMode("preset");
    setSelectedMonth("all");
    setSelectedYear("2026");
    setStartDate("");
    setEndDate("");
    setSelectedClient("all");
  };

  const hasActiveFilters =
    filterMode === "custom"
      ? Boolean(startDate || endDate || selectedClient !== "all")
      : selectedMonth !== "all" || selectedYear !== "all" || selectedClient !== "all";

  const nowFormattedDate = useMemo(() => {
    return new Date().toLocaleDateString(isRTL ? "ar-EG-u-nu-latn" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [isRTL]);

  const nowFormattedTime = useMemo(() => {
    return new Date().toLocaleTimeString(isRTL ? "ar-EG-u-nu-latn" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [isRTL]);

  const docRefCode = useMemo(() => {
    const y = selectedYear !== "all" ? selectedYear : "ALL";
    const m = selectedMonth !== "all" ? selectedMonth.padStart(2, "0") : "ALL";
    return `XS-FIN-${y}-${m}`;
  }, [selectedYear, selectedMonth]);

  // Native Microsoft Excel (.xlsx) Export Handler
  const handleExportExcel = async () => {
    if (isExportingExcel) return;
    try {
      setIsExportingExcel(true);
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      const periodLabel =
        filterMode === "custom"
          ? `${startDate || "START"} to ${endDate || "NOW"}`
          : `${monthLabels[selectedMonth]} ${selectedYear !== "all" ? selectedYear : ""}`.trim();
      const accountScopeLabel =
        selectedClient === "all"
          ? isRTL
            ? "كافة حسابات العملاء"
            : "All Client Accounts"
          : selectedClient;

      // SHEET 1: Client Ledger
      const ledgerHeaders: string[] = [
        isRTL ? "م" : "#",
        isRTL ? "اسم العميل / الحساب" : "Client Account Name",
        isRTL ? "عدد الشحنات" : "Shipments Count",
        `${isRTL ? "إجمالي التكلفة" : "Total Cost"} (${selectedCurrency})`,
        `${isRTL ? "إجمالي المبيعات" : "Total Sales"} (${selectedCurrency})`,
        `${isRTL ? "مصاريف النقل" : "Transport Exp"} (${selectedCurrency})`,
        `${isRTL ? "صافي ربح العميل" : "Client Net Profit"} (${selectedCurrency})`,
        isRTL ? "نسبة هامش الربح" : "Profit Margin %",
      ];

      const ledgerRows: (string | number)[][] = [ledgerHeaders];

      clientPnlRows.forEach((r, idx) => {
        const margin = r.totalSales > 0 ? ((r.netProfit / r.totalSales) * 100).toFixed(1) + "%" : "0%";
        ledgerRows.push([
          idx + 1,
          r.clientName,
          r.shipmentCount,
          Number(convertAmount(r.totalCost).toFixed(2)),
          Number(convertAmount(r.totalSales).toFixed(2)),
          Number(convertAmount(r.transExpense).toFixed(2)),
          Number(convertAmount(r.netProfit).toFixed(2)),
          margin,
        ]);
      });

      ledgerRows.push([
        isRTL ? "المجموع الكلي" : "Total",
        isRTL ? "المجموع الكلي الإجمالي" : "Consolidated Grand Total",
        totalShipmentsCount,
        Number(convertAmount(sumTotalCost).toFixed(2)),
        Number(convertAmount(grandTotalSales).toFixed(2)),
        Number(convertAmount(sumTransExpense).toFixed(2)),
        Number(convertAmount(grandTotalNetProfit).toFixed(2)),
        `${overallMarginPct}%`,
      ]);

      const wsLedger = XLSX.utils.aoa_to_sheet(ledgerRows);
      XLSX.utils.book_append_sheet(wb, wsLedger, isRTL ? "كشف حسابات العملاء" : "Client Accounts P&L");

      // SHEET 2: General Expenses
      const expHeaders = [
        isRTL ? "م" : "#",
        isRTL ? "بند المصروف" : "Expense Title",
        isRTL ? "التصنيف" : "Category",
        isRTL ? "التاريخ" : "Date",
        isRTL ? "رقم الإيصال" : "Receipt No",
        `${isRTL ? "المبلغ" : "Amount"} (${selectedCurrency})`,
        isRTL ? "ملاحظات" : "Notes",
      ];
      const expRows: (string | number)[][] = [expHeaders];
      filteredExpenses.forEach((e, idx) => {
        const amtInSelected =
          e.currency === selectedCurrency
            ? e.amount
            : selectedCurrency === "USD"
            ? e.amount / usdExchangeRate
            : e.amount * usdExchangeRate;
        expRows.push([
          idx + 1,
          e.title,
          e.category,
          e.date,
          e.receiptNumber || "-",
          Number(amtInSelected.toFixed(2)),
          e.notes || "-",
        ]);
      });
      const wsExp = XLSX.utils.aoa_to_sheet(expRows);
      XLSX.utils.book_append_sheet(wb, wsExp, isRTL ? "سجل المصروفات العامة" : "General Expenses");

      // Set Right-to-Left (RTL) for Arabic sheets
      wb.Workbook = { Views: [{ RTL: isRTL }] };

      const fileName = `XSPEED_Financial_Report_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Excel generation error:", error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Direct High-Resolution Corporate PDF Generator
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
        windowWidth: 1300,
        onclone: (clonedDoc) => {
          clonedDoc.body.style.background = "#FFFFFF";
          const el = clonedDoc.getElementById("formal-pnl-pdf-report");
          if (el) {
            el.style.position = "static";
            el.style.left = "0px";
            el.style.top = "0px";
            el.style.display = "block";
            el.style.visibility = "visible";
            el.style.opacity = "1";
          }
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      pdf.save(`XSPEED_Financial_Report_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── 1. HEADER & ACTION TOOLBAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-950">
              {isRTL ? "التقرير المالي وصافي الأرباح والمصروفات" : "Financial Profit & Loss Statement"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isRTL
                ? "حسابات دقيقة: صافي الربح = الإيرادات - (التكاليف المباشرة + المصروفات المسجلة + ضريبة القيمة المضافة 14%)"
                : "Real Accounting: Net Profit = Revenue - (Direct Costs + General Expenses + 14% VAT)"}
            </p>
          </div>
        </div>

        {/* Currency Toggle & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Currency Toggle Pill */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedCurrency("EGP")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCurrency === "EGP" ? "bg-white text-brand-orange shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isRTL ? "جنيه (EGP)" : "EGP"}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCurrency === "USD" ? "bg-white text-brand-orange shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              USD ($)
            </button>
          </div>

          {/* Add Expense Button */}
          <Button
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
            className="h-10 px-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs gap-1.5 rounded-xl cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>{isRTL ? "تسجيل مصروف جديد" : "Add Expense"}</span>
          </Button>

          {/* Add Invoice Loss Button */}
          <Button
            size="sm"
            onClick={() => setIsAddLossOpen(true)}
            className="h-10 px-3.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs gap-1.5 rounded-xl cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-rose-200" />
            <span>{isRTL ? "تسجيل خسارة فاتورة (AWB)" : "Record Invoice Loss"}</span>
          </Button>

          {/* Microsoft Excel (.xlsx) Export */}
          <Button
            size="sm"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="h-10 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 rounded-xl cursor-pointer disabled:opacity-70 shadow-2xs transition-colors"
          >
            {isExportingExcel ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-emerald-200" />
            )}
            <span>{isRTL ? "تصدير إكسل" : "Export Excel"}</span>
          </Button>

          {/* Official PDF Statement */}
          <Button
            size="sm"
            disabled={isDownloadingPdf}
            onClick={handleExportPdf}
            className="h-10 px-3.5 bg-[#C45B2A] hover:bg-[#A34920] text-white font-bold text-xs gap-1.5 rounded-xl cursor-pointer disabled:opacity-70 shadow-2xs transition-colors"
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <FileDown className="h-4 w-4 text-orange-200" />
            )}
            <span>{isRTL ? "تحميل PDF" : "Download PDF"}</span>
          </Button>
        </div>
      </div>

      {/* ── 2. FILTER CONTROLS TOOLBAR ── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-700">
            {/* Filter Mode Switch */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setFilterMode("preset")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterMode === "preset" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {isRTL ? "فترة شهرية / سنوية" : "Month / Year"}
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("custom")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterMode === "custom" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {isRTL ? "تاريخ مخصص (Custom Range)" : "Custom Date Range"}
              </button>
            </div>

            {filterMode === "preset" ? (
              <>
                {/* الشهر */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{isRTL ? "الشهر:" : "Month:"}</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-10 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 rounded-xl px-3 outline-none cursor-pointer"
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
                </div>

                {/* السنة */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{isRTL ? "السنة:" : "Year:"}</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="h-10 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 rounded-xl px-3 outline-none cursor-pointer"
                  >
                    <option value="all">{isRTL ? "جميع السنين" : "All Years"}</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </>
            ) : (
              /* Custom Date Range Picker */
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">{isRTL ? "من:" : "From:"}</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 rounded-xl px-3 outline-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">{isRTL ? "إلى:" : "To:"}</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 rounded-xl px-3 outline-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* حساب العميل */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{isRTL ? "العميل:" : "Client:"}</span>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="h-10 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 rounded-xl px-3 outline-none cursor-pointer max-w-[180px]"
              >
                <option value="all">{isRTL ? "جميع العملاء" : "All Clients"}</option>
                {clientOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetFilters}
                className="h-10 px-3 text-xs font-bold border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRTL ? "إعادة ضبط" : "Reset"}</span>
              </Button>
            )}
          </div>

          {/* VAT Toggle & Summary */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={includeVat}
                onChange={(e) => setIncludeVat(e.target.checked)}
                className="rounded text-[#C45B2A] focus:ring-[#C45B2A] w-4 h-4 cursor-pointer"
              />
              <span>{isRTL ? "خصم ضريبة القيمة المضافة (VAT 14%)" : "Deduct 14% VAT"}</span>
            </label>

            <div className="flex items-center gap-2 text-xs text-gray-700 font-bold bg-orange-50/80 px-3.5 py-2 rounded-xl border border-orange-200/80 shadow-2xs">
              <Filter className="h-3.5 w-3.5 text-[#C45B2A]" />
              <span>
                {filteredShipments.length} {isRTL ? "شحنة" : "Shipments"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. EXECUTIVE FINANCIAL SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. إجمالي المبيعات */}
        <Card className="p-4 bg-white border border-gray-200/90 shadow-2xs space-y-1.5 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {isRTL ? "إجمالي الإيرادات" : "Gross Revenue"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-xl sm:text-2xl font-black font-mono text-gray-950">
              {formatCurrency(grandTotalSales)}
            </span>
            <span className="text-xs font-bold text-gray-500">{currencySymbol}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {isRTL ? "إجمالي الفواتير المحصلة" : "Gross billed client revenue"}
          </p>
        </Card>

        {/* 2. التكلفة المباشرة */}
        <Card className="p-4 bg-white border border-gray-200/90 shadow-2xs space-y-1.5 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {isRTL ? "التكلفة المباشرة" : "Direct Carrier Costs"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-xl sm:text-2xl font-black font-mono text-gray-800">
              {formatCurrency(grandTotalDirectCosts)}
            </span>
            <span className="text-xs font-bold text-gray-500">{currencySymbol}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {isRTL ? "تكاليف الناقلين ومصاريف النقل" : "Freight lines & trans expenses"}
          </p>
        </Card>

        {/* 3. المصروفات التشغيلية */}
        <Card className="p-4 bg-white border border-gray-200/90 shadow-2xs space-y-1.5 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {isRTL ? "المصروفات المسجلة" : "General Expenses"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-xl sm:text-2xl font-black font-mono text-gray-800">
              {formatCurrency(grandTotalGeneralExpenses)}
            </span>
            <span className="text-xs font-bold text-gray-500">{currencySymbol}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {filteredExpenses.length} {isRTL ? "مصروف مسجل فعلياً" : "Recorded items"}
          </p>
        </Card>

        {/* 4. ضريبة القيمة المضافة 14% */}
        {/* 4. خسائر الفواتير المنسوبة للبوالص */}
        <Card className="p-4 bg-white border border-gray-200/90 shadow-2xs space-y-1.5 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {isRTL ? "خسائر فواتير منسوبة" : "Invoice Losses"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-600">
              {grandTotalInvoiceLosses > 0 ? `-${formatCurrency(grandTotalInvoiceLosses)}` : "0.00"}
            </span>
            <span className="text-xs font-bold text-gray-500">{currencySymbol}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {attributedInvoiceLosses.length} {isRTL ? "خسارة منسوبة لتاريخ الشحنة" : "Attributed to AWBs"}
          </p>
        </Card>

        {/* 5. ضريبة القيمة المضافة 14% */}
        <Card className="p-4 bg-white border border-gray-200/90 shadow-2xs space-y-1.5 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {isRTL ? "ضريبة القيمة المضافة" : "VAT (14%)"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-xl sm:text-2xl font-black font-mono text-gray-800">
              {formatCurrency(vatAmount)}
            </span>
            <span className="text-xs font-bold text-gray-500">{currencySymbol}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {includeVat ? (isRTL ? "14% مستقطعة قانونياً" : "14% Deducted") : (isRTL ? "غير مخصومة" : "Excluded")}
          </p>
        </Card>

        {/* 6. صافي الربح النهائي */}
        <Card
          className={`p-4 col-span-2 sm:col-span-1 shadow-2xs space-y-1.5 text-start border ${
            grandTotalNetProfit >= 0
              ? "bg-emerald-50/70 border-emerald-300"
              : "bg-rose-50/70 border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                grandTotalNetProfit >= 0 ? "text-emerald-900" : "text-rose-900"
              }`}
            >
              {isRTL ? "صافي الربح الفعلي" : "Net Profit"}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                grandTotalNetProfit >= 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span
              className={`text-2xl font-black font-mono ${
                grandTotalNetProfit >= 0 ? "text-emerald-800" : "text-rose-700"
              }`}
            >
              {grandTotalNetProfit >= 0 ? "+" : ""}
              {formatCurrency(grandTotalNetProfit)}
            </span>
            <span
              className={`text-xs font-bold ${
                grandTotalNetProfit >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {currencySymbol}
            </span>
          </div>
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md border ${
              grandTotalNetProfit >= 0
                ? "text-emerald-800 bg-emerald-100 border-emerald-300"
                : "text-rose-800 bg-rose-100 border-rose-300"
            }`}
          >
            <span>{isRTL ? `هامش الصافي: ${overallMarginPct}%` : `Net Margin: ${overallMarginPct}%`}</span>
          </div>
        </Card>
      </div>

      {/* ── 4. CLIENT P&L BREAKDOWN TABLE ── */}
      <Card className="shadow-2xs overflow-hidden border border-gray-200/90 bg-white">
        <CardHeader className="bg-gray-50/95 border-b border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#C45B2A]" />
              <span>{isRTL ? "جدول كشف حسابات ومصروفات العملاء" : "Client Profitability & Cost Breakdown"}</span>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              {isRTL
                ? "تفصيل أعداد الشحنات، التكلفة، المبيعات، مصاريف النقل، ومصافي أرباح كل عميل"
                : "Itemized breakdown of shipment volumes, cost, sales, transport, and net profit per client account"}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto w-full">
          <Table className="w-full min-w-[950px] border-collapse text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50/95 text-gray-700 uppercase font-black border-b border-gray-200 select-none">
                <TableHead className="font-black text-gray-700 text-start py-3.5 px-4">{isRTL ? "اسم العميل" : "Client Name"}</TableHead>
                <TableHead className="font-black text-gray-700 text-center py-3.5 px-4">{isRTL ? "عدد الشحنات" : "Shipments"}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{`${isRTL ? "التكلفة" : "Cost"} (${currencySymbol})`}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{`${isRTL ? "المبيعات" : "Sales"} (${currencySymbol})`}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{`${isRTL ? "النقل" : "Transport"} (${currencySymbol})`}</TableHead>
                <TableHead className="font-black text-gray-700 text-end py-3.5 px-4">{`${isRTL ? "صافي ربح العميل" : "Net Profit"} (${currencySymbol})`}</TableHead>
                <TableHead className="font-black text-gray-700 text-center py-3.5 px-4">{isRTL ? "هامش الربح" : "Margin %"}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {clientPnlRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <Package className="h-6 w-6" />
                    </div>
                    <p className="text-base font-bold text-gray-900">{isRTL ? "لا توجد سجلات مالية للشهر أو النطاق المحدد" : "No client financial records found"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL ? "يرجى تعديل الفلاتر أو تحديد فترة زمنية أخرى." : "Please adjust filter parameters above."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                clientPnlRows.map((r) => {
                  const isProfit = r.netProfit >= 0;
                  const marginPct = r.totalSales > 0 ? ((r.netProfit / r.totalSales) * 100).toFixed(1) : "0";

                  return (
                    <TableRow key={r.clientName} className="hover:bg-orange-50/20 transition-colors border-b border-gray-100">
                      <TableCell className="font-extrabold text-gray-900 whitespace-nowrap text-start py-3.5 px-4">
                        {r.clientName}
                      </TableCell>

                      <TableCell className="font-mono font-bold text-center text-gray-800 whitespace-nowrap py-3.5 px-4">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-black">
                          {r.shipmentCount}
                        </span>
                      </TableCell>

                      <TableCell className="font-mono text-end text-gray-700 whitespace-nowrap py-3.5 px-4" dir="ltr">
                        {formatCurrency(r.totalCost)}
                      </TableCell>

                      <TableCell className="font-mono text-end font-black text-gray-900 whitespace-nowrap py-3.5 px-4" dir="ltr">
                        {formatCurrency(r.totalSales)}
                      </TableCell>

                      <TableCell className="font-mono text-end text-gray-500 whitespace-nowrap py-3.5 px-4" dir="ltr">
                        {formatCurrency(r.transExpense)}
                      </TableCell>

                      <TableCell className={`font-mono font-black text-end whitespace-nowrap py-3.5 px-4 ${isProfit ? "text-emerald-700" : "text-rose-600"}`} dir="ltr">
                        {isProfit ? "+" : ""}{formatCurrency(r.netProfit)}
                      </TableCell>

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

            {clientPnlRows.length > 0 && (
              <TableFooter className="bg-[#251516] text-white font-bold border-t-2 border-[#C45B2A]">
                <TableRow className="group bg-[#251516] hover:bg-[#251516] hover:text-[#251516] text-white font-bold">
                  <TableCell className="font-black text-white group-hover:text-[#251516] text-start whitespace-nowrap py-4 px-4 text-xs">
                    {isRTL ? "المجموع الكلي الإجمالي" : "Consolidated Grand Total"}
                  </TableCell>

                  <TableCell className="font-mono font-black group-hover:text-[#251516] text-white text-center whitespace-nowrap py-4 px-6 text-xs">
                    {totalShipmentsCount}
                  </TableCell>

                  <TableCell className="font-mono font-bold text-gray-200 group-hover:text-[#251516] text-end whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    {formatCurrency(sumTotalCost)}
                  </TableCell>

                  <TableCell className="font-mono font-black text-gray-200 group-hover:text-[#251516] text-end whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    {formatCurrency(grandTotalSales)}
                  </TableCell>

                  <TableCell className="font-mono font-bold text-gray-200 group-hover:text-[#251516] text-end whitespace-nowrap py-4 px-4 text-xs" dir="ltr">
                    {formatCurrency(sumTransExpense)}
                  </TableCell>

                  <TableCell className={`font-mono font-black text-end whitespace-nowrap py-4 px-4 text-xs group-hover:text-[#251516] ${grandTotalNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`} dir="ltr">
                    {grandTotalNetProfit >= 0 ? "+" : ""}{formatCurrency(grandTotalNetProfit)}
                  </TableCell>

                  <TableCell className="font-mono font-black text-center whitespace-nowrap py-4 px-4 text-xs group-hover:text-[#251516]" dir="ltr">
                    <span className="bg-emerald-500/20 text-emerald-300 group-hover:text-[#251516] border border-emerald-500/40 px-2 py-0.5 rounded-md">
                      {overallMarginPct}%
                    </span>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Card>

      {/* ── 5. OPERATIONAL EXPENSES LEDGER TABLE ── */}
      <Card className="shadow-2xs overflow-hidden border border-gray-200/90 bg-white">
        <CardHeader className="bg-gray-50/95 border-b border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#C45B2A]" />
              <span>{isRTL ? "سجل المصروفات التشغيلية المباشرة والفرعية" : "Operational Expenses Ledger"}</span>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              {isRTL
                ? "سجل المصروفات الفعلية (إيجارات المستودعات، الوقود، التغليف، تراخيص نافذة، الصيانة)"
                : "Real recorded expenses factored into net profit calculation"}
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
            className="h-8 px-3 bg-[#C45B2A] hover:bg-[#A34920] text-white text-xs font-bold gap-1 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? "إضافة مصروف" : "Add Expense"}</span>
          </Button>
        </CardHeader>

        <div className="overflow-x-auto w-full">
          <Table className="w-full min-w-[850px] border-collapse text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50/95 text-gray-700 uppercase font-black border-b border-gray-200 select-none">
                <TableHead className="font-black text-start py-3.5 px-4">{isRTL ? "بند المصروف" : "Title / Expense"}</TableHead>
                <TableHead className="font-black text-start py-3.5 px-4">{isRTL ? "التصنيف والنوع" : "Category & Type"}</TableHead>
                <TableHead className="font-black text-start py-3.5 px-4">{isRTL ? "الخزنة / الحساب" : "Paying Account"}</TableHead>
                <TableHead className="font-black text-center py-3.5 px-4">{isRTL ? "المسجل" : "Recorder"}</TableHead>
                <TableHead className="font-black text-center py-3.5 px-4">{isRTL ? "العميل / البوليصة" : "Allocation / AWB"}</TableHead>
                <TableHead className="font-black text-center py-3.5 px-4">{isRTL ? "التاريخ والإيصال" : "Date & Receipt"}</TableHead>
                <TableHead className="font-black text-end py-3.5 px-4">{`${isRTL ? "المبلغ" : "Amount"} (${currencySymbol})`}</TableHead>
                <TableHead className="font-black text-center py-3.5 px-4">{isRTL ? "إجراء" : "Action"}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                    <p className="text-xs font-bold text-gray-600">
                      {isRTL ? "لا توجد مصروفات مسجلة لهذه الفترة." : "No recorded expenses for this period."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((exp) => {
                  const amtInSelected =
                    exp.currency === selectedCurrency
                      ? exp.amount
                      : selectedCurrency === "USD"
                      ? exp.amount / usdExchangeRate
                      : exp.amount * usdExchangeRate;

                  return (
                    <TableRow key={exp.id} className="hover:bg-gray-50/80 transition-colors">
                      <TableCell className="font-bold text-gray-900 py-3 px-4 text-start">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-gray-900">{exp.title}</p>
                          {exp.notes && <span className="block text-[10px] text-gray-400 font-normal">{exp.notes}</span>}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-start">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {exp.category}
                          </span>
                          {exp.expenseNature === "shipment_extra" ? (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {isRTL ? "رسم شحنة" : "Surcharge"}
                            </span>
                          ) : (
                            <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {isRTL ? "تشغيلي" : "General"}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-start">
                        <span className="font-mono text-xs font-semibold text-gray-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                          {exp.payingAccount || (isRTL ? "الخزنة العامة" : "General Treasury")}
                        </span>
                      </TableCell>

                      <TableCell className="font-bold text-xs text-center text-gray-700 py-3 px-4">
                        {exp.recorder || "-"}
                      </TableCell>

                      <TableCell className="text-center py-3 px-4">
                        {exp.linkedAwb || exp.allocatedClient ? (
                          <div className="space-y-0.5">
                            {exp.allocatedClient && (
                              <span className="block text-[11px] font-bold text-[#C45B2A]">
                                {exp.allocatedClient}
                              </span>
                            )}
                            {exp.linkedAwb && (
                              <span className="font-mono text-[10px] bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 ltr-preserve">
                                {exp.linkedAwb}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-center text-gray-600 py-3 px-4">
                        <span className="block">{exp.date}</span>
                        {exp.receiptNumber && (
                          <span className="block text-[10px] text-gray-400">{exp.receiptNumber}</span>
                        )}
                      </TableCell>

                      <TableCell className="font-mono font-bold text-end text-rose-700 py-3 px-4" dir="ltr">
                        -{amtInSelected.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell className="text-center py-2.5 px-4">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={isRTL ? "حذف المصروف" : "Delete Expense"}
                            aria-label={isRTL ? "حذف المصروف" : "Delete Expense"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* ── ADD EXPENSE MODAL ── */}
      {isAddExpenseOpen && (
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent className="max-w-lg w-full p-5 sm:p-6 text-start max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#C45B2A]" />
              <span>{isRTL ? "تسجيل مصروف جديد (مطابق لنظام السجلات)" : "Record Expense (Ledger System)"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isRTL
                ? "قيد المصروفات العامة أو الرسوم الإضافية للشحنات وتوزيعها على الخزن والعملاء."
                : "Record general overhead or extra shipment surcharges allocated to vaults and accounts."}
            </DialogDescription>

            {/* Nature Toggle */}
            <div className="flex rounded-xl bg-gray-100 p-1 mt-3 gap-1">
              <button
                type="button"
                onClick={() => setExpenseNature("general")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  expenseNature === "general"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {isRTL ? "مصروف عام (2_المصاريف_العامة)" : "General Overhead"}
              </button>
              <button
                type="button"
                onClick={() => setExpenseNature("shipment_extra")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  expenseNature === "shipment_extra"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {isRTL ? "مصاريف إضافية للشحنة (9_مصاريف)" : "Shipment Surcharge"}
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 pt-3">
              {expenseNature === "general" ? (
                /* General Expense Fields */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {isRTL ? "بند المصروف المعتمد" : "Expense Item"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={expenseItem}
                        onChange={(e) => setExpenseItem(e.target.value)}
                        className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                      >
                        {MASTER_EXPENSE_ITEMS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {isRTL ? "التصنيف المحاسبي" : "Accounting Category"}
                      </label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value as any)}
                        className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                      >
                        <option value="Rent & Facilities">{isRTL ? "إيجار ومرافق" : "Rent & Facilities"}</option>
                        <option value="Salaries & Operations">{isRTL ? "رواتب وتشغيل" : "Salaries & Operations"}</option>
                        <option value="Fuel & Linehaul">{isRTL ? "وقود ونقل" : "Fuel & Linehaul"}</option>
                        <option value="Packaging & Supplies">{isRTL ? "تغليف ومطبوعات" : "Packaging & Supplies"}</option>
                        <option value="Customs & Port Demurrage">{isRTL ? "رسوم جمارك وموانئ" : "Customs & Demurrage"}</option>
                        <option value="Software & Marketing">{isRTL ? "برمجيات وتسويق" : "Software & Marketing"}</option>
                        <option value="Other">{isRTL ? "أخرى" : "Other"}</option>
                      </select>
                    </div>
                  </div>

                  {expenseItem === "أخرى" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {isRTL ? "تفصيل بند المصروف المخصص" : "Custom Title"} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        value={customExpenseTitle}
                        onChange={(e) => setCustomExpenseTitle(e.target.value)}
                        placeholder={isRTL ? "اكتب اسم المصروف المخصص..." : "Enter custom title..."}
                        className="text-xs"
                      />
                    </div>
                  )}

                  {/* Client Split Checkbox & Select */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isClientSplit}
                        onChange={(e) => setIsClientSplit(e.target.checked)}
                        className="rounded text-[#C45B2A] focus:ring-[#C45B2A] h-4 w-4"
                      />
                      <span className="text-xs font-bold text-gray-800">
                        {isRTL ? "توزيع المصروف على حساب عميل (Client Split)" : "Allocate / Split to Client"}
                      </span>
                    </label>
                    {isClientSplit && (
                      <div>
                        <select
                          value={allocatedClient}
                          onChange={(e) => setAllocatedClient(e.target.value)}
                          className="w-full h-8 bg-white border border-amber-300 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                        >
                          {MASTER_CLIENT_ACCOUNTS.map((client) => (
                            <option key={client} value={client}>
                              {client}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Shipment Extra Surcharge Fields */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {isRTL ? "نوع الرسم الإضافي" : "Surcharge Type"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={extraExpenseType}
                        onChange={(e) => setExtraExpenseType(e.target.value)}
                        className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                      >
                        {MASTER_EXTRA_EXPENSES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {isRTL ? "رقم بوليصة الشحن (AWB)" : "Linked AWB"} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        value={linkedAwb}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLinkedAwb(val);
                          const m = shipments.find((s) => s.awb === val);
                          if (m && (m.account || m.company)) {
                            setAllocatedClient(m.account || m.company || "");
                          }
                        }}
                        placeholder="e.g. 875202433089"
                        className="font-mono text-xs uppercase ltr-preserve"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isRTL ? "العميل المرتبط بالشحنة" : "Allocated Client"}
                    </label>
                    <select
                      value={allocatedClient}
                      onChange={(e) => setAllocatedClient(e.target.value)}
                      className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                    >
                      {MASTER_CLIENT_ACCOUNTS.map((client) => (
                        <option key={client} value={client}>
                          {client}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Amount, Currency, Paying Account, Recorder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isRTL ? "المبلغ والعملة" : "Amount & Currency"} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1">
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="text-xs font-mono"
                    />
                    <select
                      value={expenseCurrency}
                      onChange={(e) => setExpenseCurrency(e.target.value as any)}
                      className="h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-1.5"
                    >
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isRTL ? "الخزنة / الحساب المسحوب منه" : "Paying Vault / Account"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={payingAccount}
                    onChange={(e) => setPayingAccount(e.target.value)}
                    className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
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
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isRTL ? "القائم بالصرف / المسجل" : "Recorder / Agent"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={recorder}
                    onChange={(e) => setRecorder(e.target.value)}
                    className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                  >
                    {MASTER_AGENTS.map((ag) => (
                      <option key={ag} value={ag}>
                        {ag}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isRTL ? "طريقة الدفع" : "Payment Method"}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                  >
                    <option value="نقدي (كاش)">{isRTL ? "نقدي (كاش)" : "Cash"}</option>
                    <option value="تحويل بنكي CIB">{isRTL ? "تحويل بنكي CIB" : "CIB Bank Wire"}</option>
                    <option value="محفظة إلكترونية">{isRTL ? "محفظة إلكترونية (Speedex Wallet)" : "Speedex Wallet"}</option>
                    <option value="بطاقة ائتمان">{isRTL ? "بطاقة ائتمان / خصم" : "Card"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isRTL ? "تاريخ الصرف" : "Date"}
                  </label>
                  <Input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isRTL ? "رقم الإيصال / السند" : "Receipt / Voucher No"}
                  </label>
                  <Input
                    value={expenseReceipt}
                    onChange={(e) => setExpenseReceipt(e.target.value)}
                    placeholder="REC-1002"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "البيان وملاحظات الصرف" : "Notes & Details"}
                </label>
                <Input
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder={isRTL ? "تفاصيل إضافية عن سبب الصرف..." : "Additional details..."}
                  className="text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddExpenseOpen(false)}
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" variant="brand" size="sm" className="font-bold">
                  {isRTL ? "حفظ وتثبيت المصروف" : "Save Expense"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── RECORD INVOICE LOSS DIALOG ── */}
      <Dialog open={isAddLossOpen} onOpenChange={setIsAddLossOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <RotateCcw className="w-4 h-4" />
            </div>
            <span>{isRTL ? "تسجيل خسارة فاتورة منسوبة لتاريخ الشحنة" : "Record AWB-Attributed Invoice Loss"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {isRTL
              ? "توثيق خسارة فاتورة وخصمها من أرباح الفترة المنسوبة لتاريخ الشحنة الأصلي (Section 2.7)"
              : "Attribute loss to original AWB shipment date and deduct from period P&L"}
          </DialogDescription>

          <form onSubmit={handleAddInvoiceLoss} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "رقم البوليصة (AWB)" : "AWB Number"}
                </label>
                <Input
                  value={lossAwb}
                  onChange={(e) => handleLossAwbChange(e.target.value)}
                  placeholder="e.g. 7466913646"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "تاريخ الشحنة الأصلي *" : "Original Date *"}
                </label>
                <Input
                  type="date"
                  required
                  value={lossOriginalDate}
                  onChange={(e) => setLossOriginalDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "حساب العميل" : "Client Account"}
                </label>
                <Input
                  value={lossClient}
                  onChange={(e) => setLossClient(e.target.value)}
                  placeholder="e.g. nour saied"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "مبلغ الخسارة *" : "Loss Amount *"}
                </label>
                <div className="flex gap-1.5">
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={lossAmount}
                    onChange={(e) => setLossAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-xs font-mono font-bold"
                  />
                  <select
                    value={lossCurrency}
                    onChange={(e) => setLossCurrency(e.target.value as any)}
                    className="h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-1.5"
                  >
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRTL ? "سبب الخسارة *" : "Loss Reason *"}
              </label>
              <Input
                required
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                placeholder={isRTL ? "فرق وزن مفاجئ من الناقل، غرامة جمركية، تعويض تلف..." : "Weight diff penalty, customs fine..."}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "الخزنة المسحوب منها" : "Paying Vault"}
                </label>
                <select
                  value={lossPayingAccount}
                  onChange={(e) => setLossPayingAccount(e.target.value)}
                  className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                >
                  {MASTER_FINANCIAL_ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRTL ? "المسؤول عن التسجيل" : "Recorded By"}
                </label>
                <select
                  value={lossRecorder}
                  onChange={(e) => setLossRecorder(e.target.value)}
                  className="w-full h-9 bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-2 cursor-pointer"
                >
                  {MASTER_AGENTS.map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRTL ? "ملاحظات إضافية" : "Additional Notes"}
              </label>
              <Input
                value={lossNotes}
                onChange={(e) => setLossNotes(e.target.value)}
                placeholder={isRTL ? "تفاصيل إضافية..." : "Notes..."}
                className="text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddLossOpen(false)}
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">
                {isRTL ? "حفظ وخصم الخسارة" : "Save & Deduct Loss"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DEDICATED FORMAL PDF DOCUMENT (Rendered offscreen) ── */}
      <div
        id="formal-pnl-pdf-report"
        style={{
          position: "fixed",
          left: "0",
          top: "0",
          zIndex: -9999,
          opacity: 0,
          pointerEvents: "none",
          width: "1260px",
          backgroundColor: "#FFFFFF",
          color: "#251516",
          padding: "36px 44px 30px 44px",
          fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
          boxSizing: "border-box",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <div style={{ height: "5px", background: "linear-gradient(90deg, #C45B2A 0%, #EA580C 50%, #251516 100%)", borderRadius: "4px", marginBottom: "20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "20px", marginBottom: "22px", borderBottom: "2px solid #E2E8F0" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "900", color: "#251516", lineHeight: "1.2", marginBottom: "4px" }}>
              {isRTL ? "شركة إكس سبيد لخدمات الشحن السريع واللوجستيات" : "XSPEED Express Freight & Logistics"}
            </div>
            <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#C45B2A", marginBottom: "2px" }}>
              {isRTL ? "الإدارة المالية المركزية • كشف حساب الأرباح والمصروفات" : "Central Finance Directorate • Profit & Loss Statement"}
            </div>
          </div>
          <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "10px 16px", minWidth: "280px", textAlign: isRTL ? "right" : "left", fontSize: "11px", lineHeight: "1.7" }}>
            <div><strong>{isRTL ? "المرجع:" : "Ref:"}</strong> {docRefCode}</div>
            <div><strong>{isRTL ? "التاريخ:" : "Date:"}</strong> {nowFormattedDate}</div>
            <div><strong>{isRTL ? "العملة:" : "Currency:"}</strong> {selectedCurrency}</div>
          </div>
        </div>

        {/* Top Metric Summary in PDF */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          <div style={{ padding: "12px", background: "#F1F5F9", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "bold" }}>{isRTL ? "إجمالي الإيرادات" : "Gross Revenue"}</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#251516", marginTop: "4px" }}>{formatCurrency(grandTotalSales)} {currencySymbol}</div>
          </div>
          <div style={{ padding: "12px", background: "#F1F5F9", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "bold" }}>{isRTL ? "التكلفة المباشرة" : "Direct Costs"}</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#251516", marginTop: "4px" }}>{formatCurrency(grandTotalDirectCosts)} {currencySymbol}</div>
          </div>
          <div style={{ padding: "12px", background: "#F1F5F9", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "bold" }}>{isRTL ? "المصروفات العامة" : "General Expenses"}</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#251516", marginTop: "4px" }}>{formatCurrency(grandTotalGeneralExpenses)} {currencySymbol}</div>
          </div>
          <div style={{ padding: "12px", background: grandTotalNetProfit >= 0 ? "#ECFDF5" : "#FEF2F2", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
            <div style={{ fontSize: "10px", color: grandTotalNetProfit >= 0 ? "#065F46" : "#991B1B", fontWeight: "bold" }}>{isRTL ? "صافي الربح" : "Net Profit"}</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: grandTotalNetProfit >= 0 ? "#047857" : "#B91C1C", marginTop: "4px" }}>
              {grandTotalNetProfit >= 0 ? "+" : ""}{formatCurrency(grandTotalNetProfit)} {currencySymbol}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
