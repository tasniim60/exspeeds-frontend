"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Package,
  DollarSign,
  Truck,
  Globe,
  Users,
  Receipt,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Scale,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shipment, Order, Customer, Invoice } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";
import { useAdminStore } from "@/stores/useAdminStore";

interface StatisticsViewProps {
  shipments: Shipment[];
  orders: Order[];
  customers: Customer[];
  invoices: Invoice[];
  onNavigateTab: (tab: any) => void;
}

const formatCarrierName = (carrier?: string): string => {
  if (!carrier) return "Express";
  const upper = carrier.toUpperCase().trim();
  if (upper.includes("DHL")) return "Express";
  return carrier;
};

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  shipments,
  orders,
  customers,
  invoices,
  onNavigateTab,
}) => {
  const { isRTL, formatDate } = useLanguage();
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d" | "ytd">("ytd");
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Read actual ledger data from store
  const expenses = useAdminStore((s) => s.expenses) || [];
  const collections = useAdminStore((s) => s.collections) || [];
  const carrierTransfers = useAdminStore((s) => s.carrierTransfers) || [];
  const salaries = useAdminStore((s) => s.salaries) || [];

  // 1. Dynamic Date Filtering
  const filteredShipments = useMemo(() => {
    if (!shipments || shipments.length === 0) return [];
    if (timeframe === "ytd") return shipments;

    const now = new Date();
    return shipments.filter((s) => {
      if (!s.date) return true;
      const shipmentDate = new Date(s.date);
      if (isNaN(shipmentDate.getTime())) return true;
      const diffDays = (now.getTime() - shipmentDate.getTime()) / (1000 * 3600 * 24);

      if (timeframe === "today") return diffDays <= 1.5;
      if (timeframe === "7d") return diffDays <= 7;
      if (timeframe === "30d") return diffDays <= 30;
      return true;
    });
  }, [shipments, timeframe]);

  const filteredExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    if (timeframe === "ytd") return expenses;

    const now = new Date();
    return expenses.filter((e) => {
      if (!e.date) return true;
      const expDate = new Date(e.date);
      if (isNaN(expDate.getTime())) return true;
      const diffDays = (now.getTime() - expDate.getTime()) / (1000 * 3600 * 24);

      if (timeframe === "today") return diffDays <= 1.5;
      if (timeframe === "7d") return diffDays <= 7;
      if (timeframe === "30d") return diffDays <= 30;
      return true;
    });
  }, [expenses, timeframe]);

  // 2. Real Operational & Financial Sums
  const totalVolume = filteredShipments.length;

  const {
    deliveredCount,
    inTransitCount,
    pendingCount,
    totalSalesRevenue,
    totalCarrierCosts,
    totalTransExpenses,
    grossShippingProfit,
    chargeableTotalWeight,
  } = useMemo(() => {
    let dl = 0;
    let it = 0;
    let pd = 0;
    let rev = 0;
    let carrierCost = 0;
    let transExp = 0;
    let profit = 0;
    let chgWt = 0;

    for (let i = 0; i < filteredShipments.length; i++) {
      const s = filteredShipments[i];
      const selling = s.sellingPrice !== undefined ? s.sellingPrice : (s.priceEgp || 0);
      const cCost = s.costPrice || 0;
      const tExp = s.transExpense || 0;
      const net = s.netProfit !== undefined ? s.netProfit : (selling - cCost - tExp);

      const actualW = s.actualWeight || s.weight || 0;
      const volW = s.volumetricWeight || 0;
      const chargeableW = Math.max(actualW, volW) || actualW || 1;

      rev += selling;
      carrierCost += cCost;
      transExp += tExp;
      profit += net;
      chgWt += chargeableW;

      const st = (s.status as string || "").toLowerCase().trim();
      if (st === "delivered" || st === "deliverd") {
        dl++;
      } else if (
        st === "in transit" ||
        st === "out for delivery" ||
        st === "in the way" ||
        st === "destination" ||
        st === "customs"
      ) {
        it++;
      } else {
        pd++;
      }
    }

    return {
      deliveredCount: dl,
      inTransitCount: it,
      pendingCount: pd,
      totalSalesRevenue: rev,
      totalCarrierCosts: carrierCost,
      totalTransExpenses: transExp,
      grossShippingProfit: profit,
      chargeableTotalWeight: Math.round(chgWt * 10) / 10,
    };
  }, [filteredShipments]);

  const totalGeneralExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const totalSalariesPaid = useMemo(() => {
    return salaries.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  }, [salaries]);

  const totalDirectCosts = totalCarrierCosts + totalTransExpenses;
  const netOperatingProfit = grossShippingProfit - totalGeneralExpenses;
  const netProfitMarginPct = totalSalesRevenue > 0 ? ((netOperatingProfit / totalSalesRevenue) * 100).toFixed(1) : "0.0";
  const deliverySuccessRate = totalVolume > 0 ? Math.round((deliveredCount / totalVolume) * 100) : 100;

  // 3. Destinations
  const countryDistribution = useMemo(() => {
    const map: Record<string, { count: number; sales: number; weight: number; delivered: number }> = {};
    filteredShipments.forEach((s) => {
      const c = (s.country || (isRTL ? "غير محدد" : "Unspecified")).trim();
      if (!map[c]) map[c] = { count: 0, sales: 0, weight: 0, delivered: 0 };
      map[c].count += 1;
      map[c].sales += s.sellingPrice || s.priceEgp || 0;
      map[c].weight += s.weight || s.actualWeight || s.volumetricWeight || 1;
      const st = (s.status as string || "").toLowerCase();
      if (st === "delivered" || st === "deliverd") map[c].delivered += 1;
    });

    return Object.keys(map)
      .map((country) => ({
        country,
        count: map[country].count,
        sales: map[country].sales,
        weight: Math.round(map[country].weight * 10) / 10,
        share: totalVolume > 0 ? Math.round((map[country].count / totalVolume) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredShipments, totalVolume, isRTL]);

  // 4. Carriers
  const carrierDistribution = useMemo(() => {
    const map: Record<string, { count: number; cost: number; sales: number }> = {};
    filteredShipments.forEach((s) => {
      const c = formatCarrierName(s.carrier || "Express");
      if (!map[c]) map[c] = { count: 0, cost: 0, sales: 0 };
      map[c].count += 1;
      map[c].cost += (s.costPrice || 0) + (s.transExpense || 0);
      map[c].sales += s.sellingPrice || s.priceEgp || 0;
    });

    return Object.keys(map)
      .map((name) => {
        const data = map[name];
        const profit = data.sales - data.cost;
        const share = totalVolume > 0 ? Math.round((data.count / totalVolume) * 100) : 0;
        return { name, count: data.count, cost: data.cost, sales: data.sales, profit, share };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredShipments, totalVolume]);

  // 5. Top Accounts
  const topAccounts = useMemo(() => {
    const map: Record<string, { count: number; sales: number; netProf: number; lastDate?: string }> = {};
    filteredShipments.forEach((s) => {
      const acc = (s.account || s.company || s.senderName || (isRTL ? "عميل نقدي" : "Cash Client")).trim();
      if (!map[acc]) map[acc] = { count: 0, sales: 0, netProf: 0, lastDate: s.date };
      const selling = s.sellingPrice || s.priceEgp || 0;
      const netP = s.netProfit !== undefined ? s.netProfit : (selling - (s.costPrice || 0) - (s.transExpense || 0));
      map[acc].count += 1;
      map[acc].sales += selling;
      map[acc].netProf += netP;
      if (s.date && (!map[acc].lastDate || s.date > map[acc].lastDate!)) {
        map[acc].lastDate = s.date;
      }
    });

    return Object.keys(map)
      .map((name) => ({
        name,
        count: map[name].count,
        sales: map[name].sales,
        netProf: map[name].netProf,
        lastDate: map[name].lastDate,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredShipments, isRTL]);

  // 6. Liquidity & Invoices
  const totalBilledInvoices = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (Number((inv as any).totalAmount || (inv as any).amount || 0)), 0);
  }, [invoices]);

  const totalCollectedCash = useMemo(() => {
    return collections.reduce((sum, col) => sum + (Number(col.amount) || 0), 0);
  }, [collections]);

  const totalTransferredToCarriers = useMemo(() => {
    return carrierTransfers.reduce((sum, ct) => sum + (Number(ct.amount) || 0), 0);
  }, [carrierTransfers]);

  return (
    <div className="space-y-5 text-start font-sans">
      {/* ── 1. Simple, Clean Header with Timeframe Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {isRTL ? "الإحصائيات والتقارير" : "Statistics & Reports"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            {isRTL
              ? `ملخص العمليات الحالية (${totalVolume} شحنة مسجلة)`
              : `Operational summary based on ${totalVolume} shipments`}
          </p>
        </div>

        {/* Timeframe Pill Switcher */}
        <div className="inline-flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200/80 text-xs font-bold self-start sm:self-auto">
          {[
            { id: "today", label: isRTL ? "اليوم" : "Today" },
            { id: "7d", label: isRTL ? "7 أيام" : "7 Days" },
            { id: "30d", label: isRTL ? "30 يوم" : "30 Days" },
            { id: "ytd", label: isRTL ? `الكل (${shipments.length})` : `All (${shipments.length})` },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-bold ${
                timeframe === tf.id
                  ? "bg-[#C45B2A] text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Top 4 Main KPI Cards (Clean, Bold, Simple) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Shipments */}
        <Card className="p-4 bg-white border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#C45B2A] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-500">
              {isRTL ? "عدد الشحنات" : "Shipments"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5" dir="ltr">
            <span className="text-xs font-bold text-gray-400">{isRTL ? "شحنة" : "AWB"}</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-gray-900">{totalVolume}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-700 font-bold">{deliveredCount} {isRTL ? "مُسلّمة" : "Delivered"}</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">{inTransitCount} {isRTL ? "بالطريق" : "Transit"}</span>
          </div>
        </Card>

        {/* Total Sales */}
        <Card className="p-4 bg-white border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-500">
              {isRTL ? "إجمالي المبيعات" : "Total Revenue"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl sm:text-3xl font-black font-mono text-gray-900">
              {totalSalesRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-blue-600">EGP</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {isRTL ? "متوسط الشحنة:" : "Avg per shipment:"}{" "}
            <span className="font-mono font-bold text-gray-700" dir="ltr">
              {totalVolume > 0 ? Math.round(totalSalesRevenue / totalVolume).toLocaleString() : 0} EGP
            </span>
          </div>
        </Card>

        {/* Direct Costs & Expenses */}
        <Card className="p-4 bg-white border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-500">
              {isRTL ? "التكاليف والمصروفات" : "Costs & Expenses"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl sm:text-3xl font-black font-mono text-gray-900">
              {(totalDirectCosts + totalGeneralExpenses).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-rose-600">EGP</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {isRTL ? "تكلفة الشحن: " : "Freight Cost: "}{" "}
            <span className="font-mono font-bold text-gray-700" dir="ltr">
              {totalDirectCosts.toLocaleString()} EGP
            </span>
          </div>
        </Card>

        {/* Net Operating Profit */}
        <Card className="p-4 bg-emerald-50/60 border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-950">
              {isRTL ? "صافي الربح" : "Net Profit"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-950">
              {netOperatingProfit.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700">EGP</span>
          </div>
          <div className="mt-2 text-xs font-bold text-emerald-800">
            {isRTL ? "هامش الربح:" : "Margin:"} {netProfitMarginPct}%
          </div>
        </Card>
      </div>

      {/* ── 3. Simple & Focused Tabs (Clean Navigation) ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200/90 p-1 rounded-xl shadow-2xs gap-1 flex-wrap h-auto">
          <TabsTrigger
            value="overview"
            className="px-4 py-2 rounded-lg text-xs font-bold data-[state=active]:bg-[#C45B2A] data-[state=active]:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isRTL ? "الملخص المالي والسيولة" : "Financial Summary"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="carriers"
            className="px-4 py-2 rounded-lg text-xs font-bold data-[state=active]:bg-[#C45B2A] data-[state=active]:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isRTL ? "شركات الشحن" : "Carriers"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="accounts"
            className="px-4 py-2 rounded-lg text-xs font-bold data-[state=active]:bg-[#C45B2A] data-[state=active]:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isRTL ? "أهم العملاء" : "Top Clients"}</span>
          </TabsTrigger>

          <TabsTrigger
            value="destinations"
            className="px-4 py-2 rounded-lg text-xs font-bold data-[state=active]:bg-[#C45B2A] data-[state=active]:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isRTL ? "الوجهات والدول" : "Destinations"}</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: FINANCIAL SUMMARY & LIQUIDITY ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Financial Breakdown */}
            <Card className="bg-white border border-gray-200/80 shadow-2xs">
              <CardHeader className="p-4 pb-2 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#C45B2A]" />
                  <span>{isRTL ? "تفصيل الإيرادات والأرباح" : "Profit & Cost Breakdown"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">{isRTL ? "مبيعات الشحن" : "Freight Sales"}</span>
                  <span className="font-mono font-bold text-blue-700 text-sm" dir="ltr">
                    +{totalSalesRevenue.toLocaleString()} EGP
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">{isRTL ? "تكاليف الشحن للناقلين" : "Carrier Costs"}</span>
                  <span className="font-mono font-bold text-gray-700 text-sm" dir="ltr">
                    -{totalCarrierCosts.toLocaleString()} EGP
                  </span>
                </div>

                {totalTransExpenses > 0 && (
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">{isRTL ? "النقل والمناولة الداخلية" : "Local Handling"}</span>
                    <span className="font-mono font-bold text-gray-700 text-sm" dir="ltr">
                      -{totalTransExpenses.toLocaleString()} EGP
                    </span>
                  </div>
                )}

                {totalGeneralExpenses > 0 && (
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">{isRTL ? "المصروفات العامة" : "Overhead Expenses"}</span>
                    <span className="font-mono font-bold text-rose-700 text-sm" dir="ltr">
                      -{totalGeneralExpenses.toLocaleString()} EGP
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 mt-2">
                  <span className="text-emerald-950 font-bold">{isRTL ? "صافي الربح المحقق" : "Net Operating Profit"}</span>
                  <span className="font-mono font-black text-emerald-800 text-base" dir="ltr">
                    {netOperatingProfit > 0 ? `+${netOperatingProfit.toLocaleString()}` : netOperatingProfit.toLocaleString()} EGP
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Invoicing & Liquidity */}
            <Card className="bg-white border border-gray-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <CardHeader className="p-4 pb-2 border-b border-gray-100">
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#C45B2A]" />
                    <span>{isRTL ? "الفواتير والسيولة" : "Invoicing & Liquidity"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">{isRTL ? "إجمالي فواتير العملاء" : "Invoiced to Clients"}</span>
                    <span className="font-mono font-bold text-gray-900" dir="ltr">{totalBilledInvoices.toLocaleString()} EGP</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100">
                    <span className="text-emerald-900 font-medium">{isRTL ? "التحصيلات المستلمة" : "Collections Received"}</span>
                    <span className="font-mono font-bold text-emerald-800" dir="ltr">{totalCollectedCash.toLocaleString()} EGP</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-blue-50/70 rounded-lg border border-blue-100">
                    <span className="text-blue-900 font-medium">{isRTL ? "المسدد لشركات الشحن" : "Paid to Carriers"}</span>
                    <span className="font-mono font-bold text-blue-800" dir="ltr">{totalTransferredToCarriers.toLocaleString()} EGP</span>
                  </div>

                  {totalSalariesPaid > 0 && (
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">{isRTL ? "الرواتب والمسحوبات" : "Salaries Paid"}</span>
                      <span className="font-mono font-bold text-gray-900" dir="ltr">{totalSalariesPaid.toLocaleString()} EGP</span>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateTab("invoices")}
                  className="w-full text-xs font-bold rounded-lg cursor-pointer h-8"
                >
                  <span>{isRTL ? "عرض الفواتير والمطالبات" : "Open Invoices"}</span>
                  <ChevronLeft className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 2: CARRIERS ── */}
        <TabsContent value="carriers" className="space-y-4">
          <Card className="bg-white border border-gray-200/80 shadow-2xs">
            <CardHeader className="p-4 pb-2 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C45B2A]" />
                <span>{isRTL ? "حصة وأداء شركات الشحن والناقلين" : "Carrier Routing & Distribution"}</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab("carriers")}
                className="text-xs text-[#C45B2A] hover:bg-orange-50 font-bold h-7"
              >
                {isRTL ? "إدارة الشركات" : "Manage"}
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {carrierDistribution.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  {isRTL ? "لا توجد بيانات شحن لهذه الفترة." : "No carrier data found for this period."}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {carrierDistribution.map((c) => (
                    <div key={c.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#C45B2A] flex items-center justify-center font-bold text-xs shrink-0">
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                          <p className="text-[11px] text-gray-500">
                            {c.count} {isRTL ? "شحنة" : "AWBs"} ({c.share}%)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto" dir="ltr">
                        <div className="text-end">
                          <span className="text-[10px] text-gray-400 block">{isRTL ? "التكلفة" : "Cost"}</span>
                          <span className="font-mono font-bold text-gray-700 text-xs">
                            {c.cost.toLocaleString()} EGP
                          </span>
                        </div>
                        <div className="text-end">
                          <span className="text-[10px] text-gray-400 block">{isRTL ? "المبيعات" : "Sales"}</span>
                          <span className="font-mono font-bold text-gray-900 text-xs">
                            {c.sales.toLocaleString()} EGP
                          </span>
                        </div>
                        <div className="text-end">
                          <span className="text-[10px] text-gray-400 block">{isRTL ? "صافي الربح" : "Profit"}</span>
                          <span className="font-mono font-black text-emerald-700 text-xs">
                            +{c.profit.toLocaleString()} EGP
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: TOP CLIENT ACCOUNTS ── */}
        <TabsContent value="accounts" className="space-y-4">
          <Card className="bg-white border border-gray-200/80 shadow-2xs">
            <CardHeader className="p-4 pb-2 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C45B2A]" />
                <span>{isRTL ? "أهم العملاء وحسابات الشحن" : "Top Accounts"}</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab("customers")}
                className="text-xs text-[#C45B2A] hover:bg-orange-50 font-bold h-7"
              >
                {isRTL ? "سجل العملاء" : "Clients"}
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {topAccounts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  {isRTL ? "لا توجد حسابات شحن مسجلة." : "No accounts found."}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {topAccounts.slice(0, 10).map((acc, idx) => (
                    <div key={acc.name} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0" dir="ltr">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{acc.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {acc.count} {isRTL ? "شحنة" : "AWBs"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0" dir="ltr">
                        <div className="text-end">
                          <span className="text-[10px] text-gray-400 block">{isRTL ? "المبيعات" : "Sales"}</span>
                          <span className="font-mono font-bold text-gray-800 text-xs">
                            {acc.sales.toLocaleString()} EGP
                          </span>
                        </div>
                        <div className="text-end">
                          <span className="text-[10px] text-gray-400 block">{isRTL ? "الربح" : "Profit"}</span>
                          <span className="font-mono font-black text-emerald-700 text-xs">
                            +{acc.netProf.toLocaleString()} EGP
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: DESTINATIONS ── */}
        <TabsContent value="destinations" className="space-y-4">
          <Card className="bg-white border border-gray-200/80 shadow-2xs">
            <CardHeader className="p-4 pb-2 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#C45B2A]" />
                <span>{isRTL ? "الوجهات والدول المستلمة للشحنات" : "Destination Countries"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {countryDistribution.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  {isRTL ? "لا توجد شحنات مسجلة." : "No destinations found."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {countryDistribution.map((item) => (
                    <div
                      key={item.country}
                      className="p-3 rounded-xl border border-gray-200/80 bg-gray-50/50 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{item.country}</p>
                        <p className="text-[11px] text-gray-500 font-mono" dir="ltr">
                          {item.sales.toLocaleString()} EGP
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono font-bold text-[#C45B2A] bg-orange-50 border-orange-200 text-xs">
                         {isRTL ? "شحنة" : "AWBs"}
                        <span>
                           {item.count}
                        </span>
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
