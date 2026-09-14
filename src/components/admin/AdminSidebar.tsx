"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Package,
  FileSpreadsheet,
  FileText,
  FileCode,
  ChevronLeft,
  ChevronRight,
  User,
  ExternalLink,
  LogOut,
  Calculator,
  Receipt,
  Users,
  Truck,
  Landmark,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export type AdminTab =
  | "statistics"
  | "requests"
  | "shipments"
  | "invoices"
  | "customers"
  | "carriers"
  | "treasury"
  | "expenses"
  | "reports"
  | "posts";

export interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  badgeCounts: {
    requests?: number;
    shipments?: number;
    invoices?: number;
    orders?: number;
    notifications?: number;
    exceptions?: number;
  };
  selectedHub?: string;
  setSelectedHub?: (hub: string) => void;
}

interface NavItemConfig {
  id: AdminTab;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeVariant?: "brand" | "warning" | "destructive" | "secondary" | "success";
  group: "operations" | "finance" | "analytics";
  fallbackEn: string;
  fallbackAr: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  badgeCounts,
}) => {
  const { t, isRTL, getLocalizedPath } = useLanguage();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = getLocalizedPath("/login");
    }
  };

  const navItems: NavItemConfig[] = [
    {
      id: "statistics",
      icon: BarChart3,
      group: "operations",
      fallbackEn: "Statistics & KPIs",
      fallbackAr: "الإحصائيات والمؤشرات",
    },
    {
      id: "requests",
      icon: FileText,
      badge: badgeCounts.requests,
      badgeVariant: "brand",
      group: "operations",
      fallbackEn: "Shipment Requests",
      fallbackAr: "طلبات الشحن",
    },
    {
      id: "shipments",
      icon: Package,
      badge: badgeCounts.shipments,
      badgeVariant: "brand",
      group: "operations",
      fallbackEn: "Shipment Records",
      fallbackAr: "سجل الشحنات والقيد",
    },
    {
      id: "invoices",
      icon: Receipt,
      badge: badgeCounts.invoices,
      badgeVariant: "warning",
      group: "finance",
      fallbackEn: "Invoices & Billing",
      fallbackAr: "الفواتير والمطالبات",
    },
    {
      id: "customers",
      icon: Users,
      group: "finance",
      fallbackEn: "Customers & Accounts",
      fallbackAr: "العملاء ومراقبة الحسابات",
    },
    {
      id: "carriers",
      icon: Truck,
      group: "finance",
      fallbackEn: "Carriers & Brokers",
      fallbackAr: "شركات الشحن والوسطاء",
    },
    {
      id: "treasury",
      icon: Landmark,
      group: "finance",
      fallbackEn: "Treasury & Vaults",
      fallbackAr: "الخزينة ومراقبة السيولة",
    },
    {
      id: "expenses",
      icon: WalletCards,
      group: "finance",
      fallbackEn: "Expenses & Salaries",
      fallbackAr: "المصروفات والمرتبات",
    },
    {
      id: "reports",
      icon: FileSpreadsheet,
      group: "analytics",
      fallbackEn: "Reports & P&L",
      fallbackAr: "التقارير والأرباح",
    },
    {
      id: "posts",
      icon: FileCode,
      group: "analytics",
      fallbackEn: "Blog Posts & SEO",
      fallbackAr: "المدونة والـ SEO",
    },
  ];

  const operationsItems = navItems.filter((item) => item.group === "operations");
  const financeItems = navItems.filter((item) => item.group === "finance");
  const analyticsItems = navItems.filter((item) => item.group === "analytics");

  const renderNavButton = (item: NavItemConfig) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const itemLabel =
      t(`admin.sidebar.${item.id}`) || (isRTL ? item.fallbackAr : item.fallbackEn);

    return (
      <Button
        key={item.id}
        type="button"
        variant={isActive ? "sidebarActive" : "sidebar"}
        onClick={() => setActiveTab(item.id)}
        title={collapsed ? itemLabel : undefined}
        className={`w-full group relative transition-all duration-150 ${
          collapsed
            ? "h-11 w-11 mx-auto justify-center rounded-xl p-0"
            : `h-10 px-3.5 rounded-xl justify-start ${isRTL ? "text-right" : "text-left"}`
        } ${
          isActive
            ? "bg-[#C45B2A] text-white font-bold shadow-md shadow-[#C45B2A]/20 hover:bg-[#B34F22]"
            : "text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800"
        }`}
      >
        <Icon
          className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
            isActive ? "text-white" : "text-slate-400 group-hover:text-white"
          }`}
        />

        {!collapsed && (
          <span className="truncate flex-1 text-xs tracking-tight">
            {itemLabel}
          </span>
        )}

        {/* Unread / Counter Badge */}
        {!collapsed && item.badge !== undefined && item.badge > 0 && (
          <Badge
            variant="default"
            size="sm"
            className={`${isRTL ? "mr-auto" : "ml-auto"} font-mono text-[10px] ${
              isActive
                ? "bg-white text-[#e66123] font-extrabold shadow-xs"
                : "bg-slate-800 text-slate-200 border border-slate-700/80 font-bold"
            }`}
          >
            {item.badge}
          </Badge>
        )}

        {/* Collapsed notification dot */}
        {collapsed && item.badge !== undefined && item.badge > 0 && (
          <span
            className={`absolute top-1.5 ${
              isRTL ? "left-1.5" : "right-1.5"
            } w-2 h-2 rounded-full bg-[#C45B2A] ring-2 ring-[#0F172A] animate-pulse`}
          />
        )}
      </Button>
    );
  };

  return (
    <aside
      className={`fixed top-0 z-40 h-screen bg-[#0F172A] text-slate-200 border-slate-800 ${
        isRTL ? "right-0 border-l" : "left-0 border-r"
      } transition-all duration-300 flex flex-col justify-between select-none shadow-xl shadow-black/25 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Section: Header + Scrollable Navigation */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Brand Header */}
        <div className="relative h-16 px-3.5 border-b border-slate-800 flex items-center justify-center shrink-0">
          <div
            onClick={() => setCollapsed(!collapsed)}
            className={`py-0.5 overflow-hidden group cursor-pointer flex items-center justify-center w-full
            `}
            title={
              collapsed
                ? t("admin.sidebar.expand") || (isRTL ? "توسيع القائمة" : "Expand Sidebar")
                : t("admin.sidebar.collapse") || (isRTL ? "طي القائمة" : "Collapse Sidebar")
            }
          >
            <img
              src="/assets/xspeed_logo_earth_dark.jpg"
              alt="XSPEED Express"
              className={`$${
                collapsed ? "h-10 max-w-[56px]" : "h-10 max-w-[150px]"
              } shrink-0 w-auto object-contain rounded-md transition-all duration-200 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]`}
            />
          </div>

          {/* Explicit collapse/expand button */}
          {!collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title={t("admin.sidebar.collapse") || (isRTL ? "طي القائمة" : "Collapse Sidebar")}
              aria-label="Collapse Sidebar"
            >
              {isRTL ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className={`absolute ${
                isRTL ? "-left-3" : "-right-3"
              } top-5 z-50 p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all shadow-md cursor-pointer`}
              title={t("admin.sidebar.expand") || (isRTL ? "توسيع القائمة" : "Expand Sidebar")}
              aria-label="Expand Sidebar"
            >
              {isRTL ? (
                <ChevronLeft className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 min-h-0 p-2 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {/* Group 1: Logistics Operations */}
          <div className="space-y-1">
            {!collapsed && (
              <div
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {isRTL ? "إدارة العمليات" : "Operations"}
              </div>
            )}
            {operationsItems.map(renderNavButton)}
          </div>

          {/* Group 2: Analytics & Content */}
          {/* Group 2: Financial & Ledgers */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            {!collapsed && (
              <div
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {isRTL ? "الإدارة المالية والدفاتر" : "Financial & Ledgers"}
              </div>
            )}
            {financeItems.map(renderNavButton)}
          </div>

          {/* Group 3: Analytics & Content */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            {!collapsed && (
              <div
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {isRTL ? "التقارير والمحتوى" : "Analytics & SEO"}
              </div>
            )}
            {analyticsItems.map(renderNavButton)}
          </div>

          {/* Smart Tools / Google Apps Script */}
          <div className="pt-2 border-t border-slate-800/80">
            {!collapsed && (
              <div
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("admin.sidebar.smartTools") ||
                  (isRTL ? "الأدوات الذكية والعمليات" : "Smart Tools")}
              </div>
            )}
            <a
              href="https://script.google.com/macros/s/AKfycbzLxqTg5aNeqvep_ExG-EuxL-gVOVdELZb9sa5KpvmhrbwOt9OJ_XuwC2_s8N0qQvLX/exec"
              target="_blank"
              rel="noopener noreferrer"
              title={
                t("admin.sidebar.googleScriptTooltip") ||
                (isRTL
                  ? "فتح حاسبة الشحنات والتسعير عبر Google Apps Script"
                  : "Open Rates Calculator via Google Apps Script")
              }
              className={`w-full flex items-center transition-all duration-150 group rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/90 hover:border-amber-500/40 text-slate-300 hover:text-white ${
                collapsed
                  ? "h-11 w-11 mx-auto justify-center relative p-0"
                  : "p-2.5 gap-3"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-amber-950 transition-all shrink-0">
                <Calculator className="h-4 w-4 transition-transform group-hover:scale-110" />
              </div>
              {!collapsed && (
                <>
                  <div
                    className={`flex flex-col min-w-0 flex-1 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <span className="truncate text-xs font-bold text-slate-200 group-hover:text-white">
                      {t("admin.sidebar.googleScript") ||
                        (isRTL ? "حاسبة الشحنات (الاسكريبت)" : "Rates Calculator (Script)")}
                    </span>
                    <span className="truncate text-[10px] text-amber-400/90 font-medium">
                      {t("admin.sidebar.googleScriptSub") ||
                        (isRTL ? "تطبيق Google Script للأسعار" : "Google Apps Script Engine")}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
                </>
              )}
              {collapsed && (
                <span
                  className={`absolute top-1.5 ${
                    isRTL ? "left-1.5" : "right-1.5"
                  } w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0F172A]`}
                />
              )}
            </a>
          </div>
        </div>
      </div>

      {/* Lower Navigation Items & System Status */}
      <div className="border-t border-slate-800 bg-[#0B1120] p-2.5 space-y-1 shrink-0">
        {/* Profile & Settings */}
        <Link
          href={getLocalizedPath("/profile")}
          title={
            collapsed
              ? t("admin.topbar.myProfile") ||
                (isRTL ? "الملف الشخصي والإعدادات" : "Profile & Settings")
              : undefined
          }
          className={`w-full flex items-center transition-colors group rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white ${
            collapsed
              ? "h-10 w-10 mx-auto justify-center p-0"
              : `h-9 px-3 gap-3 ${isRTL ? "text-right" : "text-left"}`
          }`}
        >
          <User className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#C45B2A] transition-colors" />
          {!collapsed && (
            <span className="truncate text-xs font-medium">
              {t("admin.topbar.myProfile") ||
                (isRTL ? "الملف الشخصي والإعدادات" : "Profile & Settings")}
            </span>
          )}
        </Link>

        {/* View Public Site */}
        <a
          href={getLocalizedPath("/")}
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? t("admin.topbar.viewPublicSite") || "View Public Site" : undefined}
          className={`w-full flex items-center transition-colors group rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white ${
            collapsed
              ? "h-10 w-10 mx-auto justify-center p-0"
              : `h-9 px-3 gap-3 ${isRTL ? "text-right" : "text-left"}`
          }`}
        >
          <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#C45B2A] transition-colors" />
          {!collapsed && (
            <span className="truncate text-xs font-medium">
              {t("admin.topbar.viewPublicSite") ||
                (isRTL ? "عرض الموقع العام" : "View Public Site")}
            </span>
          )}
        </a>

        {/* Sign Out */}
        <Button
          type="button"
          variant="sidebarDanger"
          onClick={handleLogout}
          title={collapsed ? t("nav.signOut") || "Sign Out" : undefined}
          className={`w-full group transition-colors rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 ${
            collapsed
              ? "h-10 w-10 mx-auto justify-center p-0"
              : `h-9 px-3 gap-3 justify-start ${isRTL ? "text-right" : "text-left"}`
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          {!collapsed && (
            <span className="truncate text-xs font-medium">
              {t("nav.signOut") || (isRTL ? "تسجيل الخروج" : "Sign Out")}
            </span>
          )}
        </Button>

        
      </div>
    </aside>
  );
};
