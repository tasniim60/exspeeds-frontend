"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  ArrowRight,
  Package,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Sparkles,
  LayoutGrid,
  List,
  TrendingUp,
  Zap,
  RotateCcw,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Order, Shipment } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface OrdersViewProps {
  orders: Order[];
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onDispatchOrder: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onAddOrder,
  onUpdateOrder,
  onDispatchOrder,
}) => {
  const { t, isRTL, formatCurrency } = useLanguage();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState("Apex Global Technologies");
  const [targetDate, setTargetDate] = useState("2026-08-16");
  const [itemName, setItemName] = useState("Electronic Server Equipment");
  const [itemQty, setItemQty] = useState("2");
  const [itemWeight, setItemWeight] = useState("12.5");
  const [totalAmount, setTotalAmount] = useState("350");
  const [currency, setCurrency] = useState<"USD" | "EGP">("USD");
  const [priority, setPriority] = useState<Order["priority"]>("Express 24H");
  const [paymentStatus, setPaymentStatus] = useState<Order["paymentStatus"]>("Paid");
  const [pickupAddress, setPickupAddress] = useState("Smart Village Building B14, 6th of October City, Egypt");
  const [deliveryAddress, setDeliveryAddress] = useState("Dubai Silicon Oasis, HQ Suite 300, Dubai, UAE");
  const [notes, setNotes] = useState("");

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrd: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: "CUST-401",
      customerName: customerName,
      companyName: customerName,
      date: new Date().toISOString().split("T")[0],
      targetDeliveryDate: targetDate,
      items: [
        {
          name: itemName,
          qty: parseInt(itemQty) || 1,
          weight: parseFloat(itemWeight) || 5,
        },
      ],
      totalWeight: parseFloat(itemWeight) || 5,
      totalAmount: parseFloat(totalAmount) || 200,
      currency: currency,
      status: "New Bookings",
      priority: priority,
      paymentStatus: paymentStatus,
      pickupAddress: pickupAddress,
      deliveryAddress: deliveryAddress,
      notes: notes,
    };

    onAddOrder(newOrd);
    setCreateModalOpen(false);
  };

  const stages: Order["status"][] = [
    "New Bookings",
    "Processing",
    "Ready for Dispatch",
    "In-Transit",
    "Delivered",
  ];

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.companyName.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.deliveryAddress.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadgeVariant = (priority: Order["priority"]) => {
    switch (priority) {
      case "High Priority":
        return "destructive";
      case "Express 24H":
        return "brand";
      case "Standard 48H":
        return "info";
      default:
        return "secondary";
    }
  };

  const { newBookingsCount, inProgressCount, inTransitCount, deliveredCount, totalVolume, completionPct } = useMemo(() => {
    let nb = 0;
    let ip = 0;
    let it = 0;
    let dl = 0;

    for (let i = 0; i < orders.length; i++) {
      const st = orders[i].status;
      if (st === "New Bookings") nb++;
      else if (st === "Processing" || st === "Ready for Dispatch") ip++;
      else if (st === "In-Transit") it++;
      else if (st === "Delivered") dl++;
    }

    const vol = orders.length;
    const pct = vol > 0 ? Math.round((dl / vol) * 100) : 0;

    return {
      newBookingsCount: nb,
      inProgressCount: ip,
      inTransitCount: it,
      deliveredCount: dl,
      totalVolume: vol,
      completionPct: pct,
    };
  }, [orders]);

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-[#251516] tracking-tight">
                {t("admin.orders.title")}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {isRTL ? "سجل الحجوزات والطلبات" : "Active Orders"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {t("admin.orders.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "kanban" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
              title={isRTL ? "عرض خط سير العمليات (Kanban)" : "Kanban Pipeline View"}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
              title={isRTL ? "عرض الجدول" : "Table View"}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            size="sm"
            variant="brand"
            onClick={() => setCreateModalOpen(true)}
            className="h-10 px-4 text-xs font-bold shadow-sm cursor-pointer rounded-xl flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>{t("admin.orders.createOrder")}</span>
          </Button>
        </div>
      </div>

      {/* ─── EXECUTIVE KPI METRICS BENTO GRID (INTERACTIVE) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Card 1: Total Orders */}
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
              {isRTL ? "إجمالي الحجوزات" : "Total Orders"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C45B2A] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#251516]">
              {totalVolume}
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate">
              {isRTL ? "كافة الحجوزات المسجلة" : "All booked orders"}
            </p>
          </div>
        </div>

        {/* Card 2: New Bookings */}
        <div
          onClick={() => setStatusFilter("New Bookings")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "New Bookings"
              ? "bg-amber-50/40 border-amber-500 shadow-md ring-2 ring-amber-500/20"
              : "bg-white hover:bg-amber-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-amber-900 truncate">
              {isRTL ? "حجوزات جديدة" : "New Bookings"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-700">
              {newBookingsCount}
            </div>
            <p className="text-[10px] text-amber-800/80 font-semibold mt-0.5 truncate">
              {newBookingsCount > 0 ? (isRTL ? "بانتظار التجهيز والشحن" : "Awaiting prep") : (isRTL ? "تم تجهيز كافة الحجوزات" : "All prepped")}
            </p>
          </div>
        </div>

        {/* Card 3: In Transit */}
        <div
          onClick={() => setStatusFilter("In-Transit")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "In-Transit"
              ? "bg-blue-50/40 border-blue-500 shadow-md ring-2 ring-blue-500/20"
              : "bg-white hover:bg-blue-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-blue-900 truncate">
              {isRTL ? "قيد الشحن والترانزيت" : "In-Transit"}
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
              {isRTL ? `${inProgressCount} قيد المعالجة والإرسال` : `${inProgressCount} processing`}
            </p>
          </div>
        </div>

        {/* Card 4: Delivered */}
        <div
          onClick={() => setStatusFilter("Delivered")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
            statusFilter === "Delivered"
              ? "bg-emerald-50/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white hover:bg-emerald-50/20 border-gray-200/90 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-900 truncate">
              {isRTL ? "مكتملة ومسلمة" : "Delivered"}
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
              {isRTL ? `نسبة الإنجاز ${completionPct}%` : `Completed ${completionPct}%`}
            </p>
          </div>
        </div>
      </div>

      {/* ─── ORDERS PIPELINE PROGRESS BAR ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#251516] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C45B2A]" />
            <span>{isRTL ? "مؤشر تدفق معالجة الطلبات" : "Order Fulfillment Flow"}</span>
          </span>
          <span className="text-gray-500 font-mono text-[11px]">
            {isRTL ? `معدل التسليم: ${completionPct}%` : `Delivery Rate: ${completionPct}%`}
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
          {totalVolume > 0 ? (
            <>
              {newBookingsCount > 0 && (
                <div
                  style={{ width: `${(newBookingsCount / totalVolume) * 100}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                  title={`${isRTL ? "حجز جديد" : "New Bookings"}: ${newBookingsCount}`}
                />
              )}
              {inProgressCount > 0 && (
                <div
                  style={{ width: `${(inProgressCount / totalVolume) * 100}%` }}
                  className="bg-sky-400 h-full transition-all duration-500"
                  title={`${isRTL ? "قيد التجهيز" : "Processing"}: ${inProgressCount}`}
                />
              )}
              {inTransitCount > 0 && (
                <div
                  style={{ width: `${(inTransitCount / totalVolume) * 100}%` }}
                  className="bg-blue-500 h-full transition-all duration-500"
                  title={`${isRTL ? "قيد الشحن" : "In-Transit"}: ${inTransitCount}`}
                />
              )}
              {deliveredCount > 0 && (
                <div
                  style={{ width: `${(deliveredCount / totalVolume) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`${isRTL ? "تم التسليم" : "Delivered"}: ${deliveredCount}`}
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
            <span>{isRTL ? "حجز جديد:" : "New:"} <strong className="text-gray-900 font-mono">{newBookingsCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
            <span>{isRTL ? "قيد التجهيز:" : "Processing:"} <strong className="text-gray-900 font-mono">{inProgressCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span>{isRTL ? "قيد الشحن:" : "In-Transit:"} <strong className="text-gray-900 font-mono">{inTransitCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{isRTL ? "تم التسليم:" : "Delivered:"} <strong className="text-gray-900 font-mono">{deliveredCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-2.5 h-4 w-4 text-gray-400`} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.orders.searchPlaceholder")}
            className={`text-xs ${isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            {t("common.status")}:
          </span>
          {["all", "New Bookings", "Ready for Dispatch", "In-Transit", "Delivered"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#251516] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st === "all" ? t("admin.orders.allStatuses") : st}
            </button>
          ))}
        </div>
      </div>

      {/* ── KANBAN PIPELINE VIEW ── */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageOrders = filteredOrders.filter((o) => o.status === stage);
            return (
              <div
                key={stage}
                className="bg-gray-50/80 rounded-xl p-3 border border-gray-200 min-w-[240px] flex flex-col"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                  <span className="font-bold text-xs text-gray-800">{stage}</span>
                  <span className="text-[10px] font-bold bg-white text-gray-700 px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                    {stageOrders.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[65vh]">
                  {stageOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="p-3 bg-white rounded-lg border border-gray-200 shadow-2xs hover:border-[#C45B2A] transition-all cursor-pointer space-y-2 text-start"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#251516] ltr-preserve">{ord.orderNumber}</span>
                        <Badge variant={getPriorityBadgeVariant(ord.priority)} size="sm">
                          {ord.priority}
                        </Badge>
                      </div>

                      <div>
                        <p className="font-bold text-xs text-gray-900">{ord.companyName}</p>
                        <p className="text-[11px] text-gray-500 truncate">{ord.deliveryAddress}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono border-t border-gray-100 pt-1.5 text-gray-600">
                        <span>{ord.totalWeight} {t("common.kg")}</span>
                        <span className="font-bold text-gray-900">
                          {ord.currency === "USD" ? `$${ord.totalAmount}` : `${ord.totalAmount} ${t("common.egp")}`}
                        </span>
                      </div>

                      {ord.status === "New Bookings" || ord.status === "Ready for Dispatch" ? (
                        <div className="pt-1">
                          <Button
                            size="xs"
                            variant="brand"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDispatchOrder(ord);
                            }}
                            className="w-full text-xs font-bold"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span>{isRTL ? "إصدار بوليصة وإرسال" : "Dispatch AWB"}</span>
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {stageOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs border border-dashed border-gray-200 rounded-lg">
                      {isRTL ? "لا توجد طلبات في هذه المرحلة" : "No orders in this stage"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <Card className="shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t("admin.orders.table.orderNo")}</TableHead>
                <TableHead className="text-start">{t("admin.orders.table.company")}</TableHead>
                <TableHead className="text-start">{t("admin.orders.table.pickupDest")}</TableHead>
                <TableHead className="text-start">{isRTL ? "الوزن والقيمة" : "Weight & Value"}</TableHead>
                <TableHead className="text-start">{isRTL ? "الأولوية" : "Priority"}</TableHead>
                <TableHead className="text-start">{t("admin.orders.table.status")}</TableHead>
                <TableHead className="text-end">{t("admin.orders.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((ord) => (
                <TableRow
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className="cursor-pointer hover:bg-gray-50/90"
                >
                  <TableCell>
                    <div className="space-y-0.5 text-start">
                      <span className="font-mono font-bold text-xs text-[#251516] ltr-preserve">
                        {ord.orderNumber}
                      </span>
                      <p className="text-[11px] text-gray-500">{ord.date}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-start">
                      <p className="text-xs font-bold text-gray-900">{ord.companyName}</p>
                      <p className="text-[11px] text-gray-500">{ord.customerName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-gray-700 truncate max-w-xs text-start">{ord.deliveryAddress}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 font-mono text-xs text-start">
                      <span className="font-bold text-gray-900">
                        {ord.currency === "USD" ? `$${ord.totalAmount}` : `${ord.totalAmount} ${t("common.egp")}`}
                      </span>
                      <p className="text-[10px] text-gray-400">{ord.totalWeight} {t("common.kg")}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(ord.priority)} size="sm">
                      {ord.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ord.status === "Delivered" ? "success" : "secondary"} size="sm">
                      {ord.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    {ord.status === "New Bookings" || ord.status === "Ready for Dispatch" ? (
                      <Button
                        size="xs"
                        variant="brand"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDispatchOrder(ord);
                        }}
                        className="text-xs cursor-pointer"
                      >
                        {isRTL ? "إرسال AWB" : "Dispatch AWB"}
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedOrder(ord)}
                        className="text-xs cursor-pointer"
                      >
                        {t("common.details")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm space-y-2">
              <ShoppingCart className="h-8 w-8 mx-auto text-gray-300" />
              <p className="font-bold text-gray-700">{isRTL ? "لا توجد طلبات عملاء" : "No customer orders found"}</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Order Details Modal ── */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
          <DialogContent className="max-w-xl text-start" onClose={() => setSelectedOrder(null)}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-mono text-lg ltr-preserve">
                  {selectedOrder.orderNumber}
                </DialogTitle>
                <Badge variant={getPriorityBadgeVariant(selectedOrder.priority)}>
                  {selectedOrder.priority}
                </Badge>
              </div>
              <DialogDescription>
                {selectedOrder.date} • {selectedOrder.targetDeliveryDate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-start">
                  <span className="text-gray-400 font-semibold uppercase text-[10px]">{t("admin.orders.table.company")}</span>
                  <p className="font-bold text-gray-900 mt-0.5">{selectedOrder.companyName}</p>
                  <p className="text-gray-500">{selectedOrder.customerName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-start">
                  <span className="text-gray-400 font-semibold uppercase text-[10px]">{t("admin.orders.table.price")}</span>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedOrder.currency === "USD" ? `$${selectedOrder.totalAmount}` : `${selectedOrder.totalAmount} ${t("common.egp")}`}
                  </p>
                  <Badge variant="success" size="sm" className="mt-1">
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Items List */}
              <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2 text-start">
                <span className="text-gray-400 font-semibold uppercase text-[10px]">{isRTL ? "محتويات الشحنة" : "Items & Weight"}</span>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    <span className="font-mono text-gray-600 ltr-preserve">
                      {item.qty} pcs ({item.weight} {t("common.kg")})
                    </span>
                  </div>
                ))}
              </div>

              {/* Addresses */}
              <div className="space-y-2 text-start">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{isRTL ? "موقع الاستلام" : "Pickup Location"}</span>
                  <p className="text-gray-800 font-medium mt-0.5">{selectedOrder.pickupAddress}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{isRTL ? "وجهة التسليم" : "Delivery Destination"}</span>
                  <p className="text-gray-800 font-medium mt-0.5">{selectedOrder.deliveryAddress}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              {selectedOrder.status !== "Delivered" && !selectedOrder.linkedAwb && (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => {
                    onDispatchOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="text-xs font-bold cursor-pointer"
                >
                  <Truck className="h-4 w-4" />
                  <span>{isRTL ? "إصدار بوليصة وإرسال" : "Generate AWB & Dispatch"}</span>
                  <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="text-xs cursor-pointer"
              >
                {t("common.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Create Order Modal ── */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-xl text-start" onClose={() => setCreateModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              <ShoppingCart className="h-5 w-5 text-[#C45B2A]" />
              {t("admin.orders.modal.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.orders.modal.createSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                {t("admin.orders.modal.company")}
              </label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={isRTL ? "مثال: شركة إكس سبيد" : "Apex Global Technologies"}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "تاريخ التسليم المستهدف" : "Target Delivery Date"}
                </label>
                <Input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "أولوية التوصيل" : "Delivery Priority"}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700"
                >
                  <option value="Express 24H">Express 24H</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Standard 48H">Standard 48H</option>
                  <option value="Economy">Economy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "وصف البضاعة" : "Item Description"}
                </label>
                <Input
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={isRTL ? "أجهزة ومعدات إلكترونية" : "Electronic components"}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "الوزن الكلي" : "Total Wt (kg)"}
                </label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  value={itemWeight}
                  onChange={(e) => setItemWeight(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "عنوان الاستلام" : "Pickup Address"}
                </label>
                <Input
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "عنوان التسليم" : "Delivery Address"}
                </label>
                <Input
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "القيمة المعلنة ($)" : "Declared Value ($)"}
                </label>
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  {isRTL ? "حالة الدفع" : "Payment Status"}
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700"
                >
                  <option value="Paid">Prepaid (Paid)</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="Net 30">Corporate Net 30</option>
                  <option value="Unpaid">{isRTL ? "غير مدفوع" : "Unpaid"}</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="brand"
                className="text-xs font-bold cursor-pointer"
              >
                {t("admin.orders.modal.saveBtn")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
