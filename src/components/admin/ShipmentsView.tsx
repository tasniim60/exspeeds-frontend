"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Loader2,
  Printer,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MapPin,
  Truck,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Scale,
  QrCode,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Edit2,
  Edit3,
  Check,
  Trash2,
  TrendingUp,
  AlertCircle,
  Tag,
  UserCheck,
  Globe,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Shipment,
  ShipmentRequest,
  AdminStorage,
  calculateVolumetricWeight,
  calculateChargeableWeight,
  calculateNetProfit,
  MASTER_CLIENT_ACCOUNTS,
  MASTER_AGENTS,
  MASTER_CARRIERS,
  MASTER_BROKERS,
  MASTER_SHIPMENT_STATUSES,
  MASTER_EXTRA_EXPENSES,
  MASTER_COUNTRIES,
} from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";
import { TrackingRedirect } from "@/components/TrackingRedirect";

interface ShipmentsViewProps {
  shipments: Shipment[];
  onAddShipment: (shipment: Shipment) => void;
  onUpdateShipment: (shipment: Shipment) => void;
  onDeleteShipment: (id: string) => void;
  initialSelectedAwb?: string;
}

// Normalizes carrier name display so DHL is always represented cleanly as Express
const formatCarrierName = (carrier?: string) => {
  if (!carrier) return "Express";
  if (carrier === "DHL" || carrier === "DHL Express") return "Express";
  return carrier;
};

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  shipments,
  onAddShipment,
  onUpdateShipment,
  onDeleteShipment,
  initialSelectedAwb,
}) => {
  const { t, isRTL, formatCurrency, formatDate, formatDateTime } = useLanguage();
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [brokerFilter, setBrokerFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [surchargeFilter, setSurchargeFilter] = useState<string>("all");
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Modals & Drawers
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [inspectShipment, setInspectShipment] = useState<Shipment | null>(
    initialSelectedAwb ? shipments.find((s) => s.awb === initialSelectedAwb) || null : null
  );

  // Form State for New Shipment
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [formAwb, setFormAwb] = useState("");
  const [formAccount, setFormAccount] = useState(MASTER_CLIENT_ACCOUNTS[0]);
  const [formReceiverName, setFormReceiverName] = useState("");
  const [formContents, setFormContents] = useState("");
  const [formCountry, setFormCountry] = useState("Saudi Arabia");
  const [formCarrier, setFormCarrier] = useState<string>("SMSA Express");
  const [formBroker, setFormBroker] = useState<string>("XSPEED");
  const [formActualWeight, setFormActualWeight] = useState("1.5");
  const [formLength, setFormLength] = useState("10");
  const [formWidth, setFormWidth] = useState("10");
  const [formHeight, setFormHeight] = useState("10");
  const [formCostPrice, setFormCostPrice] = useState("1500");
  const [formSellingPrice, setFormSellingPrice] = useState("2100");
  const [formTransExpense, setFormTransExpense] = useState("0");
  const [formAgentName, setFormAgentName] = useState(MASTER_AGENTS[0]);
  const [formOpNote, setFormOpNote] = useState("");

  // Inline Edit Agent State
  const [editingAgentShipmentId, setEditingAgentShipmentId] = useState<string | null>(null);
  const [inlineAgentValue, setInlineAgentValue] = useState("");
  const [isCustomAgent, setIsCustomAgent] = useState(false);
  const [savingAgentShipmentId, setSavingAgentShipmentId] = useState<string | null>(null);

  const handleSaveAgent = (shipment: Shipment, newAgent: string) => {
    const trimmed = newAgent.trim();
    if (!trimmed) {
      setEditingAgentShipmentId(null);
      setIsCustomAgent(false);
      return;
    }

    setSavingAgentShipmentId(shipment.id);
    try {
      const updated = { ...shipment, agentName: trimmed };
      onUpdateShipment(updated);
      if (inspectShipment && inspectShipment.id === shipment.id) {
        setInspectShipment(updated);
      }
      setEditingAgentShipmentId(null);
      setIsCustomAgent(false);
    } catch (err) {
      console.error("Failed to update agent name:", err);
    } finally {
      setSavingAgentShipmentId(null);
    }
  };

  const pendingRequests = AdminStorage.getShipmentRequests().filter(
    (r) => r.status !== "Converted to Shipment" && r.status !== "Cancelled"
  );

  const handleImportRequest = (reqId: string) => {
    setSelectedRequestId(reqId);
    if (!reqId) return;

    const req = pendingRequests.find((r) => r.id === reqId);
    if (!req) return;

    setFormAccount(req.companyName || req.customerName);
    setFormReceiverName(req.consigneeName || req.customerName);
    setFormCountry(req.deliveryCountry || req.country || "Saudi Arabia");
    setFormContents(req.contents || req.shipmentType || "Parcel");
    setFormActualWeight(String(req.weight || 1.5));
    setFormLength(String(req.length || 10));
    setFormWidth(String(req.width || 10));
    setFormHeight(String(req.height || 10));

    if (req.quotedPrice) {
      const parsedPrice = parseFloat(req.quotedPrice.replace(/[^0-9.]/g, "")) || 2100;
      setFormSellingPrice(String(parsedPrice));
      setFormCostPrice(String(Math.round(parsedPrice * 0.65)));
    }

    setFormOpNote(`Linked to Customer Request ${req.requestNumber}`);
  };

  // Calculated Volumetric Weight, Final Chargeable Weight, and Net Profit
  const actualWtNum = parseFloat(formActualWeight) || 0;
  const lengthNum = parseFloat(formLength) || 0;
  const widthNum = parseFloat(formWidth) || 0;
  const heightNum = parseFloat(formHeight) || 0;
  const volumetricWtNum = calculateVolumetricWeight(lengthNum, widthNum, heightNum);
  const finalWtNum = calculateChargeableWeight(actualWtNum, volumetricWtNum);

  const costPriceNum = parseFloat(formCostPrice) || 0;
  const sellingPriceNum = parseFloat(formSellingPrice) || 0;
  const transExpenseNum = parseFloat(formTransExpense) || 0;
  const netProfitNum = calculateNetProfit(sellingPriceNum, costPriceNum, transExpenseNum);

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();

    const newShipment: Shipment = {
      id: `shp-${Date.now()}`,
      awb: formAwb.trim(),
      date: new Date().toISOString().replace("T", " ").split(".")[0],
      account: formAccount,
      company: formAccount,
      senderName: "XSPEED Central Gateway",
      senderCity: "Cairo, Egypt",
      receiverName: formReceiverName || "Valued Consignee",
      receiverCity: formCountry.split(" ")[0] || "Main City",
      country: formCountry,
      carrier: formCarrier as any,
      broker: formBroker,
      weight: finalWtNum,
      actualWeight: actualWtNum,
      length: lengthNum,
      width: widthNum,
      height: heightNum,
      volumetricWeight: volumetricWtNum,
      dim: `${lengthNum}x${widthNum}x${heightNum} cm`,
      priceEgp: sellingPriceNum,
      priceUsd: Math.round(sellingPriceNum / 31),
      costPrice: costPriceNum,
      sellingPrice: sellingPriceNum,
      transExpense: transExpenseNum,
      netProfit: netProfitNum,
      agentName: formAgentName,
      opNote: formOpNote,
      contents: formContents || "Consignment Package",
      status: "In Transit",
      originHub: "Cairo Central Gateway (CAI)",
      destinationHub: `${formCountry} Central Hub`,
      currentLocation: "Package sorted & queued for immediate dispatch",
      serviceType: "Next-Day Air",
      timeline: [
        { status: "Shipment Created & Label Printed", location: "Cairo Dispatch Hub", timestamp: `${new Date().toISOString().split("T")[0]} 08:30`, completed: true },
        { status: "Package Received at Gateway Terminal", location: "Cairo International Gateway", timestamp: `${new Date().toISOString().split("T")[0]} 11:15`, completed: true, current: true },
        { status: "Dispatched on Express Flight", location: "Airport Hub", timestamp: "Est. Scheduled", completed: false },
        { status: "Customs & Regional Sorting", location: `${formCountry} Hub`, timestamp: "Est. Tomorrow", completed: false },
        { status: "Delivered to Consignee", location: formCountry, timestamp: "Est. Tomorrow 16:00", completed: false },
      ],
    };

    onAddShipment(newShipment);

    if (selectedRequestId) {
      AdminStorage.updateShipmentRequest(selectedRequestId, {
        status: "Converted to Shipment",
        linkedAwb: formAwb.trim(),
      });
      setSelectedRequestId("");
    }

    setNewModalOpen(false);
    setInspectShipment(newShipment);
    setFormAwb(`EXP-${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  // Master option lists combined dynamically with shipment records
  const uniqueAccounts = useMemo(() => {
    const set = new Set([...MASTER_CLIENT_ACCOUNTS, ...shipments.map((s) => s.account || s.company).filter(Boolean)]);
    return Array.from(set).sort();
  }, [shipments]);

  const uniqueAgents = useMemo(() => {
    const set = new Set([...MASTER_AGENTS, ...shipments.map((s) => s.agentName).filter(Boolean)]);
    return Array.from(set).sort();
  }, [shipments]);

  const uniqueCarriers = useMemo(() => {
    const raw = [...MASTER_CARRIERS, ...shipments.map((s) => formatCarrierName(s.carrier)).filter(Boolean)];
    const set = new Set(raw);
    return Array.from(set).sort();
  }, [shipments]);

  const uniqueBrokers = useMemo(() => {
    const set = new Set([...MASTER_BROKERS, ...shipments.map((s) => s.broker).filter(Boolean)]);
    return Array.from(set).sort();
  }, [shipments]);

  const uniqueStatuses = useMemo(() => {
    const set = new Set([...MASTER_SHIPMENT_STATUSES, ...shipments.map((s) => s.status).filter(Boolean)]);
    return Array.from(set).sort();
  }, [shipments]);

  const uniqueCountries = useMemo(() => {
    const set = new Set([...MASTER_COUNTRIES, ...shipments.map((s) => s.country).filter(Boolean)]);
    return Array.from(set).sort();
  }, [shipments]);

  const uniqueSurcharges = MASTER_EXTRA_EXPENSES;

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.awb.toLowerCase().includes(q) ||
        (s.account && s.account.toLowerCase().includes(q)) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        (s.receiverName && s.receiverName.toLowerCase().includes(q)) ||
        (s.country && s.country.toLowerCase().includes(q)) ||
        (s.contents && s.contents.toLowerCase().includes(q)) ||
        (s.agentName && s.agentName.toLowerCase().includes(q)) ||
        (s.carrier && formatCarrierName(s.carrier).toLowerCase().includes(q));

      const matchesAccount =
        accountFilter === "all" ||
        (() => {
          const sAcc = (s.account || s.company || "").toLowerCase().trim();
          const fAcc = accountFilter.toLowerCase().trim();
          return sAcc === fAcc || sAcc.includes(fAcc) || fAcc.includes(sAcc);
        })();

      const matchesStatus =
        statusFilter === "all" ||
        (() => {
          const sSt = (s.status || "").toLowerCase().trim();
          const fSt = statusFilter.toLowerCase().trim();
          if (sSt === fSt) return true;
          if ((fSt === "deliverd" || fSt === "delivered") && (sSt === "deliverd" || sSt === "delivered")) return true;
          return sSt.includes(fSt) || fSt.includes(sSt);
        })();

      const matchesCarrier =
        carrierFilter === "all" ||
        (() => {
          const sCar = formatCarrierName(s.carrier).toLowerCase().trim();
          const fCar = carrierFilter.toLowerCase().trim();
          return sCar === fCar || sCar.includes(fCar) || fCar.includes(sCar);
        })();

      const matchesBroker =
        brokerFilter === "all" ||
        (() => {
          const sBr = (s.broker || "").toLowerCase().trim();
          const fBr = brokerFilter.toLowerCase().trim();
          return sBr === fBr || sBr.includes(fBr) || fBr.includes(sBr);
        })();

      const matchesAgent =
        agentFilter === "all" ||
        (() => {
          const sAg = (s.agentName || "").toLowerCase().trim();
          const fAg = agentFilter.toLowerCase().trim();
          return sAg === fAg || sAg.includes(fAg) || fAg.includes(sAg);
        })();

      const matchesCountry =
        countryFilter === "all" ||
        (() => {
          const sCo = (s.country || "").toLowerCase().trim();
          const fCo = countryFilter.toLowerCase().trim();
          if (sCo === fCo || sCo.includes(fCo) || fCo.includes(sCo)) return true;
          if (fCo === "usa" && (sCo.includes("usa") || sCo.includes("america") || sCo.includes("u.s.a"))) return true;
          if (fCo === "uae" && (sCo.includes("uae") || sCo.includes("emirates"))) return true;
          return false;
        })();

      const matchesSurcharge =
        surchargeFilter === "all" ||
        (s.opNote && s.opNote.toLowerCase().includes(surchargeFilter.toLowerCase()));

      return (
        matchesSearch &&
        matchesAccount &&
        matchesStatus &&
        matchesCarrier &&
        matchesBroker &&
        matchesAgent &&
        matchesCountry &&
        matchesSurcharge
      );
    });
  }, [
    shipments,
    search,
    accountFilter,
    statusFilter,
    carrierFilter,
    brokerFilter,
    agentFilter,
    countryFilter,
    surchargeFilter,
  ]);

  const hasActiveFilters = Boolean(
    search ||
      accountFilter !== "all" ||
      statusFilter !== "all" ||
      carrierFilter !== "all" ||
      brokerFilter !== "all" ||
      agentFilter !== "all" ||
      countryFilter !== "all" ||
      surchargeFilter !== "all"
  );

  const handleResetFilters = () => {
    setSearch("");
    setAccountFilter("all");
    setStatusFilter("all");
    setCarrierFilter("all");
    setBrokerFilter("all");
    setAgentFilter("all");
    setCountryFilter("all");
    setSurchargeFilter("all");
  };

  // Microsoft Excel (.xlsx) Export Handler with RTL and Numerical Precision
  const handleExportExcel = async () => {
    if (isExportingExcel) return;
    try {
      setIsExportingExcel(true);
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      const dataList = (hasActiveFilters || search.trim()) ? filteredShipments : shipments;

      const now = new Date();
      const nowFormattedDate = formatDate(now);
      const nowFormattedTime = now.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" });
      const nowFormatted = `${nowFormattedDate}، ${nowFormattedTime}`;
      const docRefCode = `XS-SHP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

      const totalCount = dataList.length;
      const totalActualWeight = dataList.reduce((acc, s) => acc + (s.actualWeight ?? s.weight ?? 0), 0);
      const totalVolWeight = dataList.reduce((acc, s) => acc + (s.volumetricWeight ?? 0), 0);
      const totalChargeableWeight = dataList.reduce((acc, s) => acc + (s.weight ?? 0), 0);
      const totalCost = dataList.reduce((acc, s) => acc + (s.costPrice ?? 0), 0);
      const totalSales = dataList.reduce((acc, s) => acc + (s.sellingPrice ?? s.priceEgp ?? 0), 0);
      const totalTrans = dataList.reduce((acc, s) => acc + (s.transExpense ?? 0), 0);
      const totalProfit = dataList.reduce(
        (acc, s) => acc + (s.netProfit ?? ((s.sellingPrice ?? s.priceEgp ?? 0) - (s.costPrice ?? 0) - (s.transExpense ?? 0))),
        0
      );
      const overallMarginPct = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : "0.0";

      // --- SHEET 1: Master Data Ledger (Starts directly at Row 1 for instant mobile display) ---
      const ledgerHeaders: string[] = [
        isRTL ? "م" : "#",
        isRTL ? "التاريخ" : "Date",
        isRTL ? "رقم البوليصة (AWB)" : "AWB Number",
        isRTL ? "حالة الشحنة" : "Status",
        isRTL ? "اسم العميل / الحساب" : "Client Account",
        isRTL ? "اسم المستلم" : "Consignee",
        isRTL ? "البلد المستقبِلة" : "Destination",
        isRTL ? "الشركة الناقلة" : "Carrier",
        isRTL ? "الشركة الوسيطة" : "Broker",
        isRTL ? "محتويات الشحنة" : "Contents",
        isRTL ? "الوزن الفعلي (كجم)" : "Actual Wt (kg)",
        isRTL ? "الوزن الحجمي (كجم)" : "Volumetric Wt (kg)",
        isRTL ? "الوزن المحتسب (كجم)" : "Chargeable Wt (kg)",
        isRTL ? "الأبعاد (سم)" : "Dimensions (cm)",
        isRTL ? "سعر التكلفة (EGP)" : "Cost Price (EGP)",
        isRTL ? "سعر البيع (EGP)" : "Selling Price (EGP)",
        isRTL ? "مصاريف النقل (EGP)" : "Trans Expense (EGP)",
        isRTL ? "صافي الربح (EGP)" : "Net Profit (EGP)",
        isRTL ? "نسبة هامش الربح" : "Profit Margin %",
        isRTL ? "المسؤول / المسجل" : "Agent Name",
        isRTL ? "ملاحظات التشغيل" : "Operational Notes"
      ];

      const ledgerRows: (string | number)[][] = [ledgerHeaders];

      dataList.forEach((s, idx) => {
        const selling = s.sellingPrice ?? s.priceEgp ?? 0;
        const cost = s.costPrice ?? 0;
        const trans = s.transExpense ?? 0;
        const profit = s.netProfit ?? (selling - cost - trans);
        const margin = selling > 0 ? ((profit / selling) * 100).toFixed(1) + "%" : "0%";
        const dimStr = s.dim || (s.length && s.width && s.height ? `${s.length}x${s.width}x${s.height} cm` : "");

        ledgerRows.push([
          idx + 1,
          s.date || "",
          s.awb || "",
          s.status || "",
          s.account || s.company || "",
          s.receiverName || "",
          s.country || "",
          formatCarrierName(s.carrier),
          s.broker || "XSpeed",
          s.contents || "",
          Number((s.actualWeight ?? s.weight ?? 0).toFixed(2)),
          Number((s.volumetricWeight ?? 0).toFixed(2)),
          Number((s.weight ?? 0).toFixed(2)),
          dimStr,
          Number(cost.toFixed(2)),
          Number(selling.toFixed(2)),
          Number(trans.toFixed(2)),
          Number(profit.toFixed(2)),
          margin,
          s.agentName || "",
          s.opNote || ""
        ]);
      });

      // Consolidated Grand Total Row at bottom of table
      ledgerRows.push([
        isRTL ? "المجموع" : "Total",
        isRTL ? "المجموع الكلي الإجمالي (Grand Total)" : "Consolidated Grand Total",
        `${totalCount} ${isRTL ? "شحنة" : "Shipments"}`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        Number(totalActualWeight.toFixed(2)),
        Number(totalVolWeight.toFixed(2)),
        Number(totalChargeableWeight.toFixed(2)),
        "",
        Number(totalCost.toFixed(2)),
        Number(totalSales.toFixed(2)),
        Number(totalTrans.toFixed(2)),
        Number(totalProfit.toFixed(2)),
        `${overallMarginPct}%`,
        "",
        ""
      ]);

      const wsLedger = XLSX.utils.aoa_to_sheet(ledgerRows);

      // Set optimal column widths
      wsLedger["!cols"] = [
        { wch: 6 },   // م
        { wch: 18 },  // التاريخ
        { wch: 22 },  // رقم البوليصة
        { wch: 16 },  // حالة الشحنة
        { wch: 28 },  // اسم العميل / الحساب
        { wch: 24 },  // اسم المستلم
        { wch: 18 },  // البلد المستقبِلة
        { wch: 16 },  // الشركة الناقلة
        { wch: 14 },  // الشركة الوسيطة
        { wch: 22 },  // محتويات الشحنة
        { wch: 16 },  // الوزن الفعلي
        { wch: 16 },  // الوزن الحجمي
        { wch: 18 },  // الوزن المحتسب
        { wch: 16 },  // الأبعاد
        { wch: 16 },  // سعر التكلفة
        { wch: 16 },  // سعر البيع
        { wch: 18 },  // مصاريف النقل
        { wch: 18 },  // صافي الربح
        { wch: 16 },  // نسبة هامش الربح
        { wch: 18 },  // المسؤول / المسجل
        { wch: 30 },  // ملاحظات التشغيل
      ];

      XLSX.utils.book_append_sheet(wb, wsLedger, isRTL ? "سجل الشحنات والعمليات" : "Shipments Ledger");

      // --- SHEET 2: Executive Summary & KPIs ---
      const summaryRows: (string | number)[][] = [
        [isRTL ? "شركة إكس سبيد لخدمات الشحن السريع واللوجستيات | XSPEED EXPRESS LOGISTICS" : "XSPEED Express Freight & Logistics Operations"],
        [isRTL ? "ملخص المؤشرات التشغيلية والمالية للشحنات (Operational & Financial KPIs)" : "Operational & Financial KPI Summary"],
        [],
        [isRTL ? "معلومات السجل والفلترة الحالية" : "Record Metadata & Scope"],
        [
          isRTL ? "الرقم المرجعي للوثيقة:" : "Document Reference:",
          docRefCode
        ],
        [
          isRTL ? "تاريخ ووقت الإصدار:" : "Issue Date & Time:",
          nowFormatted
        ],
        [
          isRTL ? "حساب العميل المحدد:" : "Client Filter:",
          accountFilter !== "all" ? accountFilter : (isRTL ? "كافة الحسابات (الكل)" : "All Client Accounts")
        ],
        [
          isRTL ? "الشركة الناقلة:" : "Carrier Filter:",
          carrierFilter !== "all" ? carrierFilter : (isRTL ? "كافة الخطوط والناقلين" : "All Carriers")
        ],
        [
          isRTL ? "حالة الشحنة المحددة:" : "Status Filter:",
          statusFilter !== "all" ? statusFilter : (isRTL ? "كافة الحالات" : "All Statuses")
        ],
        [
          isRTL ? "الوجهة / الدولة:" : "Destination Country:",
          countryFilter !== "all" ? countryFilter : (isRTL ? "كافة الوجهات" : "All Destinations")
        ],
        [
          isRTL ? "إجمالي الشحنات المضمنة:" : "Exported Records:",
          `${totalCount} ${isRTL ? "شحنة مسجلة" : "Shipments"}`
        ],
        [
          isRTL ? "العملة الرسمية:" : "Currency:",
          isRTL ? "جنيه مصري (EGP)" : "Egyptian Pound (EGP)"
        ],
        [],
        [isRTL ? "المؤشر التشغيلي / المالي" : "Metric / Indicator", isRTL ? "القيمة" : "Amount / Value", isRTL ? "الوحدة / الملاحظات" : "Unit / Notes"],
        [isRTL ? "إجمالي عدد بوالص الشحن" : "Total Shipments Count", totalCount, isRTL ? "بوليصة شحن مسجلة" : "Registered AWBs"],
        [isRTL ? "إجمالي الوزن الفعلي (Actual Weight)" : "Total Actual Weight", Number(totalActualWeight.toFixed(2)), isRTL ? "كجم إجمالي" : "KG Total"],
        [isRTL ? "إجمالي الوزن الحجمي (Volumetric Weight)" : "Total Volumetric Weight", Number(totalVolWeight.toFixed(2)), isRTL ? "كجم حجمي" : "Volumetric KG"],
        [isRTL ? "إجمالي الوزن المحتسب (Chargeable Weight)" : "Total Chargeable Weight", Number(totalChargeableWeight.toFixed(2)), isRTL ? "كجم خاضع للفوترة" : "Billable KG"],
        [isRTL ? "إجمالي المبيعات المحصلة (Gross Billed Sales)" : "Total Billed Sales", Number(totalSales.toFixed(2)), isRTL ? "100% إجمالي فواتير الشحن" : "100% Gross Revenue"],
        [isRTL ? "إجمالي التكلفة المباشرة (Direct Costs)" : "Total Direct Costs", Number(totalCost.toFixed(2)), `${totalSales > 0 ? ((totalCost / totalSales) * 100).toFixed(1) : 0}% ${isRTL ? "من المبيعات" : "of Sales"}`],
        [isRTL ? "إجمالي مصاريف النقل (Transport Expense)" : "Total Transport Expense", Number(totalTrans.toFixed(2)), `${totalSales > 0 ? ((totalTrans / totalSales) * 100).toFixed(1) : 0}% ${isRTL ? "من المبيعات" : "of Sales"}`],
        [isRTL ? "صافي الربح الإجمالي المحقق (Net Profit)" : "Total Net Profit", Number(totalProfit.toFixed(2)), `${isRTL ? "هامش الربح:" : "Net Margin:"} ${overallMarginPct}%`]
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary["!cols"] = [
        { wch: 38 },
        { wch: 24 },
        { wch: 28 }
      ];

      XLSX.utils.book_append_sheet(wb, wsSummary, isRTL ? "ملخص المؤشرات" : "KPI Summary");

      // Set Right-to-Left (RTL) for Arabic sheets
      wb.Workbook = { Views: [{ RTL: isRTL }] };

      const dateStamp = new Date().toISOString().split("T")[0];
      const fileName = `XSPEED_Shipments_Ledger_${dateStamp}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Excel generation error:", error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    accountFilter,
    statusFilter,
    carrierFilter,
    brokerFilter,
    agentFilter,
    countryFilter,
    surchargeFilter,
  ]);

  // High-performance single-pass metrics calculation
  const metrics = useMemo(() => {
    let sellingSum = 0;
    let costSum = 0;
    let transSum = 0;
    let profitSum = 0;
    let delivered = 0;
    let inTransit = 0;
    let exception = 0;
    let weightSum = 0;

    for (let i = 0; i < filteredShipments.length; i++) {
      const s = filteredShipments[i];
      const selling = s.sellingPrice || s.priceEgp || 0;
      const cost = s.costPrice || 0;
      const trans = s.transExpense || 0;
      const profit = s.netProfit !== undefined ? s.netProfit : selling - cost - trans;
      const wt = s.weight || s.actualWeight || 0;

      sellingSum += selling;
      costSum += cost;
      transSum += trans;
      profitSum += profit;
      weightSum += wt;

      const st = (s.status || "").toLowerCase();
      if (st === "delivered" || st === "deliverd") {
        delivered++;
      } else if (st === "in transit" || st === "in-transit" || st === "processing" || st === "ready for dispatch") {
        inTransit++;
      } else if (st === "exception" || st === "delayed" || st === "rto") {
        exception++;
      }
    }

    const volume = filteredShipments.length;
    const marginPct = sellingSum > 0 ? Math.round((profitSum / sellingSum) * 100) : 0;
    const slaPct = volume > 0 ? Math.round((delivered / volume) * 100) : 100;

    return {
      totalVolume: volume,
      totalSelling: sellingSum,
      totalCost: costSum,
      totalTrans: transSum,
      totalNetProfit: profitSum,
      overallMarginPct: marginPct,
      deliveredCount: delivered,
      inTransitCount: inTransit,
      exceptionCount: exception,
      deliverySlaPct: slaPct,
      totalWeightKg: weightSum,
    };
  }, [filteredShipments]);

  const {
    totalVolume,
    totalSelling,
    totalCost,
    totalTrans,
    totalNetProfit,
    overallMarginPct,
    deliveredCount,
    inTransitCount,
    exceptionCount,
    deliverySlaPct,
    totalWeightKg,
  } = metrics;

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / pageSize));
  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShipments.slice(start, start + pageSize);
  }, [filteredShipments, currentPage, pageSize]);

  return (
    <div className="space-y-6 text-start">
      {/* ─── 1. EXECUTIVE KPI METRICS BENTO GRID (INTERACTIVE) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {/* Card 1: Total Consignments */}
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "all"
              ? "bg-white border-[#C45B2A] shadow-md ring-2 ring-[#C45B2A]/20"
              : "bg-white hover:bg-gray-50/80 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-gray-500 truncate">
              {isRTL ? "إجمالي الشحنات" : "Total Shipments"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C45B2A] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#251516]">
              {totalVolume}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate">
              {isRTL ? `إجمالي الوزن: ${totalWeightKg.toFixed(1)} كجم` : `Total Weight: ${totalWeightKg.toFixed(1)} kg`}
            </p>
          </div>
        </div>

        {/* Card 2: Active In Transit */}
        <div
          onClick={() => setStatusFilter("In Transit")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "In Transit"
              ? "bg-blue-50/40 border-blue-500 shadow-md ring-2 ring-blue-500/20"
              : "bg-white hover:bg-blue-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-blue-900 truncate">
              {isRTL ? "جارية بالمسار" : "In Transit"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-blue-700">
              {inTransitCount}
            </div>
            <p className="text-[10px] text-blue-800/80 font-semibold mt-0.5 truncate">
              {isRTL ? "شحنات نشطة بالترانزيت" : "Active in transit"}
            </p>
          </div>
        </div>

        {/* Card 3: Delivered Successfully */}
        <div
          onClick={() => setStatusFilter("Delivered")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "Delivered" || statusFilter === "Deliverd"
              ? "bg-emerald-50/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white hover:bg-emerald-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-900 truncate">
              {isRTL ? "تم التسليم" : "Delivered"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
              {deliveredCount}
            </div>
            <p className="text-[10px] text-emerald-800/80 font-semibold mt-0.5 truncate">
              {isRTL ? `كفاءة التسليم ${deliverySlaPct}%` : `Delivery SLA ${deliverySlaPct}%`}
            </p>
          </div>
        </div>

        {/* Card 4: Gross Sales */}
        <div className="p-4 rounded-2xl border border-gray-200/90 bg-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-indigo-900 truncate">
              {isRTL ? "إيرادات المبيعات" : "Gross Revenue"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono text-indigo-950 truncate" dir="ltr">
              {totalSelling.toLocaleString()} <span className="text-xs font-bold text-indigo-600">{isRTL ? "ج.م" : "EGP"}</span>
            </div>
            <p className="text-[10px] text-indigo-800/80 font-semibold mt-0.5 truncate">
              {isRTL ? "إجمالي الفواتير المفوترة" : "Total billed sales"}
            </p>
          </div>
        </div>

        {/* Card 5: Net Profit */}
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-900 truncate">
              {isRTL ? "صافي الربح" : "Net Profit"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-800 truncate" dir="ltr">
              {totalNetProfit.toLocaleString()} <span className="text-xs font-bold text-emerald-600">{isRTL ? "ج.م" : "EGP"}</span>
            </div>
            <p className="text-[10px] text-emerald-800/80 font-semibold mt-0.5 truncate">
              {isRTL ? `هامش الربح: ${overallMarginPct}%` : `Margin: ${overallMarginPct}%`}
            </p>
          </div>
        </div>

        {/* Card 6: Exceptions & Alerts */}
        <div
          onClick={() => setStatusFilter("Exception")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "Exception"
              ? "bg-rose-50 border-rose-500 shadow-md ring-2 ring-rose-500/20"
              : exceptionCount > 0
              ? "bg-rose-50/30 hover:bg-rose-50/60 border-rose-200 shadow-2xs"
              : "bg-white hover:bg-gray-50/80 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[11px] font-bold truncate ${exceptionCount > 0 ? "text-rose-700 font-black" : "text-gray-500"}`}>
              {isRTL ? "توقفات واستثناءات" : "Exceptions"}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
              exceptionCount > 0 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-gray-100 text-gray-400"
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-2xl sm:text-3xl font-black font-mono ${exceptionCount > 0 ? "text-rose-700" : "text-gray-400"}`}>
              {exceptionCount}
            </div>
            <p className="text-[10px] text-rose-700/80 font-semibold mt-0.5 truncate">
              {exceptionCount > 0 ? (isRTL ? "بحاجة لمتابعة جمركية" : "Check customs/delay") : (isRTL ? "عمليات سلسة بدون تأخير" : "Zero exceptions")}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. SHIPMENT FLEET STATUS PROGRESS BAR ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#251516] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#C45B2A]" />
            <span>{isRTL ? "مؤشر توزيع الحالات التشغيلية للشحنات" : "Shipment Status Distribution"}</span>
          </span>
          <span className="text-gray-500 font-mono text-[11px]">
            {isRTL ? `نسبة التسليم المكتمل: ${deliverySlaPct}%` : `Delivery Rate: ${deliverySlaPct}%`}
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
          {totalVolume > 0 ? (
            <>
              {inTransitCount > 0 && (
                <div
                  style={{ width: `${(inTransitCount / totalVolume) * 100}%` }}
                  className="bg-blue-500 h-full transition-all duration-500"
                  title={`${isRTL ? "جارية بالمسار" : "In Transit"}: ${inTransitCount}`}
                />
              )}
              {deliveredCount > 0 && (
                <div
                  style={{ width: `${(deliveredCount / totalVolume) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`${isRTL ? "تم التسليم" : "Delivered"}: ${deliveredCount}`}
                />
              )}
              {exceptionCount > 0 && (
                <div
                  style={{ width: `${(exceptionCount / totalVolume) * 100}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`${isRTL ? "توقفات واستثناءات" : "Exceptions"}: ${exceptionCount}`}
                />
              )}
              {(totalVolume - inTransitCount - deliveredCount - exceptionCount) > 0 && (
                <div
                  style={{ width: `${((totalVolume - inTransitCount - deliveredCount - exceptionCount) / totalVolume) * 100}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                  title={`${isRTL ? "حالات أخرى" : "Other"}: ${totalVolume - inTransitCount - deliveredCount - exceptionCount}`}
                />
              )}
            </>
          ) : (
            <div className="w-full bg-gray-200 h-full" />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-semibold text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span>{isRTL ? "جارية بالمسار:" : "In Transit:"} <strong className="text-gray-900 font-mono">{inTransitCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{isRTL ? "تم التسليم:" : "Delivered:"} <strong className="text-gray-900 font-mono">{deliveredCount}</strong></span>
          </div>
          {exceptionCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>{isRTL ? "استثناءات وتأخير:" : "Exceptions:"} <strong className="text-gray-900 font-mono">{exceptionCount}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span>{isRTL ? "إجمالي القيد:" : "Total AWBs:"} <strong className="text-gray-900 font-mono">{totalVolume}</strong></span>
          </div>
        </div>
      </div>

      {/* ─── 2. CONTROL BAR: SEARCH, FILTERS & ACTION CTAS ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3.5">
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-3 h-4 w-4 text-gray-400`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث برقم البوليصة، اسم العميل، المستلم، الدولة، المحتوى، المسجل..." : "Search AWB, client account, consignee, country, agent..."}
              className={`w-full h-11 bg-gray-50/90 text-[#251516] text-xs font-semibold rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:bg-white focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all ${
                isRTL ? "pr-10 pl-9 text-right" : "pl-10 pr-9 text-left"
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={`absolute ${isRTL ? "left-3" : "right-3"} top-3 text-gray-400 hover:text-gray-600 p-0.5 rounded-md cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Actions & Export */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetFilters}
                className="h-11 px-3 text-xs font-bold border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 hover:text-rose-800 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRTL ? "إلغاء الفلاتر" : "Reset"}</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="h-11 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-2 rounded-xl cursor-pointer disabled:opacity-70 shadow-xs transition-colors"
            >
              {isExportingExcel ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 text-emerald-200" />
              )}
              <span>
                {isExportingExcel
                  ? (isRTL ? "جاري التجهيز..." : "Exporting Excel...")
                  : (isRTL ? "تصدير إكسل (Excel)" : "Export Excel (.xlsx)")}
              </span>
            </Button>

            <Button
              size="sm"
              variant="brand"
              onClick={() => setNewModalOpen(true)}
              className="h-11 px-5 text-xs font-extrabold bg-[#C45B2A] hover:bg-[#A8481B] text-white rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{t("admin.shipments.bookShipment")}</span>
            </Button>
          </div>
        </div>

        {/* Filter Dropdown Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2 pt-1 border-t border-gray-100">
          {/* 1. حساب العميل (Client Account) */}
          <div className="relative flex items-center">
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className={`w-full h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs appearance-none ${
                accountFilter !== "all"
                  ? "bg-orange-50/90 text-[#C45B2A] border-orange-300 font-extrabold"
                  : "bg-gray-50/80 text-gray-800 border-gray-200 hover:border-gray-300"
              } ${isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"}`}
            >
              <option value="all">{t("admin.shipments.allClientAccounts")}</option>
              {uniqueAccounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
          </div>

          {/* 2. اسم المسجل (Agent) */}
          <div className="relative flex items-center">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className={`w-full h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs appearance-none ${
                agentFilter !== "all"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300 font-extrabold"
                  : "bg-gray-50/80 text-gray-800 border-gray-200 hover:border-gray-300"
              } ${isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"}`}
            >
              <option value="all">{t("admin.shipments.allAgents")}</option>
              {uniqueAgents.map((ag) => (
                <option key={ag} value={ag}>
                  {ag}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
          </div>

          {/* 3. الشركة الناقلة (Carrier - Express) */}
          <div className="relative flex items-center">
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className={`w-full h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs appearance-none ${
                carrierFilter !== "all"
                  ? "bg-amber-50 text-amber-800 border-amber-300 font-extrabold"
                  : "bg-gray-50/80 text-gray-800 border-gray-200 hover:border-gray-300"
              } ${isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"}`}
            >
              <option value="all">{t("admin.shipments.allCarriers")}</option>
              {uniqueCarriers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
          </div>

          {/* 4. الشركة الوسيطة (Broker) */}
          <div className="relative flex items-center">
            <select
              value={brokerFilter}
              onChange={(e) => setBrokerFilter(e.target.value)}
              className={`w-full h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs appearance-none ${
                brokerFilter !== "all"
                  ? "bg-purple-50 text-purple-800 border-purple-300 font-extrabold"
                  : "bg-gray-50/80 text-gray-800 border-gray-200 hover:border-gray-300"
              } ${isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"}`}
            >
              <option value="all">{t("admin.shipments.allBrokers")}</option>
              {uniqueBrokers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
          </div>

          {/* 5. حالة الشحنة (Status) */}
          <div className="relative flex items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs appearance-none ${
                statusFilter !== "all"
                  ? "bg-blue-50 text-blue-800 border-blue-300 font-extrabold"
                  : "bg-gray-50/80 text-gray-800 border-gray-200 hover:border-gray-300"
              } ${isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"}`}
            >
              <option value="all">{t("admin.shipments.allStatuses")}</option>
              {uniqueStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
          </div>

          {/* 6. الدولة المستقبلة (Country) */}
          <div className="relative flex items-center">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className={`w-full h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs appearance-none ${
                countryFilter !== "all"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold"
                  : "bg-gray-50/80 text-gray-800 border-gray-200 hover:border-gray-300"
              } ${isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"}`}
            >
              <option value="all">{t("admin.shipments.allCountries")}</option>
              {uniqueCountries.map((co) => (
                <option key={co} value={co}>
                  {co}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
          </div>

          {/* 7. المصاريف الإضافية (Surcharges) */}
          <div className="relative flex items-center">
            <select
              value={surchargeFilter}
              onChange={(e) => setSurchargeFilter(e.target.value)}
              className={`w-full h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs appearance-none ${
                surchargeFilter !== "all"
                  ? "bg-rose-50 text-rose-800 border-rose-300 font-extrabold"
                  : "bg-gray-50/80 text-gray-800 border-gray-200 hover:border-gray-300"
              } ${isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"}`}
            >
              <option value="all">{t("admin.shipments.allSurcharges")}</option>
              {uniqueSurcharges.map((sur) => (
                <option key={sur} value={sur}>
                  {sur}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
          </div>
        </div>
      </div>

      {/* ─── 3. ACTIVE CLIENT ACCOUNT BANNER (IF FILTERED) ─── */}
      {accountFilter !== "all" && (
        <div className="p-4 bg-orange-50/95 rounded-2xl border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-gray-900 shadow-2xs animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#C45B2A] text-white shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-gray-950 text-sm">
                {isRTL
                  ? `عرض شحنات الحساب الخاص بالعميل: ${accountFilter}`
                  : `Filtering shipments for Client Account: ${accountFilter}`}
              </p>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {isRTL
                  ? `عرض ${filteredShipments.length} شحنة مسجلة • إجمالي المبيعات: ${totalSelling.toLocaleString()} ج.م • صافي الأرباح: ${totalNetProfit.toLocaleString()} ج.م`
                  : `Displaying ${filteredShipments.length} AWBs • Sales: ${totalSelling.toLocaleString()} EGP • Net Profit: ${totalNetProfit.toLocaleString()} EGP`}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAccountFilter("all")}
            className="text-xs font-bold border-orange-300 text-orange-950 bg-white hover:bg-orange-100 rounded-xl cursor-pointer self-start sm:self-center"
          >
            {t("admin.shipments.clearFilter")}
          </Button>
        </div>
      )}

      {/* ─── 4. MAIN OPERATIONAL TABLE ─── */}
      <Card className="shadow-2xs overflow-hidden border border-gray-200/90 rounded-2xl bg-white">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[1650px] w-full text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50/95 hover:bg-gray-50/95 text-xs font-black text-gray-700 whitespace-nowrap border-b border-gray-200 select-none">
                <TableHead className="w-[9%] py-3.5 px-3 text-start font-black text-gray-700">{t("admin.shipments.table.date")}</TableHead>
                <TableHead className="w-[12%] py-3.5 px-3 text-start font-black text-gray-700">{t("admin.shipments.table.status")}</TableHead>
                <TableHead className="w-[13%] py-3.5 px-3 text-start font-black text-gray-700">{t("admin.shipments.table.awb")}</TableHead>
                <TableHead className="w-[11%] py-3.5 px-3 text-start font-black text-gray-700">{t("admin.shipments.table.account")}</TableHead>
                <TableHead className="w-[10%] py-3.5 px-3 text-start font-black text-gray-700">{t("admin.shipments.table.consignee")}</TableHead>
                <TableHead className="w-[9%] py-3.5 px-3 text-start font-black text-gray-700">{t("admin.shipments.table.contents")}</TableHead>
                <TableHead className="w-[9%] py-3.5 px-3 text-start font-black text-gray-700">{t("admin.shipments.table.destination")}</TableHead>
                <TableHead className="w-[8%] py-3.5 px-3 text-start font-black text-gray-700">{t("admin.shipments.table.carrier")}</TableHead>
                <TableHead className="w-[6%] py-3.5 px-2 text-start font-black text-gray-700">{t("admin.shipments.table.broker")}</TableHead>
                <TableHead className="w-[5%] py-3.5 px-2 text-center font-black text-gray-700">{t("admin.shipments.table.actualWt")}</TableHead>
                <TableHead className="w-[7%] py-3.5 px-2 text-center font-black text-gray-700">{isRTL ? "الأبعاد (L×W×H)" : "Dim (cm)"}</TableHead>
                <TableHead className="w-[5%] py-3.5 px-2 text-center font-black text-gray-700">{t("admin.shipments.table.volWt")}</TableHead>
                <TableHead className="w-[6%] py-3.5 px-2 text-center font-black text-gray-700">{t("admin.shipments.table.finalWt")}</TableHead>
                <TableHead className="w-[6%] py-3.5 px-2 text-center font-black text-gray-700">{t("admin.shipments.table.cost")}</TableHead>
                <TableHead className="w-[6%] py-3.5 px-2 text-center font-black text-gray-700">{t("admin.shipments.table.sellingPrice")}</TableHead>
                <TableHead className="w-[5%] py-3.5 px-2 text-center font-black text-gray-700">{t("admin.shipments.table.transExp")}</TableHead>
                <TableHead className="w-[7%] py-3.5 px-2 text-center font-black text-gray-700">{t("admin.shipments.table.netProfit")}</TableHead>
                <TableHead className="w-[6%] py-3.5 px-2 text-center font-black text-gray-700">{t("admin.shipments.table.agent")}</TableHead>
                <TableHead className="w-[6%] py-3.5 px-3 text-end font-black text-gray-700">{t("admin.shipments.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-16 text-gray-500">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <Package className="h-7 w-7" />
                    </div>
                    <p className="text-base font-bold text-gray-900">{t("admin.shipments.noShipments")}</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      {isRTL
                        ? "لم يتم العثور على أي بوالص مطابقة لمعايير البحث أو الفلاتر المحددة."
                        : "No consignments match the current search query or applied filter criteria."}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetFilters}
                        className="mt-4 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        <span>{isRTL ? "إعادة ضبط جميع الفلاتر" : "Clear all filters"}</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedShipments.map((s) => {
                  const netProf =
                    s.netProfit !== undefined
                      ? s.netProfit
                      : (s.sellingPrice || s.priceEgp || 0) - (s.costPrice || 0) - (s.transExpense || 0);
                  const isLoss = netProf < 0;
                  const isLowProfit = netProf >= 0 && netProf < 450;
                  const hasOpNote = !!s.opNote;
                  const displayCarrier = formatCarrierName(s.carrier);

                  return (
                    <TableRow key={s.id} className="hover:bg-orange-50/20 transition-colors text-xs border-b border-gray-100">
                      {/* 1. التاريخ */}
                      <TableCell className="py-3 px-3 text-start whitespace-nowrap">
                        <span className="font-mono text-gray-600 bg-gray-50 border border-gray-200/80 px-2 py-0.5 rounded-md font-semibold text-[11px] inline-block" dir="ltr">
                          {formatDate(s.date) || s.date?.split(" ")[0] || s.date}
                        </span>
                      </TableCell>

                      {/* 2. حالة الشحنة */}
                      <TableCell className="py-3 px-3 text-start">
                        <div className="space-y-1">
                          <Badge
                            variant={
                              s.status === "Delivered" || (s.status as string) === "Deliverd"
                                ? "success"
                                : s.status === "Exception" || (s.status as string) === "RTO"
                                ? "destructive"
                                : "brand"
                            }
                            size="sm"
                            className="font-bold text-[10px]"
                          >
                            {s.currentLocation || s.status}
                          </Badge>
                          {hasOpNote && (
                            <span
                              className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1 max-w-[150px]"
                              title={s.opNote}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{s.opNote}</span>
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* 3. رقم البوليصة (AWB) */}
                      <TableCell className="py-3 px-3 text-start whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-orange-50 border border-gray-200 text-[#251516] font-mono text-[11px] font-bold transition-colors">
                          <span className="truncate max-w-[120px]" dir="ltr">{s.awb}</span>
                          <TrackingRedirect carrier={s.carrier} awb={s.awb} variant="icon" />
                        </div>
                      </TableCell>

                      {/* 4. اسم العميل (Account) */}
                      <TableCell className="py-3 px-3 text-start whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAccountFilter((s.account || s.company).trim())}
                            className="font-bold text-gray-900 hover:text-[#C45B2A] hover:underline cursor-pointer block text-start truncate max-w-[120px]"
                            title={t("admin.shipments.table.viewClientOnlyTooltip")}
                          >
                            {s.account || s.company}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newAcc = prompt(t("admin.shipments.table.assignAccountPrompt"), s.account || s.company);
                              if (newAcc && newAcc.trim()) {
                                onUpdateShipment({ ...s, account: newAcc.trim(), company: newAcc.trim() });
                              }
                            }}
                            className="p-1 rounded bg-orange-50 text-[#C45B2A] hover:bg-orange-100 transition-colors cursor-pointer shrink-0"
                            title={t("admin.shipments.table.assignAccountTooltip")}
                          >
                            <UserCheck className="w-3 h-3" />
                          </button>
                        </div>
                      </TableCell>

                      {/* 5. اسم المستلم (Consignee) */}
                      <TableCell className="py-3 px-3 text-start font-semibold text-gray-900 truncate max-w-[130px]" title={s.receiverName || ""}>
                        {s.receiverName || "—"}
                      </TableCell>

                      {/* 6. محتويات الشحنة (Contents) */}
                      <TableCell className="py-3 px-3 text-start text-gray-600 font-medium truncate max-w-[130px]" title={s.contents || ""}>
                        {s.contents || (isRTL ? "طرد بضائع" : "Consignment")}
                      </TableCell>

                      {/* 7. البلد المستقبِلة (Destination Country) */}
                      <TableCell className="py-3 px-3 text-start font-semibold text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                          <span className="truncate max-w-[110px]">{s.country || "—"}</span>
                        </div>
                      </TableCell>

                      {/* 8. الشركة الناقلة (Carrier - Express) */}
                      <TableCell className="py-3 px-3 text-start font-black text-gray-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-extrabold text-[11px]">
                          {displayCarrier}
                        </span>
                      </TableCell>

                      {/* 9. الشركة الوسيطة (Broker) */}
                      <TableCell className="py-3 px-2 text-start font-bold text-indigo-700 whitespace-nowrap text-[11px]">
                        {s.broker || "XSPEED"}
                      </TableCell>

                      {/* 10. الوزن الفعلي */}
                      <TableCell className="py-3 px-2 text-center font-mono text-gray-700 whitespace-nowrap text-[11px]" dir="ltr">
                        {s.actualWeight || s.weight} {isRTL ? "كجم" : "KG"}
                      </TableCell>

                      {/* 11. الأبعاد */}
                      <TableCell className="py-3 px-2 text-center font-mono text-gray-500 whitespace-nowrap text-[11px]" dir="ltr">
                        {s.dim || `${s.length || 10}x${s.width || 10}x${s.height || 10}`}
                      </TableCell>

                      {/* 12. الوزن الحجمي */}
                      <TableCell className="py-3 px-2 text-center font-mono text-gray-600 whitespace-nowrap text-[11px]" dir="ltr">
                        {s.volumetricWeight || 0.2} {isRTL ? "كجم" : "KG"}
                      </TableCell>

                      {/* 13. الوزن النهائي */}
                      <TableCell className="py-3 px-2 text-center whitespace-nowrap">
                        <span className="font-mono font-black text-[#C45B2A] bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-md text-[11px]" dir="ltr">
                          {s.weight} {isRTL ? "كجم" : "KG"}
                        </span>
                      </TableCell>

                      {/* 14. التكلفة */}
                      <TableCell className="py-3 px-2 text-center font-mono text-gray-600 whitespace-nowrap text-[11px]" dir="ltr">
                        {s.costPrice || 0} {isRTL ? "ج.م" : "EGP"}
                      </TableCell>

                      {/* 15. سعر البيع */}
                      <TableCell className="py-3 px-2 text-center font-mono font-bold text-gray-900 whitespace-nowrap text-[11px]" dir="ltr">
                        {s.sellingPrice || s.priceEgp} {isRTL ? "ج.م" : "EGP"}
                      </TableCell>

                      {/* 16. مصاريف نقل */}
                      <TableCell className="py-3 px-2 text-center font-mono text-gray-500 whitespace-nowrap text-[11px]" dir="ltr">
                        {s.transExpense || 0} {isRTL ? "ج.م" : "EGP"}
                      </TableCell>

                      {/* 17. صافي الربح */}
                      <TableCell className="py-3 px-2 text-center whitespace-nowrap">
                        <span
                          className={`font-mono font-black text-[11px] px-2 py-0.5 rounded-md border ${
                            isLoss
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isLowProfit
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                          dir="ltr"
                        >
                          {netProf >= 0 ? `+${netProf.toLocaleString()}` : netProf.toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                        </span>
                      </TableCell>

                      {/* 18. اسم المسجل (مع إمكانية التعديل السريع) */}
                      <TableCell className="py-3 px-2 text-center font-semibold text-gray-700 whitespace-nowrap text-[11px]">
                        {editingAgentShipmentId === s.id ? (
                          <div className="inline-flex items-center gap-1.5 min-w-[170px]" onClick={(e) => e.stopPropagation()}>
                            {isCustomAgent ? (
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={inlineAgentValue}
                                  onChange={(e) => setInlineAgentValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSaveAgent(s, inlineAgentValue);
                                    } else if (e.key === "Escape") {
                                      setEditingAgentShipmentId(null);
                                      setIsCustomAgent(false);
                                    }
                                  }}
                                  placeholder={isRTL ? "اسم المسجل..." : "Agent..."}
                                  className="w-full h-8 px-2 bg-white text-[#251516] text-xs font-bold rounded-lg border-2 border-[#C45B2A] focus:outline-none shadow-xs"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div className="relative flex-1">
                                <select
                                  value={inlineAgentValue}
                                  onChange={(e) => {
                                    if (e.target.value === "__custom__") {
                                      setIsCustomAgent(true);
                                      setInlineAgentValue("");
                                    } else {
                                      setInlineAgentValue(e.target.value);
                                    }
                                  }}
                                  className="w-full h-8 px-2 bg-white text-[#251516] text-xs font-bold rounded-lg border-2 border-[#C45B2A] focus:outline-none shadow-xs cursor-pointer"
                                  autoFocus
                                >
                                  {uniqueAgents.map((ag) => (
                                    <option key={ag} value={ag}>
                                      {ag}
                                    </option>
                                  ))}
                                  <option value="__custom__">{isRTL ? "✍️ + اسم مخصص..." : "✍️ + Custom..."}</option>
                                </select>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSaveAgent(s, inlineAgentValue)}
                              disabled={savingAgentShipmentId === s.id}
                              className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                              title={isRTL ? "حفظ" : "Save"}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAgentShipmentId(null);
                                setIsCustomAgent(false);
                              }}
                              className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
                              title={isRTL ? "إلغاء" : "Cancel"}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 group/agent">
                            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-bold border border-gray-200/80 shadow-2xs group-hover/agent:border-[#C45B2A]/40 transition-colors">
                              {s.agentName || "Admin"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAgentShipmentId(s.id);
                                const currentAgent = s.agentName || "Admin";
                                setInlineAgentValue(currentAgent);
                                setIsCustomAgent(!uniqueAgents.includes(currentAgent));
                              }}
                              className="h-6 w-6 rounded-md bg-gray-50 hover:bg-orange-100 text-gray-400 hover:text-[#C45B2A] border border-gray-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs opacity-75 group-hover/agent:opacity-100"
                              title={isRTL ? "تعديل اسم المسجل" : "Edit Agent"}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </TableCell>

                      {/* 19. الإجراءات */}
                      <TableCell className="py-3 px-3 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setInspectShipment(s)}
                            className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer"
                            title={t("admin.shipments.table.viewInspect")}
                          >
                            <Eye className="h-4 w-4 text-[#C45B2A]" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDeleteShipment(s.id)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title={t("admin.shipments.table.delete")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {filteredShipments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 bg-gray-50/70 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span>
                {isRTL ? "عرض" : "Showing"}{" "}
                <strong className="font-mono text-gray-900">
                  {Math.min(filteredShipments.length, (currentPage - 1) * pageSize + 1)}-
                  {Math.min(currentPage * pageSize, filteredShipments.length)}
                </strong>{" "}
                {isRTL ? "من أصل" : "of"}{" "}
                <strong className="font-mono text-gray-900">{filteredShipments.length}</strong>{" "}
                {isRTL ? "شحنة" : "consignments"}
              </span>

              <div className="flex items-center gap-1.5 ms-4">
                <span className="text-gray-500">{isRTL ? "لكل صفحة:" : "Per page:"}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 cursor-pointer shadow-2xs"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>{isRTL ? "السابق" : "Prev"}</span>
              </Button>

              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-mono font-bold text-gray-900 shadow-2xs">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                <span>{isRTL ? "التالي" : "Next"}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ─── 5. CENTERED DIALOG MODAL: INSPECT SHIPMENT DETAILS ─── */}
      <Dialog open={!!inspectShipment} onOpenChange={(open) => !open && setInspectShipment(null)}>
        {inspectShipment && (
          <DialogContent className="max-w-3xl space-y-4 sm:space-y-6 text-start p-4 sm:p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-[#C45B2A] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                    {isRTL ? "تفاصيل البوليصة وسجل الشحنة" : "Consignment Record Details"}
                  </span>
                  <Badge variant="brand" size="sm">
                    {inspectShipment.currentLocation || inspectShipment.status}
                  </Badge>
                </div>
                <h3 className="text-2xl font-black text-[#251516] mt-1 font-mono" dir="ltr">
                  {inspectShipment.awb}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDateTime(inspectShipment.date) || inspectShipment.date} • {formatCarrierName(inspectShipment.carrier)}
                </p>
              </div>

              {/* Header Action: Tracking Redirect */}
              <div className="flex items-center gap-2">
                <TrackingRedirect carrier={inspectShipment.carrier} awb={inspectShipment.awb} variant="button" />
              </div>
            </div>

            {/* Quick Status / Operational Note Alert */}
            {inspectShipment.opNote && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>{isRTL ? "ملاحظة تشغيلية:" : "Operational Note:"}</strong> {inspectShipment.opNote}</span>
              </div>
            )}

            {/* 4 Detailed Information Cards (2x2 Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Card 1: Customer & Consignee */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2 shadow-2xs">
                <span className="font-bold text-gray-400 uppercase text-[10px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#C45B2A]" />
                  <span>{isRTL ? "بيانات العميل والمستلم" : "Customer & Consignee"}</span>
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">{isRTL ? "حساب العميل" : "Client Account"}</span>
                    <p className="font-bold text-gray-900">{inspectShipment.account || inspectShipment.company}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">{isRTL ? "اسم المستلم" : "Consignee"}</span>
                    <p className="font-bold text-gray-900">{inspectShipment.receiverName || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">{isRTL ? "البلد المستقبلة" : "Destination"}</span>
                    <p className="font-bold text-gray-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                      <span>{inspectShipment.country}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">{isRTL ? "المحتويات" : "Contents"}</span>
                    <p className="font-semibold text-gray-800">{inspectShipment.contents || "Consignment"}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Carrier & Physical Metrics */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2 shadow-2xs">
                <span className="font-bold text-gray-400 uppercase text-[10px] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#C45B2A]" />
                  <span>{isRTL ? "الناقل والأوزان والأبعاد" : "Carrier & Physical Metrics"}</span>
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">{isRTL ? "الشركة الناقلة" : "Carrier Line"}</span>
                    <p className="font-bold text-gray-900">{formatCarrierName(inspectShipment.carrier)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">{isRTL ? "الشركة الوسيطة" : "Broker"}</span>
                    <p className="font-bold text-indigo-700">{inspectShipment.broker || "XSPEED"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">{isRTL ? "الوزن الفعلي" : "Actual Wt"}</span>
                    <p className="font-mono font-bold text-gray-900" dir="ltr">
                      {inspectShipment.actualWeight || inspectShipment.weight} {isRTL ? "كجم" : "KG"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">{isRTL ? "الوزن الحجمي" : "Volumetric Wt"}</span>
                    <p className="font-mono font-bold text-gray-900" dir="ltr">
                      {inspectShipment.volumetricWeight || 0.2} {isRTL ? "كجم" : "KG"}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-700">{isRTL ? "الوزن النهائي المحتسب:" : "Final Chargeable Wt:"}</span>
                  <span className="font-mono font-black text-[#C45B2A] bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200 text-xs" dir="ltr">
                    {inspectShipment.weight} {isRTL ? "كجم" : "KG"}
                  </span>
                </div>
              </div>

              {/* Card 3: Route & Registration Details */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2 shadow-2xs">
                <span className="font-bold text-gray-400 uppercase text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C45B2A]" />
                  <span>{isRTL ? "بيانات القيد والتسجيل" : "Registration Details"}</span>
                </span>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 shrink-0">{isRTL ? "المسؤول / المسجل (Agent):" : "Operating Agent:"}</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={uniqueAgents.includes(inspectShipment.agentName || "") ? (inspectShipment.agentName || "Admin") : "__other__"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__other__") {
                            const newAgent = prompt(isRTL ? "أدخل اسم المسجل الجديد:" : "Enter new agent name:", inspectShipment.agentName || "Admin");
                            if (newAgent && newAgent.trim()) {
                              handleSaveAgent(inspectShipment, newAgent.trim());
                            }
                          } else {
                            handleSaveAgent(inspectShipment, val);
                          }
                        }}
                        className="h-8 px-2 bg-white text-[#251516] text-xs font-bold rounded-lg border border-gray-300 focus:border-[#C45B2A] outline-none shadow-2xs cursor-pointer"
                      >
                        {uniqueAgents.map((ag) => (
                          <option key={ag} value={ag}>
                            {ag}
                          </option>
                        ))}
                        <option value="__other__">{isRTL ? "✍️ + اسم مخصص..." : "✍️ + Custom..."}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRTL ? "تاريخ ووقت القيد:" : "Recorded At:"}</span>
                    <span className="font-mono text-gray-700" dir="ltr">{formatDateTime(inspectShipment.date) || inspectShipment.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRTL ? "حالة التسليم الحالية:" : "Delivery Status:"}</span>
                    <span className="font-bold text-emerald-700">{inspectShipment.status}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Financial Ledger Breakdown */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-2 shadow-2xs">
                <span className="font-bold text-emerald-950 uppercase text-[10px] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isRTL ? "البيانات المالية والأرباح" : "Financial Breakdown"}</span>
                </span>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{isRTL ? "سعر البيع للعميل:" : "Selling Price:"}</span>
                    <span className="font-mono font-bold text-gray-900" dir="ltr">
                      {inspectShipment.sellingPrice || inspectShipment.priceEgp} {isRTL ? "ج.م" : "EGP"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{isRTL ? "تكلفة الشحن المباشرة:" : "Carrier Cost:"}</span>
                    <span className="font-mono font-bold text-gray-700" dir="ltr">
                      {inspectShipment.costPrice || 0} {isRTL ? "ج.م" : "EGP"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{isRTL ? "مصاريف نقل (Trans):" : "Trans Expenses:"}</span>
                    <span className="font-mono font-bold text-gray-700" dir="ltr">
                      {inspectShipment.transExpense || 0} {isRTL ? "ج.م" : "EGP"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-emerald-200 font-extrabold text-sm">
                    <span className="text-emerald-950">{isRTL ? "صافي الربح:" : "Net Profit:"}</span>
                    <span className="font-mono text-emerald-700" dir="ltr">
                      +{(inspectShipment.netProfit || (inspectShipment.sellingPrice || inspectShipment.priceEgp || 0) - (inspectShipment.costPrice || 0) - (inspectShipment.transExpense || 0)).toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Action Bar with Close Button */}
            <div className="sticky bottom-0 bg-white pt-4 pb-1 border-t border-gray-100 z-10 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInspectShipment(null)}
                className="w-full sm:w-auto h-10 px-6 rounded-xl font-bold border-gray-300 text-gray-800 hover:bg-gray-100 cursor-pointer shadow-2xs justify-center text-xs sm:text-sm"
              >
                {isRTL ? "إلغاء" : "Close"}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ─── 6. MODAL: BOOK / REGISTER NEW OPERATIONAL SHIPMENT ─── */}
      <Dialog open={newModalOpen} onOpenChange={setNewModalOpen}>
        <DialogContent className="max-w-2xl text-start p-4 sm:p-6" onClose={() => setNewModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              {t("admin.shipments.modal.createTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {t("admin.shipments.modal.createSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
            {/* Import from Customer Request (Optional) */}
            {pendingRequests.length > 0 && (
              <div className="bg-orange-50/70 p-3.5 rounded-xl border border-orange-200 space-y-1.5">
                <label className="font-bold text-[#C45B2A] block text-[11px]">
                  {t("admin.shipments.modal.prefillTitle")}
                </label>
                <div className="relative flex items-center">
                  <select
                    value={selectedRequestId}
                    onChange={(e) => handleImportRequest(e.target.value)}
                    className={`w-full h-10 rounded-xl border border-orange-300 bg-white text-xs font-bold text-gray-900 cursor-pointer shadow-2xs appearance-none ${
                      isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                    }`}
                  >
                    <option value="">{t("admin.shipments.modal.prefillPlaceholder")}</option>
                    {pendingRequests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.requestNumber} • {r.customerName} ({r.companyName || (isRTL ? "شخصي" : "Personal")}) → {r.deliveryCountry} ({r.weight} {isRTL ? "كجم" : "KG"})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
                </div>
                <span className="text-[10px] text-gray-500 block">
                  {t("admin.shipments.modal.prefillHelp")}
                </span>
              </div>
            )}

            {/* Grid 1: Basic Identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.awbLabel")}</label>
                <Input
                  value={formAwb}
                  onChange={(e) => setFormAwb(e.target.value)}
                  placeholder={isRTL ? "أدخل رقم بوليصة الناقل (AWB)" : "e.g. EXP-98421099, 771234567890"}
                  required
                  dir="ltr"
                  className="font-mono uppercase h-10 text-xs rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.accountLabel")}</label>
                <div className="relative flex items-center">
                  <select
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    className={`w-full h-10 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 cursor-pointer appearance-none ${
                      isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                    }`}
                  >
                    {uniqueAccounts.map((acc) => (
                      <option key={acc} value={acc}>{acc}</option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.agentLabel")}</label>
                <div className="relative flex items-center">
                  <select
                    value={formAgentName}
                    onChange={(e) => setFormAgentName(e.target.value)}
                    className={`w-full h-10 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 cursor-pointer appearance-none ${
                      isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                    }`}
                  >
                    {uniqueAgents.map((ag) => (
                      <option key={ag} value={ag}>{ag}</option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
                </div>
              </div>
            </div>

            {/* Grid 2: Consignee & Contents */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.receiverLabel")}</label>
                <Input
                  value={formReceiverName}
                  onChange={(e) => setFormReceiverName(e.target.value)}
                  placeholder={t("admin.shipments.modal.receiverPlaceholder")}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.countryLabel")}</label>
                <div className="relative flex items-center">
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className={`w-full h-10 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 cursor-pointer appearance-none ${
                      isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                    }`}
                  >
                    {uniqueCountries.map((co) => (
                      <option key={co} value={co}>{co}</option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.contentsLabel")}</label>
                <Input
                  value={formContents}
                  onChange={(e) => setFormContents(e.target.value)}
                  placeholder={t("admin.shipments.modal.contentsPlaceholder")}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Grid 3: Carrier & Broker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.carrierLabel")}</label>
                <div className="relative flex items-center">
                  <select
                    value={formCarrier}
                    onChange={(e) => setFormCarrier(e.target.value as any)}
                    className={`w-full h-10 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 cursor-pointer appearance-none ${
                      isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                    }`}
                  >
                     <option value="Express">Express</option>
                    <option value="FEDEX">FedEx Priority</option>
                    <option value="Aramex">Aramex Air</option>
                    <option value="SMSA Express">SMSA Express</option>
                    <option value="UPS">UPS</option>
                    <option value="TNT Express">TNT Express</option>
                    <option value="DB Schenker USA">DB Schenker USA</option>
                    <option value="Container Tracking">Container Tracking</option>
                    <option value="Bill Of Lading (B/L)">Bill Of Lading (B/L)</option>
                    <option value="Post/EMS (with USPS)">Post/EMS (with USPS)</option>
                    <option value="Air Cargo">Air Cargo</option>
                    <option value="Other">شركة شحن أخرى (Other)</option>
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.brokerLabel")}</label>
                <div className="relative flex items-center">
                  <select
                    value={formBroker}
                    onChange={(e) => setFormBroker(e.target.value)}
                    className={`w-full h-10 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 cursor-pointer appearance-none ${
                      isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                    }`}
                  >
                    {uniqueBrokers.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
                </div>
              </div>
            </div>

            {/* Grid 4: Weights & Dimensions */}
            <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl border border-gray-200 space-y-2.5">
              <span className="font-bold text-gray-900 text-xs block">
                {t("admin.shipments.modal.weightDimSection")}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">{t("admin.shipments.modal.actualWeightLabel")}</label>
                  <Input
                    value={formActualWeight}
                    onChange={(e) => setFormActualWeight(e.target.value)}
                    type="number"
                    step="0.1"
                    dir="ltr"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">{t("admin.shipments.modal.lengthLabel")}</label>
                  <Input
                    value={formLength}
                    onChange={(e) => setFormLength(e.target.value)}
                    type="number"
                    dir="ltr"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">{t("admin.shipments.modal.widthLabel")}</label>
                  <Input
                    value={formWidth}
                    onChange={(e) => setFormWidth(e.target.value)}
                    type="number"
                    dir="ltr"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">{t("admin.shipments.modal.heightLabel")}</label>
                  <Input
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                    type="number"
                    dir="ltr"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs font-bold text-gray-900">
                <span className="flex items-center gap-1.5">
                  <span>{t("admin.shipments.modal.volumetricWeightResult")}</span>
                  <span className="text-indigo-600 font-mono inline-block font-black" dir="ltr">{volumetricWtNum} {isRTL ? "كجم" : "KG"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span>{t("admin.shipments.modal.finalWeightResult")}</span>
                  <span className="text-[#C45B2A] font-mono inline-block font-black" dir="ltr">{finalWtNum} {isRTL ? "كجم" : "KG"}</span>
                </span>
              </div>
            </div>

            {/* Grid 5: Cost, Selling & Net Profit Breakdown */}
            <div className="bg-emerald-50/60 p-3.5 sm:p-4 rounded-xl border border-emerald-200 space-y-2.5">
              <span className="font-bold text-emerald-950 text-xs block">
                {t("admin.shipments.modal.financialSection")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] text-gray-700 font-bold block mb-1">{t("admin.shipments.modal.costPriceLabel")}</label>
                  <Input
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    type="number"
                    dir="ltr"
                    className="h-9 text-xs rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-700 font-bold block mb-1">{t("admin.shipments.modal.sellingPriceLabel")}</label>
                  <Input
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    type="number"
                    dir="ltr"
                    className="h-9 text-xs rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-700 font-bold block mb-1">{t("admin.shipments.modal.transExpenseLabel")}</label>
                  <Input
                    value={formTransExpense}
                    onChange={(e) => setFormTransExpense(e.target.value)}
                    type="number"
                    dir="ltr"
                    className="h-9 text-xs rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-200 text-xs font-bold">
                <span className="text-emerald-950">{t("admin.shipments.modal.netProfitResult")}</span>
                <span className={`font-mono text-sm font-black inline-block ${netProfitNum < 0 ? "text-rose-600" : "text-emerald-700"}`} dir="ltr">
                  {netProfitNum >= 0 ? `+${netProfitNum}` : netProfitNum} {isRTL ? "ج.م" : "EGP"}
                </span>
              </div>
            </div>

            {/* Operational Note */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">{t("admin.shipments.modal.surchargeLabel")}</label>
              <div className="relative flex items-center">
                <select
                  value={formOpNote}
                  onChange={(e) => setFormOpNote(e.target.value)}
                  className={`w-full h-10 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 cursor-pointer appearance-none ${
                    isRTL ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"
                  }`}
                >
                  <option value="">{t("admin.shipments.modal.surchargePlaceholder")}</option>
                  {MASTER_EXTRA_EXPENSES.map((sur) => (
                    <option key={sur} value={sur}>{sur}</option>
                  ))}
                </select>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setNewModalOpen(false)} className="rounded-xl font-bold h-10 w-full sm:w-auto justify-center text-xs sm:text-sm">
                {t("admin.shipments.modal.cancelBtn")}
              </Button>
              <Button type="submit" variant="brand" className="rounded-xl font-extrabold bg-[#C45B2A] hover:bg-[#A8481B] text-white h-10 w-full sm:w-auto justify-center text-xs sm:text-sm">
                {t("admin.shipments.modal.registerBtn")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
