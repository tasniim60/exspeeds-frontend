"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  BarChart3,
  Package,
  FileSpreadsheet,
  FileCode,
  ArrowRight,
  PlusCircle,
  X,
  Calculator,
  ExternalLink,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";
import { Shipment, Order, Customer, Invoice } from "@/lib/adminData";
import { useLanguage } from "@/context/LanguageContext";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTab: (tab: AdminTab) => void;
  onQuickAction: (action: "new-shipment" | "new-order" | "new-customer" | "new-invoice" | "new-post") => void;
  shipments: Shipment[];
  orders?: Order[];
  customers?: Customer[];
  invoices?: Invoice[];
  onSelectAwb: (awb: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onSelectTab,
  shipments,
  onSelectAwb,
}) => {
  const [search, setSearch] = useState("");
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const query = search.toLowerCase().trim();

  // Active Dashboard Sections only
  const navigationItems: {
    id: AdminTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    keywords: string[];
  }[] = [
    {
      id: "statistics",
      label: t("admin.sidebar.statistics") || (isRTL ? "الإحصائيات والمؤشرات" : "Statistics & KPIs"),
      description: isRTL ? "مؤشرات الأداء اللوجستي والتحليلات العامة" : "KPIs & Operations Analytics",
      icon: BarChart3,
      keywords: ["statistics", "kpi", "analytics", "احصائيات", "مؤشرات", "تحليلات", "ارقام"],
    },
    {
      id: "requests",
      label: t("admin.sidebar.requests") || (isRTL ? "طلبات الشحن" : "Shipment Requests"),
      description: isRTL ? "طلبات وعروض أسعار الشحن الواردة من العملاء" : "Incoming Shipment Requests & Quotes",
      icon: Package,
      keywords: ["requests", "quote", "pricing", "طلبات", "تسعير", "اسعار", "عروض", "حجز"],
    },
    {
      id: "shipments",
      label: t("admin.sidebar.shipments") || (isRTL ? "سجل الشحنات والقيد" : "Shipment Records"),
      description: isRTL ? "سجل البوالص والقيد ومتابعة مسار الشحنات" : "Live AWB Ledger & Tracking",
      icon: Package,
      keywords: ["shipments", "awb", "tracking", "شحنات", "بوليصة", "بوالص", "تتبع", "قيد"],
    },
    {
      id: "reports",
      label: t("admin.sidebar.reports") || (isRTL ? "التقارير والأرباح" : "Reports & P&L"),
      description: isRTL ? "كشوف الحسابات، الأرباح، وسجلات الفواتير" : "Financial Reports, Invoices & P&L",
      icon: FileSpreadsheet,
      keywords: ["reports", "invoices", "profit", "تقارير", "فواتير", "ارباح", "كشف", "مالية"],
    },
    {
      id: "posts",
      label: t("admin.sidebar.posts") || (isRTL ? "المدونة والـ SEO" : "Blog Posts & SEO"),
      description: isRTL ? "المقالات المنشورة ومؤشرات Rank Math SEO" : "Blog Content & Rank Math SEO",
      icon: FileCode,
      keywords: ["posts", "blog", "seo", "مقالات", "مدونة", "سيو", "نشر"],
    },
  ];

  const filteredNavItems = query
    ? navigationItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.keywords.some((k) => k.includes(query) || query.includes(k))
      )
    : navigationItems;

  const filteredShipments = shipments
    .filter(
      (s) =>
        s.awb.toLowerCase().includes(query) ||
        (s.receiverName && s.receiverName.toLowerCase().includes(query)) ||
        (s.company && s.company.toLowerCase().includes(query)) ||
        (s.country && s.country.toLowerCase().includes(query)) ||
        (s.status && s.status.toLowerCase().includes(query))
    )
    .slice(0, 5);

  const showScriptTool =
    !query ||
    "حاسبة".includes(query) ||
    "اسكريبت".includes(query) ||
    "script".includes(query) ||
    "calc".includes(query) ||
    "google".includes(query) ||
    "أسعار".includes(query) ||
    "rates".includes(query) ||
    query.includes("حاسب") ||
    query.includes("اسكريب") ||
    query.includes("سعر");

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    onOpenChange(false);
    setSearch("");
  };

  const handleAwbClick = (awb: string) => {
    onSelectTab("shipments");
    onSelectAwb(awb);
    onOpenChange(false);
    setSearch("");
  };

  const hasAnyResults = filteredNavItems.length > 0 || filteredShipments.length > 0 || showScriptTool;

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-3 sm:p-4 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Command Box */}
      <div className="relative z-50 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden animate-fade-up">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-gray-200 bg-gray-50/70">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث عن بوليصة، قسم، عميل، أو أداة..." : "Search AWB, section, customer, or tool..."}
            className="w-full py-3.5 sm:py-4 px-3 text-sm sm:text-base text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-400 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className={`hidden sm:inline-block font-mono text-[11px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md ${isRTL ? "mr-2" : "ml-2"}`}>
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[65vh] overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Smart Tool: Google Apps Script Calculator */}
          {showScriptTool && (
            <div>
              <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700/80">
                {isRTL ? "الأدوات الذكية المباشرة" : "Live Smart Tools"}
              </div>
              <div className="mt-1">
                <a
                  href="https://script.google.com/macros/s/AKfycbzLxqTg5aNeqvep_ExG-EuxL-gVOVdELZb9sa5KpvmhrbwOt9OJ_XuwC2_s8N0qQvLX/exec"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-500/15 via-[#C45B2A]/10 to-amber-500/10 hover:from-amber-500/25 hover:to-[#C45B2A]/20 border border-amber-400/40 hover:border-amber-500/60 shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500 text-white shadow-2xs group-hover:scale-105 transition-transform">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {t("admin.sidebar.googleScript") || (isRTL ? "حاسبة الشحنات (الاسكريبت)" : "Rates Calculator (Script)")}
                      </p>
                      <p className="text-[11px] text-gray-600 font-normal">
                        {isRTL ? "فتح تطبيق Google Apps Script لحساب أسعار الشحن المعتمدة" : "Open Google Apps Script to compute shipping rates"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-800 text-[11px] font-bold group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <span>{isRTL ? "فتح التطبيق" : "Open"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* Quick Actions (Shown when no search term) */}
          {!query && (
            <div>
              <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                {t("admin.topbar.quickCreate") || (isRTL ? "الإجراءات والإنشاء السريع" : "Quick Actions")}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    onSelectTab("shipments");
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-[#C45B2A]/10 hover:text-[#C45B2A] border border-gray-200/80 hover:border-[#C45B2A]/30 transition-all cursor-pointer text-start"
                >
                  <PlusCircle className="h-4 w-4 text-[#C45B2A] shrink-0" />
                  <span>{isRTL ? "تسجيل بوليصة جديدة (AWB)" : "Book New Shipment (AWB)"}</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab("requests");
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-amber-50 hover:text-amber-800 border border-gray-200/80 hover:border-amber-300 transition-all cursor-pointer text-start"
                >
                  <Package className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>{isRTL ? "مراجعة طلبات الشحن والتسعير" : "Review Shipment Requests"}</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab("reports");
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200/80 hover:border-emerald-300 transition-all cursor-pointer text-start"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isRTL ? "التقارير المالية والفواتير" : "Financial Reports & Invoices"}</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab("posts");
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-800 border border-gray-200/80 hover:border-blue-300 transition-all cursor-pointer text-start"
                >
                  <FileCode className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{isRTL ? "إدارة مقالات المدونة والـ SEO" : "Manage Blog & SEO"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Shortcuts */}
          {filteredNavItems.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                {isRTL ? "أقسام لوحة التحكم" : "Dashboard Sections"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100/90 border border-transparent hover:border-gray-200 transition-all cursor-pointer group text-start"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-[#C45B2A]/10 text-gray-500 group-hover:text-[#C45B2A] transition-colors shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-gray-900 truncate">{item.label}</p>
                          <p className="text-[11px] text-gray-500 font-normal truncate">{item.description}</p>
                        </div>
                      </div>
                      <ArrowRight className={`h-3.5 w-3.5 text-gray-400 group-hover:text-[#C45B2A] shrink-0 transition-transform ${isRTL ? "rotate-180" : ""}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Search Results: Shipments */}
          {query && filteredShipments.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                {t("admin.sidebar.shipments") || (isRTL ? "سجل الشحنات" : "Shipments")} ({filteredShipments.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredShipments.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleAwbClick(s.awb)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-orange-50 text-[#C45B2A] shrink-0">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-mono font-bold text-gray-900">{s.awb}</p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {s.receiverName || s.company} {s.country ? `• ${s.country}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded-full bg-orange-50 text-[#C45B2A] border border-orange-200/50">
                        {s.status}
                      </span>
                      <ArrowRight className={`h-3.5 w-3.5 text-gray-400 ${isRTL ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {query && !hasAnyResults && (
            <div className="py-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-sm text-gray-700">
                {isRTL ? "لا توجد نتائج مطابقة لبحثك" : "No matching results found"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isRTL ? "جرب البحث برقم البوليصة، اسم القسم، أو أداة معينة" : "Try searching by AWB #, section name, or a tool"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
