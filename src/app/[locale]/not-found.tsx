"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackageSearch,
  Home,
  Truck,
  BookOpen,
  Headphones,
  ArrowLeft,
  ArrowRight,
  Compass,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const BackArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <main
      className={`min-h-[82vh] flex items-center justify-center px-4 py-12 sm:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50/50 ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl w-full mx-auto space-y-8">
        {/* Main Hero Card */}
        <div className="relative bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xl shadow-gray-200/50 overflow-hidden text-center">
          {/* Subtle Ambient Background Gradients */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-24 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-100/30 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            {/* Visual Anchor Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#C45B2A] text-xs font-bold shadow-xs">
              <Compass className="w-4 h-4 animate-spin-slow text-[#C45B2A]" />
              <span>{t("errors.notFound.badge")}</span>
            </div>

            {/* Display Numeral */}
            <div className="space-y-1">
              <div className="text-6xl sm:text-7xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#251516] via-[#C45B2A] to-[#251516] select-none">
                {t("errors.notFound.code")}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-[#251516]">
                {t("errors.notFound.title")}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {t("errors.notFound.subtitle")}
            </p>

            {/* Action Navigation Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#251516] hover:bg-[#3D2527] active:scale-[0.98] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>{t("errors.notFound.homeBtn")}</span>
              </Link>

              <button
                type="button"
                onClick={() => router.back()}
                className="min-h-[44px] px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <BackArrowIcon className="w-4 h-4" />
                <span>{t("errors.notFound.backPrev")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Helpful Destinations Bento Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              {t("errors.notFound.suggestedRoutes")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Track Shipment */}
            <Link
              href="/track"
              className="group p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-orange-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[110px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#C45B2A] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PackageSearch className="w-4.5 h-4.5" />
                </div>
                <ArrowIcon className="w-4 h-4 text-gray-300 group-hover:text-[#C45B2A] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 group-hover:text-[#C45B2A] transition-colors block">
                  {t("errors.notFound.trackBtn")}
                </span>
                <span className="text-[11px] text-gray-500 line-clamp-1">
                  {isRTL ? "بوابة الربط وتتبع شركات الشحن" : "Carrier tracking bridge & status"}
                </span>
              </div>
            </Link>

            {/* 2. Ship Now */}
            <Link
              href="/ship"
              className="group p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-orange-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[110px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <ArrowIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors block">
                  {t("errors.notFound.shipBtn")}
                </span>
                <span className="text-[11px] text-gray-500 line-clamp-1">
                  {isRTL ? "إنشاء بوليصة شحن فوري" : "Instant booking & door pickup"}
                </span>
              </div>
            </Link>

            {/* 3. Logistics Blog */}
            <Link
              href="/blog"
              className="group p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-orange-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[110px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <ArrowIcon className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors block">
                  {t("errors.notFound.blogBtn")}
                </span>
                <span className="text-[11px] text-gray-500 line-clamp-1">
                  {isRTL ? "دليل الشحن والتخليص الجمركي" : "Logistics & shipping guides"}
                </span>
              </div>
            </Link>

            {/* 4. Support Desk */}
            <Link
              href="/contact"
              className="group p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-orange-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[110px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Headphones className="w-4.5 h-4.5" />
                </div>
                <ArrowIcon className="w-4 h-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition-colors block">
                  {t("errors.notFound.contactBtn")}
                </span>
                <span className="text-[11px] text-gray-500 line-clamp-1">
                  {isRTL ? "دعم ومساعدة العمليات 24/7" : "24/7 Operations dispatch desk"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
