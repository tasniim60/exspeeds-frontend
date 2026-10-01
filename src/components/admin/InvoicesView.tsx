"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  Plus,
  Search,
  Download,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Truck,
  Scale,
  DollarSign,
  FileSpreadsheet,
  Trash2,
  Edit3,
  Copy,
  Check,
  X,
  FileUp,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CarrierInvoiceItem, Shipment, Customer, Invoice } from "@/lib/adminData";
import { CARRIERS } from "@/lib/tracking";
import { useLanguage } from "@/context/LanguageContext";

export interface InvoicesViewProps {
  carrierInvoices?: CarrierInvoiceItem[];
  shipments?: Shipment[];
  onAddCarrierInvoice?: (item: CarrierInvoiceItem) => void;
  onAddCarrierInvoices?: (items: CarrierInvoiceItem[]) => void;
  onUpdateCarrierInvoice?: (id: string, patch: Partial<CarrierInvoiceItem>) => void;
  onDeleteCarrierInvoice?: (id: string) => void;
  // Optional backwards compatibility props
  invoices?: Invoice[];
  customers?: Customer[];
  onAddInvoice?: (inv: Invoice) => void;
  onUpdateInvoice?: (inv: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  carrierInvoices = [],
  shipments = [],
  onAddCarrierInvoice,
  onAddCarrierInvoices,
  onUpdateCarrierInvoice,
  onDeleteCarrierInvoice,
}) => {
  const { isRTL } = useLanguage();

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<string>("all");
  const [selectedCarrier, setSelectedCarrier] = useState<string>("all");
  const [diffFilter, setDiffFilter] = useState<"all" | "losses" | "matched" | "savings">("all");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarrierInvoiceItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Single Add / Edit Form State
  const [formAwb, setFormAwb] = useState("");
  const [formInvoiceNumber, setFormInvoiceNumber] = useState<string>(() => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [formCarrier, setFormCarrier] = useState("SMSA Express");
  const [formClientName, setFormClientName] = useState("");
  const [formBilledWeight, setFormBilledWeight] = useState("");
  const [formBilledCost, setFormBilledCost] = useState("");
  const [formSystemWeight, setFormSystemWeight] = useState("");
  const [formSystemCost, setFormSystemCost] = useState("");
  const [formShipmentStatus, setFormShipmentStatus] = useState("Delivered");
  const [formNotes, setFormNotes] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);

  // Bulk Paste State
  const [bulkRawText, setBulkRawText] = useState("");
  const [bulkDefaultInvoice, setBulkDefaultInvoice] = useState<string>(() => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [bulkDefaultCarrier, setBulkDefaultCarrier] = useState("SMSA Express");
  const [bulkPreview, setBulkPreview] = useState<CarrierInvoiceItem[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Copy AWB toast state
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  // Unique Invoice Numbers & Carriers for dropdown filters
  const uniqueInvoices = useMemo(() => {
    const s = new Set<string>();
    carrierInvoices.forEach((item) => {
      if (item.invoiceNumber) s.add(item.invoiceNumber);
    });
    return Array.from(s);
  }, [carrierInvoices]);

  const uniqueCarriers = useMemo(() => {
    const s = new Set<string>();
    carrierInvoices.forEach((item) => {
      if (item.carrier) s.add(item.carrier);
    });
    return Array.from(s);
  }, [carrierInvoices]);

  // Handle AWB Lookup & Auto-fill
  const handleAwbLookup = (awbValue: string) => {
    const trimmed = awbValue.trim();
    setFormAwb(trimmed);
    if (!trimmed) {
      setAutoFilled(false);
      return;
    }

    const foundShipment = shipments.find(
      (s) => s.awb.toLowerCase() === trimmed.toLowerCase()
    );

    if (foundShipment) {
      setAutoFilled(true);
      const cName = foundShipment.company || foundShipment.senderName || foundShipment.account || "";
      if (cName) {
        setFormClientName(cName);
      }
      if (foundShipment.carrier) {
        setFormCarrier(foundShipment.carrier);
      }
      if (foundShipment.weight !== undefined) {
        setFormSystemWeight(String(foundShipment.weight));
      }
      const cost = foundShipment.costPrice !== undefined ? foundShipment.costPrice : 0;
      setFormSystemCost(String(cost));

      if (foundShipment.status === "Delivered") {
        setFormShipmentStatus("Delivered");
      } else if (foundShipment.status === "Cancelled" || foundShipment.status === "Returned") {
        setFormShipmentStatus("RTO");
      } else {
        setFormShipmentStatus(foundShipment.status || "In Transit");
      }
    } else {
      setAutoFilled(false);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingItem(null);
    setFormAwb("");
    setFormInvoiceNumber(uniqueInvoices[0] || "ACC-SINV-2026-03416");
    setFormCarrier("SMSA");
    setFormCarrier("SMSA Express");
    setFormClientName("");
    setFormBilledWeight("");
    setFormBilledCost("");
    setFormSystemWeight("");
    setFormSystemCost("");
    setFormShipmentStatus("Delivered");
    setFormNotes("");
    setAutoFilled(false);
    setAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: CarrierInvoiceItem) => {
    setEditingItem(item);
    setFormAwb(item.awb);
    setFormInvoiceNumber(item.invoiceNumber);
    setFormCarrier(item.carrier);
    setFormClientName(item.clientName);
    setFormBilledWeight(String(item.billedWeight));
    setFormBilledCost(String(item.billedCost));
    setFormSystemWeight(String(item.systemWeight));
    setFormSystemCost(String(item.systemCost));
    setFormShipmentStatus(item.shipmentStatus);
    setFormNotes(item.notes || "");
    setAutoFilled(false);
    setAddModalOpen(true);
  };

  // Save Single Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAwb.trim()) return;

    const bWeight = parseFloat(formBilledWeight) || 0;
    const bCost = parseFloat(formBilledCost) || 0;
    const sWeight = parseFloat(formSystemWeight) || 0;
    const sCost = parseFloat(formSystemCost) || 0;

    const wDiff = Number((bWeight - sWeight).toFixed(3));
    const cDiff = Number((bCost - sCost).toFixed(2));

    if (editingItem) {
      if (onUpdateCarrierInvoice) {
        onUpdateCarrierInvoice(editingItem.id, {
          awb: formAwb.trim(),
          invoiceNumber: formInvoiceNumber.trim(),
          carrier: formCarrier.trim(),
          clientName: formClientName.trim() || "غير محدد",
          billedWeight: bWeight,
          billedCost: bCost,
          systemWeight: sWeight,
          systemCost: sCost,
          weightDiff: wDiff,
          costDiff: cDiff,
          shipmentStatus: formShipmentStatus,
          notes: formNotes.trim(),
        });
      }
    } else {
      const newItem: CarrierInvoiceItem = {
        id: `cinv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        awb: formAwb.trim(),
        invoiceNumber: formInvoiceNumber.trim() || "ACC-SINV-2026-03416",
        carrier: formCarrier.trim() || "SMSA Express",
        clientName: formClientName.trim() || "غير محدد",
        billedWeight: bWeight,
        billedCost: bCost,
        systemWeight: sWeight,
        systemCost: sCost,
        weightDiff: wDiff,
        costDiff: cDiff,
        shipmentStatus: formShipmentStatus,
        notes: formNotes.trim(),
        createdAt: new Date().toISOString(),
      };
      if (onAddCarrierInvoice) {
        onAddCarrierInvoice(newItem);
      }
    }

    setAddModalOpen(false);
  };

  // Parse Bulk Text from Excel / Google Sheets
  const handleParseBulk = (text: string) => {
    setBulkRawText(text);
    setBulkError(null);
    if (!text.trim()) {
      setBulkPreview([]);
      return;
    }

    try {
      const lines = text.trim().split(/\r?\n/);
      const parsed: CarrierInvoiceItem[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.includes("\t")
          ? line.split("\t").map((c) => c.trim())
          : line.split(",").map((c) => c.trim());

        // Skip header line if detected
        if (
          cols[0]?.includes("بوليص") ||
          cols[0]?.toLowerCase().includes("awb") ||
          cols[1]?.includes("فاتور")
        ) {
          continue;
        }

        const awb = cols[0] || "";
        if (!awb) continue;

        const matched = shipments.find(
          (s) => s.awb.toLowerCase() === awb.toLowerCase()
        );

        const invNum = cols[1] || bulkDefaultInvoice || "ACC-SINV-2026-03416";
        const bWeight = parseFloat(cols[2]?.replace(/[^0-9.-]/g, "")) || 0;
        const bCost = parseFloat(cols[3]?.replace(/[^0-9.-]/g, "")) || 0;
        const matchedClient = matched?.company || matched?.senderName || matched?.account;
        const client = cols[4] || (matchedClient ?? "غير محدد");
        const carrier = cols[5] || bulkDefaultCarrier || (matched?.carrier ?? "SMSA Express");

        const sWeight =
          cols[6] !== undefined && cols[6] !== ""
            ? parseFloat(cols[6]?.replace(/[^0-9.-]/g, "")) || 0
            : matched?.weight || 0;

        const sCost =
          cols[7] !== undefined && cols[7] !== ""
            ? parseFloat(cols[7]?.replace(/[^0-9.-]/g, "")) || 0
            : matched?.costPrice || 0;

        const wDiff = Number((bWeight - sWeight).toFixed(3));
        const cDiff = Number((bCost - sCost).toFixed(2));
        const status = cols[10] || matched?.status || "Delivered";

        parsed.push({
          id: `cinv-bulk-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
          awb,
          invoiceNumber: invNum,
          carrier,
          billedWeight: bWeight,
          billedCost: bCost,
          clientName: client,
          systemWeight: sWeight,
          systemCost: sCost,
          weightDiff: wDiff,
          costDiff: cDiff,
          shipmentStatus: status,
          createdAt: new Date().toISOString(),
        });
      }

      setBulkPreview(parsed);
      if (parsed.length === 0) {
        setBulkError("لم يتم العثور على أسطر صالحة للاستيراد. يرجى التأكد من نسخ البيانات بشكل صحيح.");
      }
    } catch {
      setBulkError("حدث خطأ أثناء معالجة البيانات المنسوخة.");
      setBulkPreview([]);
    }
  };

  // Confirm Bulk Import
  const handleConfirmBulk = () => {
    if (bulkPreview.length === 0) return;
    if (onAddCarrierInvoices) {
      onAddCarrierInvoices(bulkPreview);
    }
    setBulkModalOpen(false);
    setBulkRawText("");
    setBulkPreview([]);
  };

  // Delete Record
  const handleDeleteItem = (id: string) => {
    if (onDeleteCarrierInvoice) {
      onDeleteCarrierInvoice(id);
    }
    setDeleteConfirmId(null);
  };

  // Copy AWB Helper
  const handleCopyAwb = (awb: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(awb);
      setCopiedAwb(awb);
      setTimeout(() => setCopiedAwb(null), 2000);
    }
  };

  // Filtered List
  const filteredInvoices = useMemo(() => {
    return carrierInvoices.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesAwb = item.awb.toLowerCase().includes(q);
        const matchesInv = item.invoiceNumber.toLowerCase().includes(q);
        const matchesClient = item.clientName.toLowerCase().includes(q);
        const matchesCarrier = item.carrier.toLowerCase().includes(q);
        const matchesStatus = item.shipmentStatus.toLowerCase().includes(q);
        if (!matchesAwb && !matchesInv && !matchesClient && !matchesCarrier && !matchesStatus) {
          return false;
        }
      }

      if (selectedInvoice !== "all" && item.invoiceNumber !== selectedInvoice) {
        return false;
      }

      if (selectedCarrier !== "all" && item.carrier !== selectedCarrier) {
        return false;
      }

      if (diffFilter === "losses" && item.costDiff <= 0) {
        return false;
      }
      if (diffFilter === "matched" && item.costDiff !== 0) {
        return false;
      }
      if (diffFilter === "savings" && item.costDiff >= 0) {
        return false;
      }

      return true;
    });
  }, [carrierInvoices, search, selectedInvoice, selectedCarrier, diffFilter]);

  // Financial Metrics KPIs
  const stats = useMemo(() => {
    let totalBilled = 0;
    let totalSystem = 0;
    let totalNetDiff = 0;
    let totalLossesCount = 0;
    let totalLossesAmount = 0;

    filteredInvoices.forEach((item) => {
      totalBilled += item.billedCost || 0;
      totalSystem += item.systemCost || 0;
      totalNetDiff += item.costDiff || 0;
      if (item.costDiff > 0) {
        totalLossesCount += 1;
        totalLossesAmount += item.costDiff;
      }
    });

    return {
      count: filteredInvoices.length,
      totalBilled,
      totalSystem,
      totalNetDiff,
      totalLossesCount,
      totalLossesAmount,
    };
  }, [filteredInvoices]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) return;

    const headers = [
      "رقم البوليصة (AWB)",
      "رقم الفاتورة",
      "الوزن المفوتر (كجم)",
      "التكلفة المفوترة (ج.م)",
      "اسم العميل",
      "الشركة الناقلة",
      "وزن السيستم (كجم)",
      "تكلفة السيستم (ج.م)",
      "فرق الوزن",
      "الفرق / الخسارة (ج.م)",
      "حالة الشحنة",
      "ملاحظات",
    ];

    const rows = filteredInvoices.map((i) => [
      `"${i.awb}"`,
      `"${i.invoiceNumber}"`,
      i.billedWeight,
      i.billedCost,
      `"${i.clientName || ""}"`,
      `"${i.carrier || ""}"`,
      i.systemWeight,
      i.systemCost,
      i.weightDiff,
      i.costDiff,
      `"${i.shipmentStatus || ""}"`,
      `"${i.notes || ""}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `carrier-invoices-audit-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. Header & Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-50 text-[#C45B2A] border border-orange-200/70 shadow-2xs">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isRTL ? "مراجعة وتدقيق فواتير شركات الشحن" : "Carrier Invoices Audit & Reconciliation"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {isRTL
                ? "مطابقة وتدقيق فواتير الدفع الواردة من شركات الشحن (سمسا، أرامكس، وغيرها) وحساب فروقات الأوزان والتكاليف وتحديد الخسائر بدقة"
                : "Audit carrier billing against internal shipments to track weight discrepancies and cost losses"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBulkModalOpen(true)}
            className="text-xs font-bold cursor-pointer flex items-center gap-1.5 border-slate-300 text-slate-800 bg-white hover:bg-orange-50/60 hover:text-[#C45B2A] hover:border-[#C45B2A] shadow-2xs"
          >
            <FileUp className="h-4 w-4 text-[#C45B2A]" />
            <span>{isRTL ? "استيراد من إكسيل (شيت)" : "Import from Sheet"}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={openAddModal}
            className="bg-[#C45B2A] hover:bg-[#A94A1F] text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{isRTL ? "إضافة بوليصة للفاتورة" : "Add Billed AWB"}</span>
          </Button>
        </div>
      </div>

      {/* ─── 2. KPI Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isRTL ? "إجمالي التكلفة المفوترة" : "Total Billed Cost"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
                  {stats.totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-bold text-[#C45B2A]">{isRTL ? "ج.م" : "EGP"}</span>
                </h3>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {isRTL
                    ? `مجموع المطالبات في ${stats.count} شحنة`
                    : `Carrier claims on ${stats.count} items`}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50 text-[#C45B2A] border border-orange-200">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expected System Cost */}
        <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isRTL ? "تكلفة السيستم المتوقعة" : "Expected System Cost"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
                  {stats.totalSystem.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-bold text-slate-600">{isRTL ? "ج.م" : "EGP"}</span>
                </h3>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {isRTL ? "التكلفة التقديرية المسجلة مسبقاً" : "Pre-recorded estimated cost"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Discrepancy */}
        <Card
          className={`border shadow-2xs rounded-2xl ${
            stats.totalNetDiff > 0
              ? "border-rose-200 bg-rose-50/40"
              : "border-emerald-200 bg-emerald-50/40"
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${
                    stats.totalNetDiff > 0 ? "text-rose-800" : "text-emerald-800"
                  }`}
                >
                  {isRTL ? "صافي الفرق / الخسائر" : "Net Discrepancy"}
                </p>
                <h3
                  className={`text-2xl sm:text-3xl font-black mt-1 font-mono ${
                    stats.totalNetDiff > 0 ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {stats.totalNetDiff > 0 ? "+" : ""}
                  {stats.totalNetDiff.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xs font-bold">{isRTL ? "ج.م" : "EGP"}</span>
                </h3>
                <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                  {stats.totalNetDiff > 0
                    ? isRTL
                      ? "فارق تكلفة إضافية (خسارة على الشركة)"
                      : "Extra carrier cost / Loss"
                    : isRTL
                    ? "وفر لصالح الشركة عن التكلفة المتوقعة"
                    : "Carrier billed less than estimate"}
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl border ${
                  stats.totalNetDiff > 0
                    ? "bg-rose-100 text-rose-700 border-rose-300"
                    : "bg-emerald-100 text-emerald-700 border-emerald-300"
                }`}
              >
                {stats.totalNetDiff > 0 ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overcharged Count */}
        <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isRTL ? "بوالص بفروقات زيادة" : "Overcharged Items"}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 font-mono">
                  {stats.totalLossesCount}{" "}
                  <span className="text-xs font-bold text-slate-500">
                    {isRTL ? `من أصل ${stats.count}` : `of ${stats.count}`}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {isRTL
                    ? `إجمالي الزيادات: ${stats.totalLossesAmount.toLocaleString()} ج.م`
                    : `Total extra claims: ${stats.totalLossesAmount.toLocaleString()} EGP`}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 3. Main Data Table & Filtering Card ─── */}
      <Card className="border border-slate-200 shadow-2xs bg-white rounded-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-200 bg-[#FCFAF7]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isRTL
                    ? "بحث برقم البوليصة، رقم الفاتورة، اسم العميل، أو الشركة..."
                    : "Search by AWB, invoice, client, or carrier..."
                }
                className="ps-9 bg-white border-slate-300 text-slate-900 font-medium focus:border-[#C45B2A] focus:ring-[#C45B2A]/20 text-xs h-9 rounded-xl shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Invoice Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-700 font-bold">{isRTL ? "الفاتورة:" : "Invoice:"}</span>
                <select
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#C45B2A]/20 focus:border-[#C45B2A] shadow-2xs"
                >
                  <option value="all">{isRTL ? "جميع الفواتير" : "All Invoices"}</option>
                  {uniqueInvoices.map((inv) => (
                    <option key={inv} value={inv}>
                      {inv}
                    </option>
                  ))}
                </select>
              </div>

              {/* Carrier Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-700 font-bold">{isRTL ? "الشركة:" : "Carrier:"}</span>
                <select
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#C45B2A]/20 focus:border-[#C45B2A] shadow-2xs"
                >
                  <option value="all">{isRTL ? "جميع الشركات" : "All Carriers"}</option>
                  {uniqueCarriers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Discrepancy Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs border border-slate-300">
                <button
                  type="button"
                  onClick={() => setDiffFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    diffFilter === "all"
                      ? "bg-slate-900 text-white font-bold shadow-2xs"
                      : "text-slate-700 hover:text-slate-950 font-semibold"
                  }`}
                >
                  {isRTL ? "الكل" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setDiffFilter("losses")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    diffFilter === "losses"
                      ? "bg-rose-600 text-white font-bold shadow-2xs"
                      : "text-slate-700 hover:text-rose-700 font-semibold"
                  }`}
                >
                  {isRTL ? "خسائر (+)" : "Losses (+)"}
                </button>
                <button
                  type="button"
                  onClick={() => setDiffFilter("matched")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    diffFilter === "matched"
                      ? "bg-emerald-700 text-white font-bold shadow-2xs"
                      : "text-slate-700 hover:text-emerald-700 font-semibold"
                  }`}
                >
                  {isRTL ? "مطابقة (0)" : "Matched (0)"}
                </button>
                <button
                  type="button"
                  onClick={() => setDiffFilter("savings")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    diffFilter === "savings"
                      ? "bg-blue-600 text-white font-bold shadow-2xs"
                      : "text-slate-700 hover:text-blue-700 font-semibold"
                  }`}
                >
                  {isRTL ? "وفر (-)" : "Savings (-)"}
                </button>
              </div>

              {/* Export Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs border-slate-300 text-slate-800 bg-white hover:bg-orange-50/60 hover:text-[#C45B2A] hover:border-[#C45B2A] shadow-2xs font-bold"
              >
                <Download className="w-3.5 h-3.5 me-1.5 text-[#C45B2A]" />
                {isRTL ? "تصدير CSV" : "Export CSV"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow className="border-b border-slate-300 text-xs text-slate-900 font-black">
                <TableHead className="py-3 px-4 text-start font-black text-slate-900">#</TableHead>
                <TableHead className="py-3 px-4 text-start font-black text-slate-900">
                  {isRTL ? "رقم البوليصة" : "AWB"}
                </TableHead>
                <TableHead className="py-3 px-4 text-start font-black text-slate-900">
                  {isRTL ? "رقم الفاتورة" : "Invoice No."}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black bg-orange-100/60 text-slate-950">
                  {isRTL ? "الوزن المفوتر" : "Billed Wt."}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black bg-orange-100/60 text-slate-950">
                  {isRTL ? "التكلفة المفوترة" : "Billed Cost"}
                </TableHead>
                <TableHead className="py-3 px-4 text-start font-black text-slate-900">
                  {isRTL ? "اسم العميل" : "Client Name"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black text-slate-900">
                  {isRTL ? "الشركة" : "Carrier"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black bg-slate-200/60 text-slate-900">
                  {isRTL ? "وزن السيستم" : "System Wt."}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black bg-slate-200/60 text-slate-900">
                  {isRTL ? "تكلفة السيستم" : "System Cost"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black text-slate-900">
                  {isRTL ? "فرق الوزن" : "Weight Diff"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black text-slate-900">
                  {isRTL ? "الفرق / الخسارة" : "Diff / Loss"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black text-slate-900">
                  {isRTL ? "الحالة" : "Status"}
                </TableHead>
                <TableHead className="py-3 px-4 text-center font-black text-slate-900">
                  {isRTL ? "إجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="h-44 text-center text-slate-600"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileSpreadsheet className="w-10 h-10 text-slate-400" />
                      <p className="text-sm font-bold text-slate-700">
                        {isRTL
                          ? "لم يتم العثور على بوالص مفوترة مطابقة لمعايير البحث"
                          : "No carrier invoice records match your filter criteria"}
                      </p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearch("");
                          setSelectedInvoice("all");
                          setSelectedCarrier("all");
                          setDiffFilter("all");
                        }}
                        className="text-xs text-[#C45B2A] font-bold"
                      >
                        {isRTL ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((item, index) => {
                  const isLoss = item.costDiff > 0;
                  const isSaving = item.costDiff < 0;

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b border-slate-200 hover:bg-orange-50/40 transition-colors text-xs"
                    >
                      {/* Row Index */}
                      <TableCell className="py-3 px-4 font-mono font-bold text-slate-600">
                        {index + 1}
                      </TableCell>

                      {/* AWB */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-black text-slate-950">
                          <span>{item.awb}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyAwb(item.awb)}
                            className="text-slate-400 hover:text-[#C45B2A] transition-colors p-0.5 rounded"
                            title={isRTL ? "نسخ رقم البوليصة" : "Copy AWB"}
                          >
                            {copiedAwb === item.awb ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Invoice Number */}
                      <TableCell className="py-3 px-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300 font-bold">
                          {item.invoiceNumber}
                        </span>
                      </TableCell>

                      {/* Billed Weight */}
                      <TableCell className="py-3 px-4 text-center font-mono font-black text-slate-950 bg-orange-50/40">
                        {item.billedWeight} <span className="text-[10px] text-slate-500 font-normal">{isRTL ? "كجم" : "kg"}</span>
                      </TableCell>

                      {/* Billed Cost */}
                      <TableCell className="py-3 px-4 text-center font-mono font-black text-slate-950 bg-orange-50/40">
                        {item.billedCost.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      {/* Client Name */}
                      <TableCell className="py-3 px-4 text-slate-900 font-bold">
                        {item.clientName || "-"}
                      </TableCell>

                      {/* Carrier */}
                      <TableCell className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-900 border border-slate-300">
                          <Truck className="w-3 h-3 me-1 text-[#C45B2A] shrink-0" />
                          {item.carrier}
                        </span>
                      </TableCell>

                      {/* System Weight */}
                      <TableCell className="py-3 px-4 text-center font-mono font-bold text-slate-800 bg-slate-50">
                        {item.systemWeight} <span className="text-[10px] text-slate-500 font-normal">{isRTL ? "كجم" : "kg"}</span>
                      </TableCell>

                      {/* System Cost */}
                      <TableCell className="py-3 px-4 text-center font-mono font-bold text-slate-800 bg-slate-50">
                        {item.systemCost.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      {/* Weight Diff */}
                      <TableCell className="py-3 px-4 text-center font-mono font-black">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            item.weightDiff > 0
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : item.weightDiff < 0
                              ? "bg-blue-100 text-blue-900 border border-blue-300"
                              : "text-slate-600 font-medium"
                          }`}
                        >
                          {item.weightDiff > 0 ? `+${item.weightDiff}` : item.weightDiff}
                        </span>
                      </TableCell>

                      {/* Cost Diff / Loss */}
                      <TableCell className="py-3 px-4 text-center font-mono font-black">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black ${
                            isLoss
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : isSaving
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-800 border border-slate-200"
                          }`}
                        >
                          {isLoss ? "+" : ""}
                          {item.costDiff.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>

                      {/* Shipment Status */}
                      <TableCell className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            item.shipmentStatus === "Delivered"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : item.shipmentStatus === "Clearance Delay"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : item.shipmentStatus === "RTO"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {item.shipmentStatus}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-600 hover:text-[#C45B2A] bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 transition-all cursor-pointer shadow-2xs shrink-0"
                            title={isRTL ? "تعديل" : "Edit"}
                            aria-label={isRTL ? "تعديل" : "Edit"}
                          >
                            <Edit3 className="w-4 h-4 shrink-0" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 transition-all cursor-pointer shadow-2xs shrink-0"
                            title={isRTL ? "حذف" : "Delete"}
                            aria-label={isRTL ? "حذف" : "Delete"}
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
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

        {/* Footer Summary Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-2 font-semibold">
          <div>
            {isRTL ? (
              <span>
                عرض <strong className="text-slate-950 font-black">{filteredInvoices.length}</strong> بوليصة
                من أصل <strong className="text-slate-950 font-black">{carrierInvoices.length}</strong> مسجلة
              </span>
            ) : (
              <span>
                Showing <strong>{filteredInvoices.length}</strong> of <strong>{carrierInvoices.length}</strong> items
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 font-mono font-black">
            <span>
              {isRTL ? "إجمالي مفوتر:" : "Billed:"}{" "}
              <strong className="text-[#C45B2A]">
                {stats.totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })} {isRTL ? "ج.م" : "EGP"}
              </strong>
            </span>
            <span>
              {isRTL ? "إجمالي سيستم:" : "System:"}{" "}
              <strong className="text-slate-950">
                {stats.totalSystem.toLocaleString("en-US", { minimumFractionDigits: 2 })} {isRTL ? "ج.م" : "EGP"}
              </strong>
            </span>
            <span>
              {isRTL ? "الصافي:" : "Net:"}{" "}
              <strong
                className={
                  stats.totalNetDiff > 0
                    ? "text-rose-700"
                    : "text-emerald-700"
                }
              >
                {stats.totalNetDiff > 0 ? "+" : ""}
                {stats.totalNetDiff.toLocaleString("en-US", { minimumFractionDigits: 2 })} {isRTL ? "ج.م" : "EGP"}
              </strong>
            </span>
          </div>
        </div>
      </Card>

      {/* ─── 4. Add / Edit Single Item Modal ─── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-950">
              <div className="p-2 rounded-xl bg-orange-50 text-[#C45B2A]">
                <Receipt className="w-5 h-5" />
              </div>
              {editingItem
                ? isRTL
                  ? "تعديل بند بوليصة بالفاتورة"
                  : "Edit Billed AWB Record"
                : isRTL
                ? "إضافة بوليصة لتدقيق الفاتورة"
                : "Add Billed AWB for Audit"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              {isRTL
                ? "أدخل رقم البوليصة للبحث التلقائي في الشحنات وجلب بيانات العميل وتكلفة السيستم فوراً"
                : "Enter AWB to auto-populate client details and system expected weight and cost."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-4 py-2">
            {/* AWB + Auto lookup */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  {isRTL ? "رقم البوليصة (AWB) *" : "AWB Number *"}
                </label>
                {autoFilled && (
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-700">
                    <Sparkles className="w-3 h-3 me-1 text-emerald-600" />
                    {isRTL ? "تم جلب بيانات الشحنة من السيستم" : "Auto-filled from shipments"}
                  </span>
                )}
              </div>
              <Input
                required
                value={formAwb}
                onChange={(e) => handleAwbLookup(e.target.value)}
                placeholder="e.g. 215199055380"
                className="font-mono text-sm font-bold tracking-wider text-slate-950 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
              />
            </div>

            {/* Invoice Number & Carrier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  {isRTL ? "رقم الفاتورة *" : "Invoice Number *"}
                </label>
                <Input
                  required
                  value={formInvoiceNumber}
                  onChange={(e) => setFormInvoiceNumber(e.target.value)}
                  placeholder="e.g. ACC-SINV-2026-03416"
                  className="font-mono text-xs font-bold text-slate-950 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  {isRTL ? "الشركة الناقلة *" : "Carrier *"}
                </label>
                <select
                  value={formCarrier}
                  onChange={(e) => setFormCarrier(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C45B2A]/20 focus:border-[#C45B2A] cursor-pointer"
                >
                  {CARRIERS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Client Name & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  {isRTL ? "اسم العميل" : "Client Name"}
                </label>
                <Input
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  placeholder={isRTL ? "مثال: old sheet / نور سعيد" : "e.g. Acme Corp"}
                  className="text-xs font-bold text-slate-950 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  {isRTL ? "حالة الشحنة" : "Shipment Status"}
                </label>
                <select
                  value={formShipmentStatus}
                  onChange={(e) => setFormShipmentStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C45B2A]/20 focus:border-[#C45B2A]"
                >
                  <option value="Delivered">Delivered (تم التسليم)</option>
                  <option value="Clearance Delay">Clearance Delay (تأخير جمركي)</option>
                  <option value="RTO">RTO (مرتجع للمرسل)</option>
                  <option value="Returned">Returned (مرتجع)</option>
                  <option value="In Transit">In Transit (في الطريق)</option>
                  <option value="Cancelled">Cancelled (ملغي)</option>
                </select>
              </div>
            </div>

            {/* Billed Metrics vs System Metrics Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-300 space-y-3">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#C45B2A]" />
                {isRTL ? "مقارنة الوزن والتكلفة (المفوتر ضد السيستم)" : "Weight & Cost Comparison"}
              </span>

              {/* Billed (From Carrier Invoice) */}
              <div className="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-orange-50 border border-orange-200">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#7A3416]">
                    {isRTL ? "الوزن المفوتر (كجم) *" : "Billed Wt (kg) *"}
                  </label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formBilledWeight}
                    onChange={(e) => setFormBilledWeight(e.target.value)}
                    placeholder="0.0"
                    className="h-8 text-xs font-mono font-bold bg-white text-slate-950 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-[#7A3416]">
                    {isRTL ? "التكلفة المفوترة (ج.م) *" : "Billed Cost (EGP) *"}
                  </label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formBilledCost}
                    onChange={(e) => setFormBilledCost(e.target.value)}
                    placeholder="0.00"
                    className="h-8 text-xs font-mono font-black bg-white text-slate-950 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  />
                </div>
              </div>

              {/* System (From Internal Database) */}
              <div className="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-slate-100 border border-slate-300">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-800">
                    {isRTL ? "وزن السيستم (كجم)" : "System Wt (kg)"}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formSystemWeight}
                    onChange={(e) => setFormSystemWeight(e.target.value)}
                    placeholder="0.0"
                    className="h-8 text-xs font-mono font-bold bg-white text-slate-950 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-800">
                    {isRTL ? "تكلفة السيستم (ج.م)" : "System Cost (EGP)"}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formSystemCost}
                    onChange={(e) => setFormSystemCost(e.target.value)}
                    placeholder="0.00"
                    className="h-8 text-xs font-mono font-bold bg-white text-slate-950 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                  />
                </div>
              </div>

              {/* Live Discrepancy Preview */}
              {(() => {
                const bw = parseFloat(formBilledWeight) || 0;
                const sw = parseFloat(formSystemWeight) || 0;
                const bc = parseFloat(formBilledCost) || 0;
                const sc = parseFloat(formSystemCost) || 0;
                const wdiff = Number((bw - sw).toFixed(3));
                const cdiff = Number((bc - sc).toFixed(2));

                return (
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white border border-slate-300">
                    <span className="text-slate-700 font-bold">
                      {isRTL ? "فرق الوزن المحسوب:" : "Weight Diff:"}{" "}
                      <strong className="font-mono text-slate-950 font-black">
                        {wdiff > 0 ? `+${wdiff}` : wdiff} {isRTL ? "كجم" : "kg"}
                      </strong>
                    </span>
                    <span className="text-slate-700 font-bold">
                      {isRTL ? "فرق التكلفة (الخسارة):" : "Cost Diff (Loss):"}{" "}
                      <strong
                        className={`font-mono font-black ${
                          cdiff > 0
                            ? "text-rose-700"
                            : cdiff < 0
                            ? "text-emerald-700"
                            : "text-slate-800"
                        }`}
                      >
                        {cdiff > 0 ? `+${cdiff}` : cdiff} {isRTL ? "ج.م" : "EGP"}
                      </strong>
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                {isRTL ? "ملاحظات إضافية" : "Notes"}
              </label>
              <Input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder={isRTL ? "أي ملاحظات بخصوص الشحنة أو سبب فرق الوزن..." : "Notes..."}
                className="text-xs text-slate-900 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                className="text-xs font-bold border-slate-300"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                className="text-xs bg-[#C45B2A] hover:bg-[#A94A1F] text-white font-bold"
              >
                {editingItem
                  ? isRTL
                    ? "حفظ التعديلات"
                    : "Save Changes"
                  : isRTL
                  ? "إضافة البوليصة"
                  : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── 5. Bulk Excel Paste Modal ─── */}
      <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-950">
              <div className="p-2 rounded-xl bg-orange-50 text-[#C45B2A]">
                <FileUp className="w-5 h-5" />
              </div>
              {isRTL ? "استيراد فواتير مجمعة من إكسيل / جوجل شيت" : "Bulk Import from Excel / Google Sheets"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              {isRTL
                ? "انسخ الصفوف مباشرة من شيت إكسيل (Copy) والصقها هنا (Paste). سيقوم النظام بقراءة الأعمدة الـ 11 تلقائياً مع مطابقة البوالص مع السيستم"
                : "Copy rows from Google Sheets or Excel and paste them here. Columns are automatically mapped."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Defaults */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#FCFAF7] rounded-2xl border border-slate-300">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {isRTL ? "رقم الفاتورة الافتراضي (إذا لم يكن بالصف)" : "Default Invoice Number"}
                </label>
                <Input
                  value={bulkDefaultInvoice}
                  onChange={(e) => setBulkDefaultInvoice(e.target.value)}
                  placeholder="ACC-SINV-2026-03416"
                  className="h-8 text-xs font-mono font-bold bg-white text-slate-950 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {isRTL ? "الشركة الناقلة الافتراضية" : "Default Carrier"}
                </label>
                <select
                  value={bulkDefaultCarrier}
                  onChange={(e) => setBulkDefaultCarrier(e.target.value)}
                  className="w-full h-8 text-xs font-bold bg-white text-slate-950 border border-slate-300 rounded-md px-2 focus:border-[#C45B2A] focus:ring-[#C45B2A]/20 cursor-pointer"
                >
                  {CARRIERS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Paste Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  {isRTL ? "الصق البيانات المنسوخة هنا:" : "Paste rows here:"}
                </label>
                <span className="text-[11px] text-slate-600 font-medium">
                  {isRTL
                    ? "الترتيب المتوقع: رقم البوليصة - رقم الفاتورة - الوزن - التكلفة - العميل - الشركة - وزن السيستم - تكلفة السيستم - الحالة"
                    : "Tab-separated Excel rows"}
                </span>
              </div>
              <textarea
                rows={6}
                value={bulkRawText}
                onChange={(e) => handleParseBulk(e.target.value)}
                placeholder={
                  "215199055380\tACC-SINV-2026-03416\t2.2\t1688.76\told sheet\tSMSA\t2.5\t2000\t-0.3\t-311.24\tDelivered\n215199140570\tACC-SINV-2026-03416\t1.5\t1309.67\told sheet\tSMSA\t1.5\t1618\t0\t-308.33\tDelivered"
                }
                className="w-full font-mono text-xs font-medium p-3 rounded-xl border border-slate-300 bg-white text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#C45B2A]/20 focus:border-[#C45B2A]"
              />
            </div>

            {bulkError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{bulkError}</span>
              </div>
            )}

            {/* Preview of Parsed Rows */}
            {bulkPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>
                    {isRTL
                      ? `معاينة البيانات المستخرجة (${bulkPreview.length} بوليصة جاهزة للاستيراد):`
                      : `Parsed Preview (${bulkPreview.length} items ready):`}
                  </span>
                  <span className="text-[#C45B2A] font-mono font-black">
                    {bulkPreview
                      .reduce((acc, i) => acc + i.billedCost, 0)
                      .toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                    {isRTL ? "ج.م" : "EGP"}
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-xl text-xs bg-white">
                  <table className="w-full text-start">
                    <thead className="bg-slate-100 text-slate-900 text-[11px] font-black sticky top-0 border-b border-slate-300">
                      <tr>
                        <th className="p-2 text-start">{isRTL ? "البوليصة" : "AWB"}</th>
                        <th className="p-2 text-start">{isRTL ? "الفاتورة" : "Invoice"}</th>
                        <th className="p-2 text-center">{isRTL ? "الوزن المفوتر" : "Billed Wt"}</th>
                        <th className="p-2 text-center">{isRTL ? "التكلفة المفوترة" : "Billed Cost"}</th>
                        <th className="p-2 text-start">{isRTL ? "العميل" : "Client"}</th>
                        <th className="p-2 text-center">{isRTL ? "الفرق / الخسارة" : "Diff/Loss"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {bulkPreview.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/30">
                          <td className="p-2 font-mono font-bold text-slate-950">{row.awb}</td>
                          <td className="p-2 font-mono text-[11px] text-slate-700 font-semibold">{row.invoiceNumber}</td>
                          <td className="p-2 text-center font-mono font-bold text-slate-900">{row.billedWeight}</td>
                          <td className="p-2 text-center font-mono font-bold text-slate-900">{row.billedCost}</td>
                          <td className="p-2 font-bold text-slate-900">{row.clientName}</td>
                          <td
                            className={`p-2 text-center font-mono font-black ${
                              row.costDiff > 0
                                ? "text-rose-700"
                                : row.costDiff < 0
                                ? "text-emerald-700"
                                : "text-slate-600"
                            }`}
                          >
                            {row.costDiff > 0 ? `+${row.costDiff}` : row.costDiff}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bulkPreview.length > 50 && (
                    <div className="p-2 text-center text-xs text-slate-600 font-bold bg-slate-50 border-t">
                      {isRTL
                        ? `... و ${bulkPreview.length - 50} صف إضافي`
                        : `... and ${bulkPreview.length - 50} more rows`}
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkModalOpen(false)}
                className="text-xs font-bold border-slate-300"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="button"
                disabled={bulkPreview.length === 0}
                onClick={handleConfirmBulk}
                className="text-xs bg-[#C45B2A] hover:bg-[#A94A1F] text-white font-bold"
              >
                <Check className="w-3.5 h-3.5 me-1.5" />
                {isRTL
                  ? `تأكيد واستيراد ${bulkPreview.length} شحنة`
                  : `Confirm & Import ${bulkPreview.length} items`}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── 6. Delete Confirmation Dialog ─── */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              {isRTL ? "تأكيد حذف بند البوليصة" : "Confirm Record Deletion"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              {isRTL
                ? "هل أنت متأكد من حذف هذا السجل من تدقيق فواتير الشحن؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to remove this audited carrier record?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="text-xs font-bold border-slate-300"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteItem(deleteConfirmId)}
              className="text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 me-1.5" />
              {isRTL ? "نعم، حذف السجل" : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesView;

