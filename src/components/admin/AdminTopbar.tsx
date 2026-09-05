"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminTab } from "./AdminSidebar";
import { NotificationItem } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface AdminTopbarProps {
  activeTab: AdminTab;
  onOpenCommand: () => void;
  onOpenMobileMenu: () => void;
  onQuickAction?: (action: "new-shipment" | "new-order" | "new-customer" | "new-invoice" | "new-post") => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
  onNavigateTab?: (tab: AdminTab | string) => void;
  selectedHub: string;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  activeTab,
  onOpenCommand,
  onOpenMobileMenu,
  onQuickAction,
  notifications,
  onMarkAllNotificationsRead,
  onSelectNotification,
  onNavigateTab,
  selectedHub,
}) => {
  const { t, isRTL } = useLanguage();
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const currentTitle = t(`admin.topbar.tabTitles.${activeTab}.title`) || t("nav.adminDashboard");
  const currentSubtitle = t(`admin.topbar.tabTitles.${activeTab}.subtitle`) || "XSPEED Operations";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200/90 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Mobile Toggle & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className={`flex flex-col min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-base md:text-lg font-bold text-[#251516] tracking-tight leading-tight truncate max-w-[120px] xs:max-w-[170px] sm:max-w-xs md:max-w-md">
              {currentTitle}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("admin.topbar.liveOperations")}
            </span>
          </div>
          <p className="hidden sm:block text-xs text-gray-500 truncate max-w-md">
            {currentSubtitle}
          </p>
        </div>
      </div>

      {/* Language Switcher, Global Search, Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Language Switcher */}
        <LanguageSwitcher variant="topbar" />

        {/* Global Search Bar */}
        <button
          type="button"
          onClick={onOpenCommand}
          className="flex items-center justify-center sm:justify-start gap-2 h-9 px-2.5 sm:px-3 rounded-lg bg-gray-100/90 hover:bg-gray-200/80 border border-gray-200 text-gray-500 text-xs font-medium transition-colors shadow-2xs group cursor-pointer shrink-0"
          aria-label={t("admin.topbar.searchPlaceholder")}
        >
          <Search className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-[#C45B2A]" />
          <span className="hidden sm:inline-block">{t("admin.topbar.searchPlaceholder")}</span>
          <kbd className="hidden md:inline-block font-mono text-[10px] bg-white text-gray-600 px-1.5 py-0.5 rounded border border-gray-300 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="admin-notif-bell-btn"
            type="button"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label={t("admin.topbar.notifications")}
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs.length > 0 && (
              <span className={`absolute top-1.5 ${isRTL ? "left-1.5" : "right-1.5"} flex h-2 w-2`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifDropdownOpen(false)}
              />
              <div className={`absolute ${isRTL ? "left-0 text-right" : "right-0 text-left"} mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-up`}>
                <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{t("admin.topbar.notifications")}</span>
                    {unreadNotifs.length > 0 && (
                      <Badge variant="destructive" size="sm">
                        {unreadNotifs.length}
                      </Badge>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllNotificationsRead}
                      className="text-[11px] font-semibold text-[#C45B2A] hover:underline cursor-pointer"
                    >
                      {t("admin.topbar.markAllRead")}
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onSelectNotification(n);
                        setNotifDropdownOpen(false);
                      }}
                      className={`p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !n.isRead ? "bg-orange-50/30" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.severity === "critical" ? (
                          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </div>
                        ) : n.severity === "warning" ? (
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-900">{n.title}</p>
                          <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-gray-100 text-center bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) {
                        onNavigateTab("notifications");
                      }
                      setNotifDropdownOpen(false);
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-[#C45B2A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>{t("admin.topbar.viewAllAlerts")}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
