"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Package,
  History,
  Users,
  FileSpreadsheet,
  FileText,
  FileCode,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  ExternalLink,
  LogOut,
  Calculator,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

export type AdminTab =
  | "statistics"
  | "requests"
  | "shipments"
  | "reports"
  | "posts";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  badgeCounts: {
    requests?: number;
    shipments?: number;
    orders?: number;
    notifications?: number;
    exceptions?: number;
  };
  selectedHub?: string;
  setSelectedHub?: (hub: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  badgeCounts,
}) => {
  const { t, isRTL } = useLanguage();

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("xspeed_user");
        document.cookie = "xspeed_session=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "xspeed_user=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "xspeed_admin_auth=; path=/; max-age=0; SameSite=Lax";
      }
    } catch {}
    window.location.href = "/login";
  };

  const navItems: {
    id: AdminTab;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeVariant?: "brand" | "warning" | "destructive" | "secondary" | "success";
    group: "analytics" | "operations" | "financial" | "content";
  }[] = [
    {
      id: "statistics",
      icon: BarChart3,
      group: "analytics",
    },
    {
      id: "requests",
      icon: FileText,
      badge: badgeCounts.requests,
      badgeVariant: "brand",
      group: "operations",
    },
    {
      id: "shipments",
      icon: Package,
      badge: badgeCounts.shipments,
      badgeVariant: "brand",
      group: "operations",
    },
    {
      id: "reports",
      icon: FileSpreadsheet,
      group: "financial",
    },
    {
      id: "posts",
      icon: FileCode,
      group: "content",
    },
  ];

  return (
    <aside
      className={`fixed top-0 z-40 h-screen bg-[#1E1112] text-gray-200 ${
        isRTL ? "right-0 border-l" : "left-0 border-r"
      } border-[#382122] transition-all duration-300 flex flex-col justify-between select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="min-h-[92px] sm:min-h-[98px] px-4 py-3 border-b border-[#382122] flex items-center justify-center text-center">
          <div
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full overflow-hidden group cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <img
              src="/assets/xspeed_logo_earth_dark.jpg"
              alt="XSPEED Express"
              className={`${
                collapsed
                  ? "h-11 max-w-[56px]"
                  : "h-20 sm:h-[84px] max-w-[210px]"
              } w-auto object-contain rounded-md transition-all duration-200 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}
            />
          </div>
        </div>

        {/* Navigation items */}
        <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const itemLabel = t(`admin.sidebar.${item.id}`);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? itemLabel : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer group relative ${
                  isActive
                    ? "bg-[#C45B2A] text-white shadow-md font-extrabold"
                    : "text-gray-300 hover:bg-white/[0.07] hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-gray-400 group-hover:text-[#C45B2A]"
                  }`}
                />
                {!collapsed && (
                  <span className={`truncate flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    {itemLabel}
                  </span>
                )}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    variant={item.badgeVariant || "brand"}
                    size="sm"
                    className={`${isRTL ? "mr-auto" : "ml-auto"} font-mono text-[10px] ${
                      isActive ? "bg-white text-[#C45B2A]" : ""
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`absolute top-1.5 ${
                      isRTL ? "left-1.5" : "right-1.5"
                    } w-2 h-2 rounded-full bg-[#C45B2A] ring-2 ring-[#1E1112]`}
                  />
                )}
              </button>
            );
          })}

          {/* Smart Tools / Google Apps Script */}
          <div className="pt-2.5 mt-2 border-t border-[#382122]/70">
            {!collapsed && (
              <div className={`px-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400/90 ${isRTL ? "text-right" : "text-left"}`}>
                {t("admin.sidebar.smartTools") || (isRTL ? "الأدوات الذكية والعمليات" : "Smart Tools")}
              </div>
            )}
            <a
              href="https://script.google.com/macros/s/AKfycbzLxqTg5aNeqvep_ExG-EuxL-gVOVdELZb9sa5KpvmhrbwOt9OJ_XuwC2_s8N0qQvLX/exec"
              target="_blank"
              rel="noopener noreferrer"
              title={collapsed ? (t("admin.sidebar.googleScriptTooltip") || (isRTL ? "حاسبة الشحنات (الاسكريبت)" : "Rates Calculator Script")) : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer group relative text-amber-300 hover:text-white bg-gradient-to-r from-amber-500/10 via-[#C45B2A]/10 to-amber-500/5 hover:from-amber-500/20 hover:to-[#C45B2A]/20 border border-amber-500/25 hover:border-amber-500/50 shadow-xs active:scale-[0.98] ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all shrink-0">
                <Calculator className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              </div>
              {!collapsed && (
                <>
                  <div className={`flex flex-col truncate flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <span className="truncate text-gray-100 group-hover:text-white font-extrabold text-xs">
                      {t("admin.sidebar.googleScript") || (isRTL ? "حاسبة الشحنات (الاسكريبت)" : "Rates Calculator (Script)")}
                    </span>
                    <span className="truncate text-[10px] text-amber-400/80 font-normal">
                      {t("admin.sidebar.googleScriptSub") || (isRTL ? "تطبيق Google Script للأسعار" : "Google Apps Script Engine")}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-amber-400/70 group-hover:text-amber-300 transition-colors shrink-0" />
                </>
              )}
              {collapsed && (
                <span
                  className={`absolute top-1.5 ${
                    isRTL ? "left-1.5" : "right-1.5"
                  } w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#1E1112]`}
                />
              )}
            </a>
          </div>
        </div>
      </div>

      {/* Lower Navigation Items (Styled identical to upper tabs) & System Status */}
      <div className="border-t border-[#382122] bg-[#160B0C] p-2 space-y-1">
        {/* 1. Profile & Settings */}
        <Link
          href="/profile"
          title={collapsed ? (isRTL ? "الملف الشخصي والإعدادات" : "Profile & Settings") : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer group relative text-gray-300 hover:bg-white/[0.07] hover:text-white ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <User className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 text-gray-400 group-hover:text-[#C45B2A]" />
          {!collapsed && (
            <span className={`truncate flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              {isRTL ? "الملف الشخصي والإعدادات" : "Profile & Settings"}
            </span>
          )}
        </Link>

        {/* 2. View Public Site */}
        <a
          href="/"
          target="_blank"
          title={collapsed ? t("admin.topbar.viewPublicSite") : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer group relative text-gray-300 hover:bg-white/[0.07] hover:text-white ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <ExternalLink className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 text-gray-400 group-hover:text-[#C45B2A]" />
          {!collapsed && (
            <span className={`truncate flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              {t("admin.topbar.viewPublicSite")}
            </span>
          )}
        </a>

        {/* 3. Sign Out */}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? t("nav.signOut") : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer group relative text-red-400 hover:bg-red-500/10 hover:text-red-300 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 text-red-400" />
          {!collapsed && (
            <span className={`truncate flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              {t("nav.signOut")}
            </span>
          )}
        </button>

        {/* System Status */}
        <div className="pt-2 mt-1 border-t border-[#382122]/60">
          {!collapsed ? (
            <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t("admin.sidebar.apiLive") || t("admin.sidebar.gatewayStatus")}</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                {t("admin.sidebar.liveStatus")}
              </span>
            </div>
          ) : (
            <div className="flex justify-center" title={t("admin.sidebar.apiLive") || t("admin.sidebar.gatewayStatus")}>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
