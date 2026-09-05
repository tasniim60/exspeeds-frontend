import React, { useState, useEffect } from "react";
import { AdminStorage, ShipmentRequest, Shipment } from "@/lib/adminData";
import { ShipmentRequestService, ShipmentService } from "@/lib/backendApi";
import { useLanguage } from "@/context/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  Edit3,
  XCircle,
  FileText,
  DollarSign,
  User,
  MapPin,
  ExternalLink,
  Plus,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Send,
  Check,
  CheckCheck,
  PhoneCall,
  Calendar,
  Hourglass,
  ChevronDown,
  RotateCcw,
  X,
  Sparkles,
  TrendingUp,
  Calculator,
  Layers,
  Activity,
} from "lucide-react";

interface ShipmentRequestsViewProps {
  onTriggerNotification?: (title: string, message: string, severity: "success" | "warning" | "info" | "critical") => void;
}

// Helper: Calculate waiting duration & determine if overdue (>24h in New or Awaiting Customer Response)
function calculateWaitingDuration(updatedAt: string, createdAt: string, status: ShipmentRequest["status"], isRTL: boolean = false) {
  const timeString = updatedAt || createdAt;
  if (!timeString) {
    return { text: isRTL ? "الآن" : "Just now", hours: 0, isDelayed: false };
  }

  // Parse date safely
  const targetDate = new Date(timeString);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - targetDate.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let text = isRTL ? "الآن" : "Just now";
  if (diffMinutes < 1) {
    text = isRTL ? "الآن" : "Just now";
  } else if (diffMinutes < 60) {
    text = isRTL ? `منذ ${diffMinutes} دقيقة` : `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    text = isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
  } else if (diffDays === 1) {
    text = isRTL ? "منذ يوم" : `1 day ago`;
  } else {
    text = isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
  }

  // Overdue if in New or Awaiting Customer Response AND >= 24 hours
  const isDelayed = (status === "New" || status === "Awaiting Customer Response") && diffHours >= 24;

  return { text, hours: diffHours, isDelayed };
}

export const SUPPORTED_CURRENCIES = [
  { code: "EGP", labelAr: "ج.م (EGP)", labelEn: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound" },
  { code: "USD", labelAr: "$ (USD)", labelEn: "USD ($)", nameAr: "دولار أمريكي", nameEn: "US Dollar" },
  { code: "EUR", labelAr: "€ (EUR)", labelEn: "EUR (€)", nameAr: "يورو", nameEn: "Euro" },
  { code: "SAR", labelAr: "ر.س (SAR)", labelEn: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal" },
  { code: "AED", labelAr: "د.إ (AED)", labelEn: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham" },
  { code: "GBP", labelAr: "£ (GBP)", labelEn: "GBP (£)", nameAr: "جنيه إسترليني", nameEn: "British Pound" },
];

const getLocalizedStatus = (status: ShipmentRequest["status"] | string, isRTL: boolean) => {
  if (!isRTL) {
    if (status === "Approved" || status === "Price Sent" || status === "Customer Confirmed") return "Approved";
    return status;
  }
  switch (status) {
    case "New":
      return "طلب جديد";
    case "Contacted":
      return "تم التواصل";
    case "Approved":
    case "Price Sent":
    case "Customer Confirmed":
      return "معتمد (تم الاتفاق)";
    case "Awaiting Customer Response":
      return "قيد الاتفاق عبر واتساب";
    case "Converted to Shipment":
      return "تم التحويل لبوليصة";
    case "Cancelled":
      return "ملغي";
    default:
      return status;
  }
};

const getLocalizedShipmentType = (type: string, isRTL: boolean) => {
  if (!isRTL) return type;
  switch (type) {
    case "Documents":
      return "مستندات ووثائق";
    case "Parcel":
      return "طرد / شحنة عادية";
    case "Commercial Goods":
      return "بضائع تجارية";
    case "Pallet":
      return "طبلية / بالتة";
    case "Heavy Cargo":
      return "شحن ثقيل";
    default:
      return type;
  }
};

export default function ShipmentRequestsView({ onTriggerNotification }: ShipmentRequestsViewProps) {
  const { t, isRTL } = useLanguage();
  const [requests, setRequests] = useState<ShipmentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [delayedOnlyFilter, setDelayedOnlyFilter] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<ShipmentRequest | null>(null);

  // Inline Price Editing State in Table
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState("");
  const [inlineCurrencyValue, setInlineCurrencyValue] = useState("EGP");
  const [inlineSavingId, setInlineSavingId] = useState<string | null>(null);

  // Edit / Action Form State inside Modal
  const [quotedPriceInput, setQuotedPriceInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("EGP");
  const [internalNotesInput, setInternalNotesInput] = useState("");
  const [statusInput, setStatusInput] = useState<ShipmentRequest["status"]>("New");

  // Convert Modal State for Manual Carrier AWB Entry
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [requestToConvert, setRequestToConvert] = useState<ShipmentRequest | null>(null);
  const [convertAwbInput, setConvertAwbInput] = useState("");
  const [convertCarrierInput, setConvertCarrierInput] = useState("Express");
  const [convertBrokerInput, setConvertBrokerInput] = useState("XSPEED");
  const [convertPriceInput, setConvertPriceInput] = useState("");
  const [convertCurrencyInput, setConvertCurrencyInput] = useState("EGP");
  const [convertCostInput, setConvertCostInput] = useState("");
  const [convertNotesInput, setConvertNotesInput] = useState("");
  const [convertError, setConvertError] = useState<string | null>(null);

  // WhatsApp Deal Helper (Logistics Broker Model)
  const getWhatsAppUrlForRequest = (r: ShipmentRequest) => {
    const phoneRaw = r.whatsapp || r.phone || "";
    const phone = phoneRaw.replace(/[^0-9]/g, "");
    if (!phone) return null;

    const curr = r.currency || "EGP";
    const priceVal = r.agreedPrice || r.quotedPrice;
    const priceSnippet = priceVal
      ? isRTL
        ? `\n- السعر المتفق عليه: ${priceVal} ${curr}`
        : `\n- Agreed Freight Rate: ${priceVal} ${curr}`
      : "";

    const msg = isRTL
      ? `مرحباً ${r.customerName}، معكم فريق عمليات وسيط الشحن XSPEED Express.\nبخصوص طلب الشحن الدولي رقم *${r.requestNumber}*:\n- من: ${r.pickupCity} (${r.pickupCountry})\n- إلى: ${r.deliveryCity} (${r.deliveryCountry})\n- نوع الشحنة والوزن: ${getLocalizedShipmentType(r.shipmentType, isRTL)} (${r.weight} كجم)${priceSnippet}\nنود متابعة التفاصيل والاتفاق وتأكيد الحجز والاستلام.`
      : `Hello ${r.customerName}, this is XSPEED Express operations.\nRegarding your shipment request *${r.requestNumber}*:\n- Origin: ${r.pickupCity}, ${r.pickupCountry}\n- Destination: ${r.deliveryCity}, ${r.deliveryCountry}\n- Cargo: ${r.shipmentType} (${r.weight} KG)${priceSnippet}\nWe'd like to follow up with you to confirm cargo details and schedule pickup.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Inline Price Saver & Approver
  const handleSaveInlinePrice = async (req: ShipmentRequest, newPrice: string, selectedCurrency: string = "EGP") => {
    const trimmed = newPrice.trim();
    if (!trimmed) {
      setEditingPriceId(null);
      return;
    }

    setInlineSavingId(req.id);
    try {
      const patch: Partial<ShipmentRequest> = {
        quotedPrice: trimmed,
        agreedPrice: trimmed,
        currency: selectedCurrency,
        status: "Approved",
        approvedAt: new Date().toISOString(),
      };

      await ShipmentRequestService.updateRequest(req.id, patch);

      if (onTriggerNotification) {
        onTriggerNotification(
          isRTL ? "تمت الموافقة واعتماد السعر والعملة" : "Request Approved & Rate Set",
          isRTL
            ? `تم تسجيل السعر (${trimmed} ${selectedCurrency}) واعتماد الطلب ${req.requestNumber} بنجاح`
            : `Agreed rate (${trimmed} ${selectedCurrency}) saved and request ${req.requestNumber} approved`,
          "success"
        );
      }

      await loadRequests();
      setEditingPriceId(null);
    } catch (err: any) {
      console.error("Failed to save price inline:", err);
    } finally {
      setInlineSavingId(null);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await ShipmentRequestService.getRequests();
      setRequests(data || []);
    } catch {
      setRequests(AdminStorage.getShipmentRequests());
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openDetailsModal = (req: ShipmentRequest) => {
    setSelectedRequest(req);
    const existingPrice = req.agreedPrice ? String(req.agreedPrice) : (req.quotedPrice || "");
    setQuotedPriceInput(existingPrice);
    setCurrencyInput(req.currency || "EGP");
    setInternalNotesInput(req.internalNotes || "");
    setStatusInput(req.status === "Price Sent" || req.status === "Customer Confirmed" ? "Approved" : req.status);
  };

  const openConvertModal = (req: ShipmentRequest) => {
    setRequestToConvert(req);
    setConvertAwbInput("");
    setConvertCarrierInput("Express");
    setConvertBrokerInput("XSPEED");
    const rawPrice = req.agreedPrice || req.quotedPrice;
    const quoted = rawPrice ? parseFloat(String(rawPrice).replace(/[^0-9.]/g, "")) || 2500 : 2500;
    setConvertPriceInput(quoted.toString());
    setConvertCurrencyInput(req.currency || "EGP");
    setConvertCostInput(Math.round(quoted * 0.65).toString());
    setConvertNotesInput("");
    setConvertError(null);
    setConvertModalOpen(true);
  };

  const handleUpdateStatusAndQuote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRequest) return;

    let targetStatus = statusInput;
    const trimmedPrice = quotedPriceInput.trim();
    const curr = currencyInput || selectedRequest.currency || "EGP";

    if (trimmedPrice && (statusInput === "New" || statusInput === "Contacted")) {
      targetStatus = "Approved";
    }

    await ShipmentRequestService.updateRequest(selectedRequest.id, {
      quotedPrice: trimmedPrice,
      agreedPrice: trimmedPrice,
      currency: curr,
      internalNotes: internalNotesInput,
      status: targetStatus,
      approvedAt: targetStatus === "Approved" ? (selectedRequest.approvedAt || new Date().toISOString()) : selectedRequest.approvedAt,
    });

    if (onTriggerNotification) {
      onTriggerNotification(
        isRTL ? "تم تحديث واعتماد الطلب" : "Request Updated",
        isRTL
          ? `تم تحديث الطلب ${selectedRequest.requestNumber} إلى ${getLocalizedStatus(targetStatus, isRTL)}${trimmedPrice ? ` (السعر المعتمد: ${trimmedPrice} ${curr})` : ""}`
          : `Request ${selectedRequest.requestNumber} status updated to ${targetStatus}${trimmedPrice ? ` (Agreed Rate: ${trimmedPrice} ${curr})` : ""}`,
        targetStatus === "Approved" ? "success" : "info"
      );
    }

    await loadRequests();
    setSelectedRequest(null);
  };

  // Quick Action Handler for Direct Status Buttons
  const handleQuickStatusChange = async (newStatus: ShipmentRequest["status"], customNote?: string) => {
    if (!selectedRequest) return;

    const trimmedPrice = quotedPriceInput.trim();
    const curr = currencyInput || selectedRequest.currency || "EGP";

    await ShipmentRequestService.updateRequest(selectedRequest.id, {
      status: newStatus,
      quotedPrice: trimmedPrice || selectedRequest.quotedPrice,
      agreedPrice: trimmedPrice || selectedRequest.agreedPrice || selectedRequest.quotedPrice,
      currency: curr,
      approvedAt: newStatus === "Approved" ? new Date().toISOString() : selectedRequest.approvedAt,
      internalNotes: customNote ? `${selectedRequest.internalNotes ? selectedRequest.internalNotes + " | " : ""}${customNote}` : internalNotesInput,
    });

    if (onTriggerNotification) {
      onTriggerNotification(
        isRTL ? "تم تغيير الحالة" : "Status Changed",
        isRTL
          ? `تم تعيين حالة الطلب ${selectedRequest.requestNumber} إلى ${getLocalizedStatus(newStatus, isRTL)}`
          : `Request ${selectedRequest.requestNumber} marked as ${newStatus}`,
        newStatus === "Approved" ? "success" : "info"
      );
    }

    await loadRequests();
    setSelectedRequest(null);
  };

  // Convert Approved Request to Live Shipment with Admin-provided Carrier AWB
  const handleConfirmConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestToConvert) return;

    const trimmedAwb = convertAwbInput.trim().toUpperCase();
    if (!trimmedAwb) {
      setConvertError(
        isRTL
          ? "يرجى إدخال رقم بوليصة الشحن الفعلية المستلمة من شركة الشحن الناقلة (AWB)"
          : "Please enter the carrier AWB tracking number"
      );
      return;
    }

    setConvertError(null);

    const len = requestToConvert.length || 30;
    const wid = requestToConvert.width || 25;
    const hei = requestToConvert.height || 15;
    const volWt = Number(((len * wid * hei) / 5000).toFixed(1));
    const actWt = requestToConvert.weight || 1;
    const finalWt = Math.max(actWt, volWt);

    const sellingVal = parseFloat(convertPriceInput) || 2500;
    const costVal = parseFloat(convertCostInput) || Math.round(sellingVal * 0.65);
    const profitVal = sellingVal - costVal;
    const currency = convertCurrencyInput || "EGP";

    const priceInEgp = currency === "USD" ? Math.round(sellingVal * 48) : sellingVal;
    const priceInUsd = currency === "USD" ? sellingVal : Math.round(sellingVal / 48);

    const newShipment: Shipment = {
      id: `shp-${Date.now()}`,
      awb: trimmedAwb,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      account: requestToConvert.companyName || requestToConvert.customerName,
      company: requestToConvert.companyName || requestToConvert.customerName,
      senderName: requestToConvert.pickupContactName || requestToConvert.customerName,
      senderCity: `${requestToConvert.pickupCity}, ${requestToConvert.pickupCountry}`,
      receiverName: requestToConvert.consigneeName,
      receiverCity: `${requestToConvert.deliveryCity}, ${requestToConvert.deliveryCountry}`,
      country: requestToConvert.deliveryCountry,
      carrier: convertCarrierInput as any,
      broker: convertBrokerInput,
      weight: finalWt,
      actualWeight: actWt,
      length: len,
      width: wid,
      height: hei,
      volumetricWeight: volWt,
      dim: `${len}x${wid}x${hei} cm`,
      priceEgp: priceInEgp,
      priceUsd: priceInUsd,
      costPrice: costVal,
      sellingPrice: sellingVal,
      transExpense: 0,
      netProfit: profitVal,
      agentName: "Operations Broker",
      opNote: convertNotesInput || "Converted from broker request",
      contents: requestToConvert.contents || requestToConvert.shipmentType || "Parcel",
      status: "Information recived",
      originHub: `${requestToConvert.pickupCity} Gateway`,
      destinationHub: `${requestToConvert.deliveryCity} Central Hub`,
      currentLocation: `${requestToConvert.pickupCity} Gateway`,
      serviceType: "Next-Day Air",
      timeline: [
        {
          status: "Shipment Created & Carrier AWB Assigned",
          location: `${requestToConvert.pickupCity} Dispatch Gateway`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          completed: true,
        },
        {
          status: "Dispatched via " + convertCarrierInput,
          location: requestToConvert.pickupAddress,
          timestamp: "In Progress",
          completed: true,
          current: true,
        },
        {
          status: "In Transit",
          location: "En Route",
          timestamp: "Pending",
          completed: false,
        },
        {
          status: "Delivered",
          location: requestToConvert.deliveryAddress,
          timestamp: "Pending",
          completed: false,
        },
      ],
    };

    // 1. Add shipment to local storage and backend API
    const currentShipments = AdminStorage.getShipments();
    AdminStorage.saveShipments([newShipment, ...currentShipments]);

    try {
      await ShipmentService.createShipment(newShipment);
    } catch {
      // Storage already updated
    }

    // 2. Update request status to Converted
    await ShipmentRequestService.updateRequest(requestToConvert.id, {
      status: "Converted to Shipment",
      linkedAwb: trimmedAwb,
      agreedPrice: sellingVal.toString(),
      quotedPrice: sellingVal.toString(),
      currency: currency,
      convertedAt: new Date().toISOString(),
    });

    if (onTriggerNotification) {
      onTriggerNotification(
        isRTL ? "تم قبول الطلب وإصدار البوليصة" : "Request Accepted & AWB Assigned",
        isRTL
          ? `تم ربط الطلب ${requestToConvert.requestNumber} ببوليصة الشحن ${trimmedAwb} عبر الناقل ${convertCarrierInput}`
          : `Request ${requestToConvert.requestNumber} linked to AWB ${trimmedAwb} via ${convertCarrierInput}`,
        "success"
      );
    }

    await loadRequests();
    setConvertModalOpen(false);
    setRequestToConvert(null);
    setSelectedRequest(null);
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const isApprovedMatch =
      statusFilter === "Approved" &&
      (r.status === "Approved" || r.status === "Price Sent" || r.status === "Customer Confirmed");
    const matchesStatus = statusFilter === "All" || r.status === statusFilter || isApprovedMatch;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.requestNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      (r.companyName && r.companyName.toLowerCase().includes(q)) ||
      r.phone.toLowerCase().includes(q) ||
      r.deliveryCity.toLowerCase().includes(q);

    const waiting = calculateWaitingDuration(r.updatedAt, r.createdAt, r.status, isRTL);
    const matchesDelayed = !delayedOnlyFilter || waiting.isDelayed;

    return matchesStatus && matchesSearch && matchesDelayed;
  });

  // Calculate live counts
  const delayedCount = requests.filter((r) => calculateWaitingDuration(r.updatedAt, r.createdAt, r.status, isRTL).isDelayed).length;
  const newCount = requests.filter((r) => r.status === "New").length;
  const contactedCount = requests.filter((r) => r.status === "Contacted").length;
  const approvedCount = requests.filter((r) => r.status === "Approved" || r.status === "Price Sent" || r.status === "Customer Confirmed").length;
  const convertedCount = requests.filter((r) => r.status === "Converted to Shipment").length;
  const cancelledCount = requests.filter((r) => r.status === "Cancelled").length;

  const hasActiveFilters = Boolean(searchTerm || statusFilter !== "All" || delayedOnlyFilter);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDelayedOnlyFilter(false);
  };

  const conversionRate = requests.length > 0 ? Math.round((convertedCount / requests.length) * 100) : 0;

  return (
    <div className="space-y-6 text-start">
      {/* ─── 1. TOP HEADER WITH LIVE OPS BADGE & ACTION BUTTONS ─── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-[#C45B2A] text-white flex items-center justify-center shadow-xs shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-[#251516] tracking-tight">
                {t("admin.requests.title")}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isRTL ? "متابعة حية للطلبات (وسيط شحن)" : "Logistics Broker Pipeline"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium max-w-2xl">
              {t("admin.requests.subtitle")}
            </p>
          </div>
        </div>

        {/* Action button: Google Apps Script Rate Calculator */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          <a
            href="https://script.google.com/macros/s/AKfycbzLxqTg5aNeqvep_ExG-EuxL-gVOVdELZb9sa5KpvmhrbwOt9OJ_XuwC2_s8N0qQvLX/exec"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-400/40 hover:border-amber-500/60 shadow-2xs transition-all cursor-pointer group"
          >
            <Calculator className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>{isRTL ? "حاسبة الشحنات (الاسكريبت)" : "Rates Calculator Script"}</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
          </a>
        </div>
      </div>

      {/* ─── 2. EXECUTIVE KPI METRICS BENTO GRID (INTERACTIVE) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {/* Card 1: Total Requests */}
        <div
          onClick={() => {
            setStatusFilter("All");
            setDelayedOnlyFilter(false);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "All" && !delayedOnlyFilter
              ? "bg-white border-[#C45B2A] shadow-md ring-2 ring-[#C45B2A]/20"
              : "bg-white hover:bg-gray-50/80 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-gray-500 truncate">
              {isRTL ? "إجمالي الطلبات" : "Total Requests"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C45B2A] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#251516]">
              {requests.length}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate">
              {isRTL ? "كافة مسارات الشحن" : "All pipeline volume"}
            </p>
          </div>
        </div>

        {/* Card 2: New Inquiries */}
        <div
          onClick={() => {
            setStatusFilter("New");
            setDelayedOnlyFilter(false);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "New" && !delayedOnlyFilter
              ? "bg-amber-50/40 border-amber-500 shadow-md ring-2 ring-amber-500/20"
              : "bg-white hover:bg-amber-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-amber-900 truncate">
              {isRTL ? "طلبات جديدة" : "New Inquiries"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-700">
              {newCount}
            </div>
            <p className="text-[10px] text-amber-800/80 font-semibold mt-0.5 truncate">
              {newCount > 0 ? (isRTL ? "بحاجة لمراجعة وتواصل" : "Needs contact") : (isRTL ? "لا توجد طلبات جديدة" : "All triaged")}
            </p>
          </div>
        </div>

        {/* Card 3: Contacted via WhatsApp */}
        <div
          onClick={() => {
            setStatusFilter("Contacted");
            setDelayedOnlyFilter(false);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "Contacted" && !delayedOnlyFilter
              ? "bg-cyan-50/50 border-cyan-500 shadow-md ring-2 ring-cyan-500/20"
              : "bg-white hover:bg-cyan-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-cyan-900 truncate">
              {isRTL ? "تم التواصل" : "Contacted"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-700">
              {contactedCount}
            </div>
            <p className="text-[10px] text-cyan-800/80 font-semibold mt-0.5 truncate">
              {isRTL ? "تواصل وتنسيق واتساب" : "WhatsApp Discussion"}
            </p>
          </div>
        </div>

        {/* Card 4: Approved & Priced */}
        <div
          onClick={() => {
            setStatusFilter("Approved");
            setDelayedOnlyFilter(false);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "Approved" && !delayedOnlyFilter
              ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white hover:bg-emerald-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-900 truncate">
              {isRTL ? "معتمد ومسعّر" : "Approved & Priced"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
              {approvedCount}
            </div>
            <p className="text-[10px] text-emerald-800/80 font-semibold mt-0.5 truncate">
              {approvedCount > 0 ? (isRTL ? "جاهزة للتحويل لبوليصة" : "Ready for Waybill") : (isRTL ? "لا توجد طلبات معتمدة" : "None pending")}
            </p>
          </div>
        </div>

        {/* Card 5: Converted to Shipment */}
        <div
          onClick={() => {
            setStatusFilter("Converted to Shipment");
            setDelayedOnlyFilter(false);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "Converted to Shipment" && !delayedOnlyFilter
              ? "bg-purple-50/40 border-purple-500 shadow-md ring-2 ring-purple-500/20"
              : "bg-white hover:bg-purple-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-purple-900 truncate">
              {isRTL ? "تم التحويل لبوليصة" : "Converted AWB"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-700">
              {convertedCount}
            </div>
            <p className="text-[10px] text-purple-800/80 font-semibold mt-0.5 truncate">
              {isRTL ? `معدل التحويل ${conversionRate}%` : `${conversionRate}% conversion`}
            </p>
          </div>
        </div>

        {/* Card 6: Delayed Overdue Alert */}
        <div
          onClick={() => {
            setDelayedOnlyFilter(!delayedOnlyFilter);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            delayedOnlyFilter
              ? "bg-rose-50 border-rose-500 shadow-md ring-2 ring-rose-500/20"
              : delayedCount > 0
              ? "bg-rose-50/30 hover:bg-rose-50/60 border-rose-200 shadow-2xs"
              : "bg-white hover:bg-gray-50/80 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[11px] font-bold truncate ${delayedCount > 0 ? "text-rose-700 font-black" : "text-gray-500"}`}>
              {isRTL ? "تنبيه التأخير" : "SLA Delayed"}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
              delayedCount > 0 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-gray-100 text-gray-400"
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-2xl sm:text-3xl font-black font-mono ${delayedCount > 0 ? "text-rose-700" : "text-gray-400"}`}>
              {delayedCount}
            </div>
            <p className="text-[10px] text-rose-700/80 font-semibold mt-0.5 truncate">
              {delayedCount > 0 ? (isRTL ? "تجاوزت 24 ساعة بدون رد" : "Over 24h waiting") : (isRTL ? "زمن الاستجابة ممتاز" : "Zero delays")}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. PIPELINE WORKFLOW PROGRESS BAR ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#251516] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C45B2A]" />
            <span>{isRTL ? "مسار تحويل وتدفق الطلبات (Broker Funnel)" : "Broker Pipeline Funnel"}</span>
          </span>
          <span className="text-gray-500 font-mono text-[11px]">
            {isRTL ? `معدل الإنجاز النهائي: ${requests.length > 0 ? Math.round(((convertedCount + cancelledCount) / requests.length) * 100) : 0}%` : `Completion Rate: ${requests.length > 0 ? Math.round(((convertedCount + cancelledCount) / requests.length) * 100) : 0}%`}
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
          {requests.length > 0 ? (
            <>
              {newCount > 0 && (
                <div
                  style={{ width: `${(newCount / requests.length) * 100}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                  title={`${isRTL ? "طلب جديد" : "New"}: ${newCount}`}
                />
              )}
              {contactedCount > 0 && (
                <div
                  style={{ width: `${(contactedCount / requests.length) * 100}%` }}
                  className="bg-cyan-500 h-full transition-all duration-500"
                  title={`${isRTL ? "تم التواصل عبر واتساب" : "Contacted"}: ${contactedCount}`}
                />
              )}
              {approvedCount > 0 && (
                <div
                  style={{ width: `${(approvedCount / requests.length) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`${isRTL ? "معتمد ومسعّر" : "Approved"}: ${approvedCount}`}
                />
              )}
              {convertedCount > 0 && (
                <div
                  style={{ width: `${(convertedCount / requests.length) * 100}%` }}
                  className="bg-purple-600 h-full transition-all duration-500"
                  title={`${isRTL ? "تم التحويل لبوليصة" : "Converted"}: ${convertedCount}`}
                />
              )}
              {cancelledCount > 0 && (
                <div
                  style={{ width: `${(cancelledCount / requests.length) * 100}%` }}
                  className="bg-gray-400 h-full transition-all duration-500"
                  title={`${isRTL ? "ملغي" : "Cancelled"}: ${cancelledCount}`}
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
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span>{isRTL ? "جديد:" : "New:"} <strong className="text-gray-900 font-mono">{newCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
            <span>{isRTL ? "تم التواصل:" : "Contacted:"} <strong className="text-gray-900 font-mono">{contactedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{isRTL ? "معتمد ومسعّر:" : "Approved:"} <strong className="text-gray-900 font-mono">{approvedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
            <span>{isRTL ? "محول لبوالص:" : "AWB Issued:"} <strong className="text-gray-900 font-mono">{convertedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0" />
            <span>{isRTL ? "ملغي:" : "Cancelled:"} <strong className="text-gray-900 font-mono">{cancelledCount}</strong></span>
          </div>
        </div>
      </div>

      {/* ─── SEARCH & FILTER PILLS ─── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 text-gray-400 absolute top-3.5 ${isRTL ? "right-3.5" : "left-3.5"} pointer-events-none`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("admin.requests.searchPlaceholder")}
              className={`w-full h-11 bg-gray-50/80 text-[#251516] text-xs font-semibold rounded-xl border border-gray-200 focus:border-[#C45B2A] focus:bg-white outline-none transition-all shadow-inner ${
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-gray-400 hover:text-gray-600`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">
              {isRTL
                ? `عرض ${filteredRequests.length} من ${requests.length} طلب`
                : `Showing ${filteredRequests.length} of ${requests.length} requests`}
            </span>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetFilters}
                className="h-10 px-3 text-xs font-bold border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 hover:text-rose-800 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRTL ? "إلغاء التصفية" : "Reset Filters"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
          {[
            { id: "All", label: t("admin.requests.filterAll") || (isRTL ? "كافة الطلبات" : "All Requests"), count: requests.length },
            { id: "New", label: t("admin.requests.filterNew") || (isRTL ? "طلب جديد" : "New"), count: newCount },
            { id: "Contacted", label: t("admin.requests.filterContacted") || (isRTL ? "تم التواصل" : "Contacted"), count: contactedCount },
            { id: "Approved", label: t("admin.requests.filterApproved") || (isRTL ? "معتمد (تم الاتفاق)" : "Approved"), count: approvedCount },
            { id: "Converted to Shipment", label: t("admin.requests.filterConverted") || (isRTL ? "تم التحويل لبوليصة" : "Converted"), count: convertedCount },
            { id: "Cancelled", label: t("admin.requests.filterCancelled") || (isRTL ? "ملغي" : "Cancelled"), count: cancelledCount },
          ].map((st) => {
            const isActive = statusFilter === st.id && !delayedOnlyFilter;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatusFilter(st.id);
                  setDelayedOnlyFilter(false);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs shadow-2xs ${
                  isActive
                    ? "bg-[#C45B2A] text-white shadow-sm"
                    : "bg-gray-50/90 text-gray-700 hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                <span>{st.label}</span>
                {st.count !== undefined && st.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {st.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Delayed Filter Toggle Pill */}
          <button
            type="button"
            onClick={() => setDelayedOnlyFilter(!delayedOnlyFilter)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs border shadow-2xs ${
              delayedOnlyFilter
                ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t("admin.requests.filterDelayedOnly")}</span>
            {delayedCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${delayedOnlyFilter ? "bg-white/30 text-white" : "bg-rose-200 text-rose-900"}`}>
                {delayedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── 3. REQUESTS OPERATIONAL TABLE ─── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start text-xs min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50/95 text-gray-700 uppercase font-black border-b border-gray-200 select-none">
                <th className="py-3.5 px-4 text-start font-black text-gray-700">{t("admin.requests.table.requestNo")}</th>
                <th className="py-3.5 px-4 text-start font-black text-gray-700">{t("admin.requests.table.customerCompany")}</th>
                <th className="py-3.5 px-4 text-start font-black text-gray-700">{t("admin.requests.table.pickupDest")}</th>
                <th className="py-3.5 px-4 text-start font-black text-gray-700">{t("admin.requests.table.typeWeight")}</th>
                <th className="py-3.5 px-4 text-start font-black text-gray-700">{t("admin.requests.table.quotedPrice")}</th>
                <th className="py-3.5 px-4 text-start font-black text-gray-700">{t("admin.requests.table.waitingSince")}</th>
                <th className="py-3.5 px-4 text-start font-black text-gray-700">{t("admin.requests.table.status")}</th>
                <th className="py-3.5 px-4 text-end font-black text-gray-700">{t("admin.requests.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-500">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#C45B2A] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <Package className="h-6 w-6" />
                    </div>
                    <p className="text-base font-bold text-gray-900">{t("admin.requests.table.noRequests")}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL ? "لم يتم العثور على طلبات مطابقة للبحث أو التصفية." : "No shipment requests matching the search query or filter."}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetFilters}
                        className="mt-3 text-xs font-bold rounded-xl"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        <span>{isRTL ? "إلغاء الفلاتر" : "Clear filters"}</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const waiting = calculateWaitingDuration(r.updatedAt, r.createdAt, r.status, isRTL);
                  const isConverted = r.status === "Converted to Shipment";

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-orange-50/20 transition-colors border-b border-gray-100 ${
                        waiting.isDelayed ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* 1. رقم الطلب */}
                      <td className="py-3.5 px-4 font-mono font-black text-[#251516] text-start whitespace-nowrap" dir="ltr">
                        <span className="bg-gray-100 border border-gray-200/80 px-2.5 py-1 rounded-lg text-xs inline-block font-black">
                          {r.requestNumber}
                        </span>
                      </td>

                      {/* 2. العميل والشركة */}
                      <td className="py-3.5 px-4 text-start">
                        <p className="font-extrabold text-gray-900 text-xs">{r.customerName}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{r.companyName || r.phone}</p>
                      </td>

                      {/* 3. الانطلاق والوجهة */}
                      <td className="py-3.5 px-4 text-start whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gray-600 font-semibold">{r.pickupCity}, {r.pickupCountry}</span>
                          <ArrowRight className={`w-3.5 h-3.5 text-[#C45B2A] shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                          <strong className="text-gray-900 font-bold">{r.deliveryCity}, {r.deliveryCountry}</strong>
                        </div>
                      </td>

                      {/* 4. النوع والوزن */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-gray-800">{getLocalizedShipmentType(r.shipmentType, isRTL)}</span>{" "}
                        <span className="font-mono text-gray-500 text-[11px]" dir="ltr">({r.weight} {isRTL ? "كجم" : "KG"})</span>
                      </td>

                      {/* 5. السعر المتفق عليه والعملة (مع إمكانية التعديل والإدخال المباشر بعد الاتفاق على واتساب) */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {editingPriceId === r.id ? (
                          <div className="flex items-center gap-1.5 min-w-[240px]" onClick={(e) => e.stopPropagation()}>
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={inlinePriceValue}
                                onChange={(e) => setInlinePriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveInlinePrice(r, inlinePriceValue, inlineCurrencyValue);
                                  } else if (e.key === "Escape") {
                                    setEditingPriceId(null);
                                  }
                                }}
                                placeholder={t("admin.requests.table.pricePlaceholder") || (isRTL ? "مثال: 2500" : "e.g. 2500")}
                                className="w-full h-8 px-2.5 bg-white text-[#251516] text-xs font-mono font-bold rounded-lg border-2 border-[#C45B2A] focus:outline-none shadow-xs"
                                autoFocus
                                dir="ltr"
                              />
                            </div>
                            <select
                              value={inlineCurrencyValue}
                              onChange={(e) => setInlineCurrencyValue(e.target.value)}
                              className="h-8 px-2 bg-white text-[#251516] text-[11px] font-bold rounded-lg border border-gray-300 focus:border-[#C45B2A] outline-none shadow-2xs cursor-pointer"
                            >
                              {SUPPORTED_CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.code}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleSaveInlinePrice(r, inlinePriceValue, inlineCurrencyValue)}
                              disabled={inlineSavingId === r.id}
                              className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                              title={t("admin.requests.table.savePrice") || (isRTL ? "اعتماد السعر" : "Approve & Save")}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
                              title={t("admin.requests.table.cancelEdit") || "Cancel"}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (r.agreedPrice || r.quotedPrice) ? (
                          <div className="inline-flex items-center gap-1.5 group">
                            <span className="font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 text-xs shadow-2xs inline-flex items-center gap-1.5" dir="ltr">
                              <span>{r.agreedPrice || r.quotedPrice}</span>
                              <span className="font-sans text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                                {r.currency || "EGP"}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(r.id);
                                setInlinePriceValue(r.agreedPrice ? String(r.agreedPrice) : (r.quotedPrice || ""));
                                setInlineCurrencyValue(r.currency || "EGP");
                              }}
                              className="h-7 w-7 rounded-lg bg-gray-50 hover:bg-orange-100 text-gray-500 hover:text-[#C45B2A] border border-gray-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs opacity-80 group-hover:opacity-100"
                              title={t("admin.requests.table.editPrice") || (isRTL ? "تعديل السعر والعملة" : "Edit Price & Currency")}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPriceId(r.id);
                              setInlinePriceValue("");
                              setInlineCurrencyValue(r.currency || "EGP");
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 text-[11px] font-extrabold transition-all hover:scale-102 cursor-pointer shadow-2xs"
                            title={t("admin.requests.table.whatsappTooltip") || (isRTL ? "اعتماد السعر بعد الاتفاق في واتساب" : "Set agreed price & approve")}
                          >
                            <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                            <span>{t("admin.requests.table.enterPrice") || (isRTL ? "اعتماد السعر" : "Set Agreed Price")}</span>
                          </button>
                        )}
                      </td>

                      {/* 6. مدة الانتظار */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {waiting.isDelayed ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            <span>{waiting.text}</span>
                            <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase">
                              {t("admin.requests.table.delayed")}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{waiting.text}</span>
                          </div>
                        )}
                      </td>

                      {/* 7. الحالة */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${
                            r.status === "Converted to Shipment"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : r.status === "Approved" || r.status === "Customer Confirmed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : r.status === "Contacted"
                              ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                              : r.status === "Cancelled"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {getLocalizedStatus(r.status, isRTL)}
                        </span>
                      </td>

                      {/* 8. الإجراءات */}
                      <td className="py-3.5 px-4 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Deal Shortcut */}
                          {(r.phone || r.whatsapp) && (
                            <a
                              href={getWhatsAppUrlForRequest(r) || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all hover:scale-102 cursor-pointer"
                              title={t("admin.requests.table.whatsappTooltip") || "Chat with customer on WhatsApp"}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden xl:inline">{t("admin.requests.table.whatsappDeal") || "WhatsApp"}</span>
                            </a>
                          )}

                          {/* Convert to Shipment CTA */}
                          {!isConverted ? (
                            <Button
                              size="sm"
                              variant="brand"
                              onClick={() => openConvertModal(r)}
                              className="h-8 px-3.5 text-xs font-extrabold bg-[#C45B2A] hover:bg-[#A8481B] text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                              title={t("admin.requests.table.convertTooltip")}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{isRTL ? "تحويل لبوليصة" : "Convert"}</span>
                            </Button>
                          ) : (
                            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block" dir="ltr">
                              {r.linkedAwb || "AWB"}
                            </span>
                          )}

                          {/* View Details Eye Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDetailsModal(r)}
                            className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl cursor-pointer"
                            title={t("admin.requests.table.viewDetailsTooltip")}
                          >
                            <Eye className="w-4 h-4 text-[#C45B2A]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. REQUEST DETAILS & QUOTING MODAL ─── */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        {selectedRequest && (
          <DialogContent className="max-w-3xl space-y-6 text-start">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-[#C45B2A] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                    {t("admin.requests.modal.title")}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      selectedRequest.status === "Converted to Shipment"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : selectedRequest.status === "Customer Confirmed"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : selectedRequest.status === "Awaiting Customer Response"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : selectedRequest.status === "Price Sent"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : selectedRequest.status === "Contacted"
                        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                        : selectedRequest.status === "Cancelled"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {getLocalizedStatus(selectedRequest.status, isRTL)}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[#251516] mt-1 font-mono" dir="ltr">
                  {selectedRequest.requestNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  {t("admin.requests.modal.submittedOn")} {selectedRequest.createdAt}
                </p>
              </div>

              {/* Header Action: WhatsApp Message Button */}
              <div className="flex items-center gap-2">
                {selectedRequest.phone && (
                  <a
                    href={`https://wa.me/${selectedRequest.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `مرحباً ${selectedRequest.customerName}، بخصوص طلب الشحن رقم ${selectedRequest.requestNumber} من ${selectedRequest.pickupCity} إلى ${selectedRequest.deliveryCity}...`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-2xs"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? "مراسلة واتساب" : "WhatsApp"}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Status Action Buttons Bar */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <span className="text-[11px] font-bold uppercase text-gray-600 tracking-wider block">
                {t("admin.requests.modal.quickStatusUpdates")}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickStatusChange("Contacted", isRTL ? "تم التواصل مع العميل عبر واتساب" : "Contacted customer via WhatsApp")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t("admin.requests.modal.markContacted")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickStatusChange("Approved", isRTL ? "تم الاتفاق على السعر واعتماد الطلب" : "Rate agreed and request approved")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{isRTL ? "اعتماد السعر والموافقة" : "Approve & Confirm Rate"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickStatusChange("Cancelled", isRTL ? "تم إلغاء الطلب" : "Request cancelled")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t("admin.requests.modal.cancelRequest")}</span>
                </button>
              </div>
            </div>

            {/* Audit Trail & Timestamps Card */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-2">
              <span className="text-[11px] font-bold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>{t("admin.requests.modal.auditTrailTitle")}</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                <div className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">{t("admin.requests.modal.createdAt")}</span>
                  <p className="font-mono font-bold text-gray-900 mt-0.5">{selectedRequest.createdAt || "N/A"}</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">{t("admin.requests.modal.firstContacted")}</span>
                  <p className="font-mono font-bold text-cyan-700 mt-0.5">{selectedRequest.contactedAt || "—"}</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">{isRTL ? "تاريخ الاعتماد" : "Approved At"}</span>
                  <p className="font-mono font-bold text-emerald-700 mt-0.5">{selectedRequest.approvedAt || selectedRequest.customerConfirmedAt || selectedRequest.priceSentAt || "—"}</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">{isRTL ? "العملة المعتمدة" : "Agreed Currency"}</span>
                  <p className="font-mono font-bold text-[#C45B2A] mt-0.5">{selectedRequest.currency || "EGP"}</p>
                </div>
              </div>

              {selectedRequest.convertedAt && (
                <div className="text-xs text-emerald-800 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{isRTL ? `تم التحويل لبوليصة شحن حية (${selectedRequest.linkedAwb}) في:` : `Converted to Live AWB (${selectedRequest.linkedAwb}) at:`} <strong>{selectedRequest.convertedAt}</strong></span>
                </div>
              )}
            </div>

            {/* Request Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-1.5 shadow-2xs">
                <span className="font-bold text-gray-400 uppercase text-[10px]">{t("admin.requests.modal.customerDetails")}</span>
                <p className="font-bold text-gray-900 text-sm">{selectedRequest.customerName}</p>
                <p className="text-gray-600">{t("admin.requests.modal.company")} <strong>{selectedRequest.companyName || "N/A"}</strong></p>
                <p className="text-gray-600">{t("admin.requests.modal.phone")} <span className="font-mono" dir="ltr">{selectedRequest.phone}</span></p>
                <p className="text-gray-600">{t("admin.requests.modal.whatsapp")} <span className="font-mono" dir="ltr">{selectedRequest.whatsapp}</span></p>
                <p className="text-gray-600">{t("admin.requests.modal.email")} <span className="font-mono" dir="ltr">{selectedRequest.email}</span></p>
              </div>

              {/* Route & Cargo */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-1.5 shadow-2xs">
                <span className="font-bold text-gray-400 uppercase text-[10px]">{t("admin.requests.modal.cargoRoute")}</span>
                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                  <span>{selectedRequest.pickupCity}, {selectedRequest.pickupCountry}</span>
                  <ArrowRight className={`w-3.5 h-3.5 text-[#C45B2A] shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                  <span>{selectedRequest.deliveryCity}, {selectedRequest.deliveryCountry}</span>
                </div>
                <p className="text-gray-600">{t("admin.requests.modal.type")} <strong>{getLocalizedShipmentType(selectedRequest.shipmentType, isRTL)}</strong></p>
                <p className="text-gray-600">{t("admin.requests.modal.contents")} {selectedRequest.contents}</p>
                <p className="text-gray-600">
                  {t("admin.requests.modal.weight")} <strong>{selectedRequest.weight} {isRTL ? "كجم" : "KG"}</strong> ({selectedRequest.packageCount} {isRTL ? "طرد" : "pkgs"})
                </p>
                <p className="text-gray-600">
                  {t("admin.requests.modal.special")} {selectedRequest.isFragile ? t("admin.requests.modal.fragile") : t("admin.requests.modal.standard")} {selectedRequest.isTemperatureControlled ? `• ${t("admin.requests.modal.coldChain")}` : ""}
                </p>
              </div>

              {/* Pickup Address */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-1.5 shadow-2xs">
                <span className="font-bold text-gray-400 uppercase text-[10px]">{t("admin.requests.modal.pickupHandoff")}</span>
                <p className="font-semibold text-gray-900">{selectedRequest.pickupAddress}</p>
                <p className="text-gray-600">{t("admin.requests.modal.contact")} {selectedRequest.pickupContactName} (<span className="font-mono" dir="ltr">{selectedRequest.pickupContactPhone}</span>)</p>
                <p className="text-gray-600">{t("admin.requests.modal.date")} {selectedRequest.preferredPickupDate}</p>
                {selectedRequest.pickupNotes && (
                  <p className="text-xs text-gray-500 bg-white p-1.5 rounded border border-gray-200/60">
                    <span className="font-bold">{isRTL ? "ملاحظات الاستلام: " : "Notes: "}</span>{selectedRequest.pickupNotes}
                  </p>
                )}
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-1.5 shadow-2xs">
                <span className="font-bold text-gray-400 uppercase text-[10px]">{t("admin.requests.modal.deliveryDestination")}</span>
                <p className="font-semibold text-gray-900">{selectedRequest.deliveryAddress}</p>
                {selectedRequest.deliveryShortAddress && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-100/70 border border-orange-200 text-[#C45B2A] text-xs font-mono font-bold" dir="ltr">
                    <span className="font-sans text-[11px] font-bold text-gray-700">{isRTL ? "العنوان المختصر:" : "Short Address:"}</span>
                    <span>{selectedRequest.deliveryShortAddress}</span>
                  </div>
                )}
                <p className="text-gray-600">{t("admin.requests.modal.consignee")} {selectedRequest.consigneeName} (<span className="font-mono" dir="ltr">{selectedRequest.consigneePhone}</span>)</p>
                {selectedRequest.deliveryNotes && (
                  <p className="text-xs text-gray-500 bg-white p-1.5 rounded border border-gray-200/60">
                    <span className="font-bold">{isRTL ? "ملاحظات التسليم: " : "Notes: "}</span>{selectedRequest.deliveryNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Admin Action Form */}
            <form onSubmit={handleUpdateStatusAndQuote} className="space-y-4 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isRTL ? "السعر المتفق عليه (Agreed Price)" : "Agreed Price"}
                  </label>
                  <input
                    type="text"
                    value={quotedPriceInput}
                    onChange={(e) => setQuotedPriceInput(e.target.value)}
                    placeholder={isRTL ? "مثال: 2500" : "e.g. 2500"}
                    className="w-full h-11 px-3.5 bg-gray-50 text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:bg-white outline-none transition-all"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isRTL ? "نوع العملة (Currency)" : "Currency"}
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={currencyInput}
                      onChange={(e) => setCurrencyInput(e.target.value)}
                      className={`w-full h-11 bg-gray-50 text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:bg-white focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                        isRTL ? "pr-3.5 pl-8 text-right" : "pl-3.5 pr-8 text-left"
                      }`}
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({isRTL ? c.labelAr : c.labelEn})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`w-4 h-4 text-gray-500 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {t("admin.requests.modal.requestStatusLabel")}
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value as any)}
                      className={`w-full h-11 bg-gray-50 text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:bg-white focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                        isRTL ? "pr-3.5 pl-8 text-right" : "pl-3.5 pr-8 text-left"
                      }`}
                    >
                      <option value="New">{isRTL ? "طلب جديد" : "New"}</option>
                      <option value="Contacted">{isRTL ? "تم التواصل عبر واتساب" : "Contacted"}</option>
                      <option value="Approved">{isRTL ? "معتمد (تم الاتفاق على السعر)" : "Approved"}</option>
                      <option value="Converted to Shipment">{isRTL ? "تم تحويلها لبوليصة شحن" : "Converted to Shipment"}</option>
                      <option value="Cancelled">{isRTL ? "ملغي" : "Cancelled"}</option>
                    </select>
                    <ChevronDown className={`w-4 h-4 text-gray-500 absolute ${isRTL ? "left-2.5" : "right-2.5"} pointer-events-none`} />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {t("admin.requests.modal.internalNotesLabel")}
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotesInput}
                    onChange={(e) => setInternalNotesInput(e.target.value)}
                    placeholder={t("admin.requests.modal.internalNotesPlaceholder")}
                    className="w-full p-3 bg-gray-50 text-[#251516] text-xs rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons: Sticky Bottom Bar with Close and Save */}
              <div className="sticky bottom-0 bg-white pt-4 pb-1 border-t border-gray-100 z-10 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                  className="h-10 px-5 rounded-xl font-bold border-gray-300 text-gray-800 hover:bg-gray-100 cursor-pointer shadow-2xs"
                >
                  {isRTL ? "إلغاء" : "Close"}
                </Button>

                <div className="flex items-center gap-2.5">
                  {selectedRequest.status !== "Converted to Shipment" && (
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => openConvertModal(selectedRequest)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{t("admin.requests.modal.convertToLiveShipment")}</span>
                    </Button>
                  )}

                  <Button
                    type="submit"
                    variant="brand"
                    className="h-10 px-6 text-xs font-extrabold rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] text-white cursor-pointer shadow-xs"
                  >
                    {t("admin.requests.modal.saveChanges")}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* ─── 5. ACCEPT REQUEST & ENTER CARRIER AWB MODAL ─── */}
      <Dialog open={convertModalOpen} onOpenChange={setConvertModalOpen}>
        {requestToConvert && (
          <DialogContent className="max-w-xl space-y-5 text-start" onClose={() => setConvertModalOpen(false)}>
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-100 text-[#C45B2A] shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-[#251516]">
                    {isRTL ? "قبول الطلب وإصدار بوليصة الشحن (AWB)" : "Accept Request & Assign Carrier AWB"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    {isRTL
                      ? `بصفتنا وسيط شحن، يرجى إدخال رقم البوليصة الحقيقي من شركة الشحن للطلب ${requestToConvert.requestNumber}`
                      : `As a logistics broker, enter the carrier tracking / AWB number for Request ${requestToConvert.requestNumber}`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Request Summary Context Box */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center font-bold text-gray-900">
                <span>{requestToConvert.customerName} ({requestToConvert.companyName || (isRTL ? "عميل فردي" : "Individual Client")})</span>
                <span className="font-mono text-[#C45B2A] bg-orange-50 px-2 py-0.5 rounded border border-orange-200" dir="ltr">{requestToConvert.requestNumber}</span>
              </div>
              <div className="text-gray-700 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                <strong>{requestToConvert.pickupCity}, {requestToConvert.pickupCountry}</strong>
                <ArrowRight className={`w-3.5 h-3.5 text-[#C45B2A] shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                <strong>{requestToConvert.deliveryCity}, {requestToConvert.deliveryCountry}</strong>
              </div>
              <div className="text-gray-600 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                <span>{getLocalizedShipmentType(requestToConvert.shipmentType, isRTL)} • {requestToConvert.weight} {isRTL ? "كجم" : "KG"} • {requestToConvert.contents}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmConversion} className="space-y-4">
              {convertError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{convertError}</span>
                </div>
              )}

              {/* Carrier Shipping Line Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  {isRTL ? "شركة الشحن الناقلة (Carrier Line)" : "Carrier Shipping Line"} <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <select
                    value={convertCarrierInput}
                    onChange={(e) => setConvertCarrierInput(e.target.value)}
                    className={`w-full h-11 bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] focus:ring-2 focus:ring-[#C45B2A]/20 outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                      isRTL ? "pr-3.5 pl-10 text-right" : "pl-3.5 pr-10 text-left"
                    }`}
                    required
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
                    <option value="Other">{isRTL ? "شركة شحن أخرى (Other Carrier)" : "Other Carrier"}</option>
                  </select>
                  <ChevronDown className={`w-4 h-4 text-gray-500 absolute ${isRTL ? "left-3" : "right-3"} pointer-events-none`} />
                </div>
              </div>

              {/* Required Air Waybill Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  {isRTL ? "رقم بوليصة الشحن الفعلية من الناقل (Air Waybill / Tracking #)" : "Carrier Waybill (AWB) Tracking Number"} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={convertAwbInput}
                  onChange={(e) => {
                    setConvertAwbInput(e.target.value);
                    setConvertError(null);
                  }}
                  placeholder={isRTL ? "أدخل رقم البوليصة مثل: EXP-98421099 أو 771234567890" : "e.g. EXP-98421099, 771234567890"}
                  className="w-full h-11 px-3.5 bg-white text-[#251516] text-xs font-mono font-bold uppercase rounded-xl border border-gray-300 focus:border-[#C45B2A] outline-none transition-all shadow-2xs"
                  required
                  autoFocus
                  dir="ltr"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  {isRTL
                    ? "نحن وسيط بين شركة الشحن والعميل، يرجى إدخال رقم البوليصة الرسمي المستلم من الناقل بدقة."
                    : "As a logistics broker, enter the official tracking AWB issued by your carrier partner."}
                </p>
              </div>

              {/* Financials: Selling Price vs Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isRTL ? "سعر البيع للعميل" : "Selling Price to Client"}
                  </label>
                  <input
                    type="number"
                    value={convertPriceInput}
                    onChange={(e) => setConvertPriceInput(e.target.value)}
                    placeholder="2500"
                    className="w-full h-10 px-3 bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isRTL ? "نوع العملة" : "Currency"}
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={convertCurrencyInput}
                      onChange={(e) => setConvertCurrencyInput(e.target.value)}
                      className={`w-full h-10 bg-white text-[#251516] text-xs font-bold rounded-xl border border-gray-300 focus:border-[#C45B2A] outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                        isRTL ? "pr-3 pl-7 text-right" : "pl-3 pr-7 text-left"
                      }`}
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({isRTL ? c.labelAr : c.labelEn})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 absolute ${isRTL ? "left-2" : "right-2"} pointer-events-none`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isRTL ? `تكلفة الشحن (${convertCurrencyInput})` : `Direct Carrier Cost (${convertCurrencyInput})`}
                  </label>
                  <input
                    type="number"
                    value={convertCostInput}
                    onChange={(e) => setConvertCostInput(e.target.value)}
                    placeholder="1625"
                    className="w-full h-10 px-3 bg-white text-[#251516] text-xs font-bold font-mono rounded-xl border border-gray-300 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Broker & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isRTL ? "جهة الربط / الوسيط (Broker)" : "Broker / Dispatch Agent"}
                  </label>
                  <input
                    type="text"
                    value={convertBrokerInput}
                    onChange={(e) => setConvertBrokerInput(e.target.value)}
                    placeholder="XSPEED"
                    className="w-full h-10 px-3 bg-white text-[#251516] text-xs font-semibold rounded-xl border border-gray-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    {isRTL ? "ملاحظات تشغيلية" : "Operational Notes"}
                  </label>
                  <input
                    type="text"
                    value={convertNotesInput}
                    onChange={(e) => setConvertNotesInput(e.target.value)}
                    placeholder={isRTL ? "مثال: تم التعيين لسائق الاستلام" : "e.g. Courier assigned"}
                    className="w-full h-10 px-3 bg-white text-[#251516] text-xs rounded-xl border border-gray-300 outline-none"
                  />
                </div>
              </div>

              {/* Dialog Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConvertModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  className="rounded-xl text-xs font-bold bg-[#C45B2A] hover:bg-[#A8481B] text-white flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRTL ? "تأكيد وإصدار البوليصة" : "Confirm & Issue AWB"}</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
