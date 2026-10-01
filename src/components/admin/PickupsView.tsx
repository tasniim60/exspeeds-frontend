"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bike,
  Plus,
  Search,
  Filter,
  Phone,
  MapPin,
  Calendar,
  User,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Edit,
  ArrowUpRight,
  MessageSquare,
  AlertCircle,
  Truck,
  RefreshCw,
  X,
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
import { Customer, MASTER_AGENTS, ShipmentRequest } from "@/lib/adminData";
import { ShipmentRequestService } from "@/services/shipmentRequestService";

const WA_GROUP_LINK = "https://chat.whatsapp.com/DZJJjM8iJp12JlPp6XbR7L";

interface PickupsViewProps {
  customers?: Customer[];
  onTriggerNotification?: (
    title: string,
    message: string,
    severity: "critical" | "warning" | "success" | "info"
  ) => void;
}

export const PickupsView: React.FC<PickupsViewProps> = ({
  customers = [],
  onTriggerNotification,
}) => {
  const { t, isRTL } = useLanguage();

  const [pickups, setPickups] = useState<ShipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State: Create Pickup
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [itemType, setItemType] = useState("طرد بضائع");
  const [pickupAddress, setPickupAddress] = useState("");
  const [destination, setDestination] = useState("");
  const [courierName, setCourierName] = useState("");
  const [agentName, setAgentName] = useState(MASTER_AGENTS[0] || "مصطفي");
  const [submitting, setSubmitting] = useState(false);

  // Modal State: WhatsApp Message Modal
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waMessage, setWaMessage] = useState("");
  const [waCopied, setWaCopied] = useState(false);

  // Modal State: Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<ShipmentRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Pickups from API
  const loadPickups = useCallback(async () => {
    setLoading(true);
    try {
      const all = await ShipmentRequestService.getRequests();
      // Filter for pickup requests (PKP- prefix or contains بيك أب / pickup)
      const pickupList = (all || []).filter(
        (r) =>
          r.requestNumber?.startsWith("PKP-") ||
          r.id?.includes("pkp") ||
          r.contents?.includes("بيك أب") ||
          r.contents?.includes("Pickup") ||
          r.internalNotes?.includes("بيك أب") ||
          r.internalNotes?.includes("Pickup")
      );
      setPickups(pickupList);
    } catch (err) {
      console.error("Failed to load pickups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPickups();
  }, [loadPickups]);

  // Handle Customer Selection in form
  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!customerId) return;
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setCustomerName(found.company || found.name);
      setCustomerPhone(found.phone || "");
      if (found.city) {
        setPickupAddress(found.city);
      }
    }
  };

  // Build WhatsApp formatted message matching Google Apps Script
  const generateWaText = (req: {
    requestNumber: string;
    customerName: string;
    phone: string;
    itemType: string;
    pickupAddress: string;
    destination: string;
    courierName: string;
    agentName: string;
    date: string;
  }) => {
    return [
      `📦 *طلب استلام وبك أب جديد - XSPEED*`,
      `رقم الإذن: *${req.requestNumber}*`,
      `التاريخ: ${req.date}`,
      `────────────────────`,
      `👤 *العميل:* ${req.customerName}`,
      `📞 *الهاتف:* ${req.phone}`,
      `🏷️ *نوع الشحنة:* ${req.itemType}`,
      `📍 *مكان الاستلام (منين):* ${req.pickupAddress || "-"}`,
      `🎯 *الوجهة (رايحة فين):* ${req.destination || "-"}`,
      `🛵 *المسؤول عن البيك أب:* ${req.courierName || "لم يحدد"}`,
      `✍️ *المسجل:* ${req.agentName}`,
      `────────────────────`,
      `يرجى تأكيد الاستلام فور التحرك. بالتوفيق!`,
    ].join("\n");
  };

  // Handle Form Submit
  const handleCreatePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert(isRTL ? "يرجى إدخال اسم العميل ورقم هاتفه" : "Please fill customer name and phone");
      return;
    }

    setSubmitting(true);
    try {
      const reqNum = `PKP-${Date.now().toString().slice(-6)}`;
      const newReq: ShipmentRequest = {
        id: `req-pkp-${Date.now()}`,
        requestNumber: reqNum,
        customerName: customerName.trim(),
        companyName: customerName.trim(),
        phone: customerPhone.trim(),
        whatsapp: customerPhone.trim(),
        email: `${customerPhone.trim()}@client.exspeeds.com`,
        country: "Egypt",
        city: "Cairo",
        address: pickupAddress.trim() || "موقع العميل",
        pickupCountry: "Egypt",
        pickupCity: "Cairo",
        pickupAddress: pickupAddress.trim() || "موقع العميل",
        pickupContactName: customerName.trim(),
        pickupContactPhone: customerPhone.trim(),
        preferredPickupDate: date,
        deliveryCountry: destination.trim() || "Egypt",
        deliveryCity: destination.trim() || "Cairo",
        deliveryAddress: destination.trim() || "Cairo, Egypt",
        consigneeName: "Consignee",
        consigneePhone: customerPhone.trim(),
        shipmentType: "Parcel",
        contents: itemType.trim() || "طرد بضائع",
        packageCount: 1,
        weight: 1.0,
        status: "New",
        internalNotes: `طلب بيك أب فوري | المسؤول: ${courierName.trim() || "لم يحدد"} | المسجل: ${agentName}`,
        createdAt: `${date}T10:00:00.000Z`,
        updatedAt: new Date().toISOString(),
      };

      await ShipmentRequestService.createRequest(newReq);

      if (onTriggerNotification) {
        onTriggerNotification(
          isRTL ? "تم حفظ طلب البيك أب بنجاح" : "Pickup Order Saved",
          isRTL
            ? `تم تسجيل طلب استلام جديد برقم ${newReq.requestNumber} للعميل ${newReq.customerName}`
            : `Pickup request recorded for ${newReq.customerName}`,
          "success"
        );
      }

      await loadPickups();
      setCreateModalOpen(false);

      // Prepare WhatsApp text & open modal
      const waMsgText = generateWaText({
        requestNumber: reqNum,
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        itemType: itemType.trim() || "طرد بضائع",
        pickupAddress: pickupAddress.trim(),
        destination: destination.trim(),
        courierName: courierName.trim(),
        agentName,
        date,
      });
      setWaMessage(waMsgText);
      setWaModalOpen(true);

      // Reset form
      setSelectedCustomerId("");
      setCustomerName("");
      setCustomerPhone("");
      setItemType("طرد بضائع");
      setPickupAddress("");
      setDestination("");
      setCourierName("");
    } catch (err) {
      console.error("Failed to create pickup:", err);
      alert(isRTL ? "حدث خطأ أثناء حفظ طلب البيك أب" : "Failed to save pickup");
    } finally {
      setSubmitting(false);
    }
  };

  // Copy WhatsApp Message & Open Group
  const handleCopyAndOpenGroup = () => {
    navigator.clipboard.writeText(waMessage);
    setWaCopied(true);
    setTimeout(() => {
      setWaCopied(false);
      window.open(WA_GROUP_LINK, "_blank");
    }, 600);
  };

  // Update Status
  const handleStatusChange = async (req: ShipmentRequest, newStatus: ShipmentRequest["status"]) => {
    try {
      await ShipmentRequestService.updateRequest(req.id, { status: newStatus });
      await loadPickups();
      if (onTriggerNotification) {
        onTriggerNotification(
          isRTL ? "تم تحديث حالة البيك أب" : "Pickup Status Updated",
          isRTL ? `تم تغيير حالة الطلب ${req.requestNumber} إلى ${newStatus}` : `Status updated to ${newStatus}`,
          "info"
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ShipmentRequestService.deleteRequest(deleteTarget.id);
      await loadPickups();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete pickup:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Pickups
  const filteredPickups = useMemo(() => {
    return pickups.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.requestNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.includes(searchQuery) ||
        p.pickupAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.deliveryAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.internalNotes?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "New" &&
          (p.status === "New" ||
            p.status === "Price Sent" ||
            p.status === "Awaiting Customer Response")) ||
        (statusFilter === "Contacted" && p.status === "Contacted") ||
        (statusFilter === "Approved" &&
          (p.status === "Approved" ||
            p.status === "Customer Confirmed" ||
            p.status === "Converted to Shipment")) ||
        (statusFilter === "Cancelled" && p.status === "Cancelled");

      return matchesSearch && matchesStatus;
    });
  }, [pickups, searchQuery, statusFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const total = pickups.length;
    const pending = pickups.filter(
      (p) =>
        p.status === "New" ||
        p.status === "Price Sent" ||
        p.status === "Awaiting Customer Response"
    ).length;
    const inProgress = pickups.filter((p) => p.status === "Contacted").length;
    const completed = pickups.filter(
      (p) =>
        p.status === "Approved" ||
        p.status === "Customer Confirmed" ||
        p.status === "Converted to Shipment"
    ).length;
    return { total, pending, inProgress, completed };
  }, [pickups]);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#251516] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#16A085]/10 border border-[#16A085]/30 text-[#16A085] flex items-center justify-center shadow-xs">
              <Bike className="w-5 h-5" />
            </div>
            <span>{isRTL ? "إدارة طلبات البيك أب والاستلام" : "Pickup & Dispatch Orders"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isRTL
              ? "تسجيل ومتابعة استلام الشحنات من العملاء والتنسيق مع المناديب وجروب الواتساب"
              : "Dispatch pickup tasks to couriers and coordinate live on WhatsApp group"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPickups}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 h-10 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isRTL ? "تحديث" : "Refresh"}</span>
          </Button>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#16A085] hover:bg-[#138d75] text-white font-bold h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? "تسجيل بيك أب جديد" : "New Pickup Order"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase">{isRTL ? "إجمالي طلبات البيك أب" : "Total Pickups"}</p>
              <p className="text-2xl font-black text-gray-900">{kpis.total}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#16A085] flex items-center justify-center border border-teal-200">
              <Bike className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-200 bg-amber-50/40 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-800 uppercase">{isRTL ? "في الانتظار (جديد)" : "Pending / New"}</p>
              <p className="text-2xl font-black text-amber-900">{kpis.pending}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-sky-200 bg-sky-50/40 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-sky-800 uppercase">{isRTL ? "جاري التنسيق / مندوب" : "In Dispatch"}</p>
              <p className="text-2xl font-black text-sky-900">{kpis.inProgress}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center border border-sky-300">
              <Truck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-800 uppercase">{isRTL ? "تم الاستلام بنجاح" : "Completed / Picked Up"}</p>
              <p className="text-2xl font-black text-emerald-900">{kpis.completed}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
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
                placeholder={isRTL ? "بحث باسم العميل، الهاتف، العنوان، أو رقم الإذن..." : "Search customer, phone, location..."}
                className={`h-10 rounded-xl bg-gray-50/60 border-gray-200 text-xs sm:text-sm ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 outline-none focus:border-[#16A085] cursor-pointer"
              >
                <option value="all">{isRTL ? "كل الحالات" : "All Statuses"}</option>
                <option value="New">{isRTL ? "جديد (في الانتظار)" : "New / Pending"}</option>
                <option value="Contacted">{isRTL ? "جاري التنسيق" : "In Dispatch"}</option>
                <option value="Approved">{isRTL ? "تم الاستلام بنجاح" : "Completed"}</option>
                <option value="Cancelled">{isRTL ? "ملغي" : "Cancelled"}</option>
              </select>

              <a
                href={WA_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0"
                title={isRTL ? "فتح جروب الواتساب الخاص بالبيك أب" : "Open WhatsApp Group"}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isRTL ? "جروب البيك أب" : "WA Group"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pickups Table */}
      <Card className="rounded-2xl border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/90 border-b border-gray-200">
              <TableRow>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "رقم الإذن / التاريخ" : "Order ID / Date"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "العميل ورقم الهاتف" : "Customer & Phone"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "مكان الاستلام (منين)" : "Pickup Address"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "الوجهة ومحتوى الشحنة" : "Destination & Cargo"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المسؤول / المسجل" : "Courier & Agent"}
                </TableHead>
                <TableHead className={`text-xs font-bold text-gray-700 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "الحالة" : "Status"}
                </TableHead>
                <TableHead className="text-center text-xs font-bold text-gray-700">
                  {isRTL ? "الإجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#16A085]" />
                    <p className="text-xs font-bold">{isRTL ? "جاري تحميل طلبات البيك أب..." : "Loading pickups..."}</p>
                  </TableCell>
                </TableRow>
              ) : filteredPickups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Bike className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{isRTL ? "لا توجد طلبات بيك أب مسجلة" : "No pickup orders found"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isRTL ? "يمكنك تسجيل طلب استلام جديد بالضغط على زر إضافة بيك أب" : "Create a new pickup order to get started"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPickups.map((p) => {
                  const reqDate = p.preferredPickupDate || p.createdAt?.split("T")[0] || "-";
                  const isNew =
                    p.status === "New" ||
                    p.status === "Price Sent" ||
                    p.status === "Awaiting Customer Response";
                  const isContacted = p.status === "Contacted";
                  const isDone =
                    p.status === "Approved" ||
                    p.status === "Customer Confirmed" ||
                    p.status === "Converted to Shipment";

                  return (
                    <TableRow key={p.id} className="hover:bg-teal-50/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-gray-900">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-teal-50 text-[#16A085] px-2 py-0.5 rounded-md border border-teal-200">
                            {p.requestNumber}
                          </span>
                        </div>
                        <div className="text-[11px] font-normal text-gray-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{reqDate}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-bold text-gray-900 text-xs sm:text-sm">{p.customerName}</div>
                        <div className="text-xs font-mono text-gray-600 flex items-center gap-1 mt-0.5" dir="ltr">
                          <Phone className="w-3 h-3 text-[#16A085]" />
                          <span>{p.phone}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-gray-800 max-w-[180px]">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{p.pickupAddress || p.address || "-"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-gray-800 max-w-[180px]">
                        <div className="font-semibold text-gray-900">{p.contents || "طرد بضائع"}</div>
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">
                          {isRTL ? "الوجهة: " : "Dest: "}
                          {p.deliveryAddress || p.deliveryCity || "-"}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-gray-700">
                        <div className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 inline-block">
                          {p.internalNotes?.split("|")[1]?.replace("المسؤول:", "").trim() || "غير محدد"}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {p.internalNotes?.split("|")[2]?.replace("المسجل:", "").trim() || ""}
                        </div>
                      </TableCell>

                      <TableCell>
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p, e.target.value as ShipmentRequest["status"])}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                            isNew
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : isContacted
                              ? "bg-sky-50 text-sky-800 border-sky-300"
                              : isDone
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-gray-50 text-gray-700 border-gray-300"
                          }`}
                        >
                          <option value="New">{isRTL ? "في الانتظار" : "New / Pending"}</option>
                          <option value="Contacted">{isRTL ? "جاري الاستلام" : "In Dispatch"}</option>
                          <option value="Approved">{isRTL ? "تم الاستلام بنجاح" : "Completed"}</option>
                          <option value="Cancelled">{isRTL ? "ملغي" : "Cancelled"}</option>
                        </select>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const wa = generateWaText({
                                requestNumber: p.requestNumber,
                                customerName: p.customerName,
                                phone: p.phone,
                                itemType: p.contents || "طرد بضائع",
                                pickupAddress: p.pickupAddress || p.address || "",
                                destination: p.deliveryAddress || p.deliveryCity || "",
                                courierName: p.internalNotes?.split("|")[1]?.replace("المسؤول:", "").trim() || "",
                                agentName: p.internalNotes?.split("|")[2]?.replace("المسجل:", "").trim() || "مصطفي",
                                date: reqDate,
                              });
                              setWaMessage(wa);
                              setWaModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200/90 hover:border-emerald-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                            title={isRTL ? "نسخ رسالة الواتساب للجروب" : "Copy WA Dispatch Message"}
                            aria-label={isRTL ? "نسخ رسالة الواتساب للجروب" : "Copy WA Dispatch Message"}
                          >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(p)}
                            className="h-8 w-8 p-0 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center shrink-0"
                            title={isRTL ? "حذف الطلب" : "Delete Pickup"}
                            aria-label={isRTL ? "حذف الطلب" : "Delete Pickup"}
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
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
      </Card>

      {/* Modal: Create Pickup Form */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#16A085] flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <span>{isRTL ? "تسجيل طلب بيك أب واستلام جديد" : "New Pickup Dispatch Order"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isRTL
                ? "أدخل تفاصيل موقع الاستلام والتسليم لتوجيه المندوب وتوليد رسالة الجروب"
                : "Enter customer and cargo pickup location to dispatch courier"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePickup} className="space-y-3.5 text-xs py-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "تاريخ العملية:" : "Date:"}</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-9 text-xs" />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "اسم المسجل:" : "Agent:"}</label>
                <select
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
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

            {/* Customer Lookup or Free Text */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "العميل (اختر أو اكتب):" : "Customer:"}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full h-9 px-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium outline-none"
                >
                  <option value="">{isRTL ? "-- اختر من قائمة العملاء --" : "-- Select Registered Client --"}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.name}
                    </option>
                  ))}
                </select>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isRTL ? "اسم العميل / الشركة" : "Customer Name"}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "رقم الهاتف:" : "Phone Number:"}</label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  dir="ltr"
                  required
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "نوع الشحنة:" : "Cargo Type:"}</label>
                <Input
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  placeholder={isRTL ? "طرد بضائع، مستندات، عينات" : "Parcels, docs, samples"}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">{isRTL ? "عنوان الاستلام (منين):" : "Pickup Location:"}</label>
              <Input
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder={isRTL ? "مثال: المعادي - شارع النصر برج 4" : "e.g. Maadi, St 9 building 4"}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "الوجهة (رايحة فين):" : "Destination:"}</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={isRTL ? "مثال: دبي، السعودية، التجمع" : "Dubai, KSA, Cairo"}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">{isRTL ? "المسؤول عن البيك أب:" : "Courier / Agent:"}</label>
                <Input
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder={isRTL ? "اسم المندوب أو شركة التوصيل" : "Courier Name"}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="h-10 text-xs rounded-xl"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#16A085] hover:bg-[#138d75] text-white font-bold h-10 px-5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{isRTL ? "حفظ وتوليد رسالة الواتساب" : "Save & Generate WhatsApp"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: WhatsApp Copy Message & Open Group */}
      <Dialog open={waModalOpen} onOpenChange={setWaModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 text-center">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-black text-gray-900">
              {isRTL ? "تم حفظ طلب البيك أب بنجاح!" : "Pickup Order Saved!"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isRTL
                ? "اضغط أدناه لنسخ رسالة التكليف وفتح جروب الواتساب الخاص بالمناديب مباشرة:"
                : "Click below to copy the dispatch message and open WhatsApp group"}
            </DialogDescription>
          </DialogHeader>

          <div className="my-3 text-start">
            <textarea
              value={waMessage}
              readOnly
              rows={7}
              className="w-full text-xs font-mono bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none select-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCopyAndOpenGroup}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {waCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{waCopied ? (isRTL ? "تم النسخ بنجاح ✔" : "Copied ✔") : (isRTL ? "انسخ الرسالة وافتح الجروب" : "Copy & Open WA Group")}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setWaModalOpen(false)}
              className="h-9 text-xs rounded-xl border-gray-300"
            >
              {isRTL ? "إغلاق" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm rounded-3xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-black text-gray-900">
            {isRTL ? "تأكيد حذف طلب البيك أب" : "Confirm Delete"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {isRTL
              ? `هل أنت متأكد من حذف طلب البيك أب برقم ${deleteTarget?.requestNumber}؟`
              : `Are you sure you want to delete pickup ${deleteTarget?.requestNumber}?`}
          </DialogDescription>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="h-10 rounded-xl"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 rounded-xl cursor-pointer"
            >
              {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>{isRTL ? "حذف نهائي" : "Delete"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
