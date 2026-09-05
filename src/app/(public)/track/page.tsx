"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  Truck,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Package,
  Globe2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Plane,
} from "lucide-react";
import {
  CARRIERS,
  trackShipment,
  getWhatsAppSupportUrl,
  cleanAwbNumber,
  getCarrierKey,
} from "@/lib/tracking";

function TrackContent() {
  const { t, isRTL } = useLanguage();
  const searchParams = useSearchParams();
  const initialAwb = searchParams.get("awb") || "";
  const initialCarrierParam = searchParams.get("carrier") || "XSPEED";

  const [selectedCarrier, setSelectedCarrier] = useState<string>(
    getCarrierKey(initialCarrierParam)
  );
  const [trackingNumber, setTrackingNumber] = useState<string>(initialAwb);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Tracking state after submit
  const [redirectedAwb, setRedirectedAwb] = useState<string | null>(null);

  useEffect(() => {
    if (initialAwb) {
      const clean = cleanAwbNumber(initialAwb);
      setTrackingNumber(clean);
      executeTracking(getCarrierKey(initialCarrierParam), clean);
    }
  }, [initialAwb, initialCarrierParam]);

  const executeTracking = (carrierKey: string, rawAwb: string) => {
    const clean = cleanAwbNumber(rawAwb);
    if (!clean) {
      setValidationError(t("track.validationError"));
      return;
    }

    setValidationError(null);

    const carrierObj = CARRIERS.find((c) => c.id === carrierKey) || CARRIERS[0];
    setRedirectedAwb(clean);

    trackShipment(carrierKey, clean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTracking(selectedCarrier, trackingNumber);
  };



  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans">
      {/* 1. Header Banner with 3D Satellite Tracking Hero Background */}
      <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#ECE2D5] overflow-hidden">
        {/* 3D Satellite Background Asset */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/xspeed_track_header.jpg')" }}
        />
        {/* Luminous Warm Light Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF8F5]/85 via-[#FAF8F5]/75 to-[#FAF8F5]/95 backdrop-blur-[1px] pointer-events-none" />

        {/* Content Container */}
        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 border border-orange-200/80 px-4 py-1.5 rounded-full shadow-2xs">
            <Globe2 className="w-3.5 h-3.5 text-[#C45B2A]" />
            <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
              {t("track.tag") || (isRTL ? "التتبع المباشر لجميع الشحنات" : "Real-Time Cargo & AWB Tracking")}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-[-0.03em] leading-[1.15]">
            {t("track.title") || (isRTL ? "تتبع بوليصة الشحن الخاصة بك" : "Track Your Consignment Live")}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            {t("track.subtitle") ||
              (isRTL
                ? "تأكيد فوري لحالة الشحنات الدولية والمحلية عبر أكثر من 10 شركات عالمية وشبكة XSPEED Express."
                : "Live tracking console for regional and global consignments across XSPEED, DHL, UPS, TNT, FedEx, DB Schenker, Air Cargo, Post/EMS, Container, and B/L.")}
          </p>
        </div>
      </section>

      {/* 2. Main Tracking Console */}
      <section className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-12 lg:py-16 space-y-8">
        {/* Console Box */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-9 border border-orange-100/90 shadow-[0_20px_50px_rgba(37,21,22,0.06)] space-y-6 text-start">
          
          {/* Carrier Selector Pills & Dropdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                {t("track.carrierSelectLabel") || (isRTL ? "اختر شركة الناقل" : "Select Express Carrier")}
              </label>
              <span className="text-[11px] font-bold text-[#C45B2A] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/80">
                {CARRIERS.length} {isRTL ? "شركات شحن متاحة" : "Carriers Supported"}
              </span>
            </div>

            

            {/* Direct Select Dropdown */}
            <div className="pt-1">
              <select
                id="direct-carrier-select"
                aria-label={t("track.carrierSelectLabel") || (isRTL ? "اختر شركة الناقل" : "Select Express Carrier")}
                value={selectedCarrier}
                onChange={(e) => {
                  setSelectedCarrier(e.target.value);
                  setValidationError(null);
                }}
                className={`w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/90 text-gray-900 text-xs font-bold focus:bg-white focus:border-[#C45B2A] outline-none cursor-pointer ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {CARRIERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - {c.category?.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder={
                    t("track.placeholder") ||
                    (isRTL
                      ? "أدخل رقم بوليصة الشحن (AWB)..."
                      : "Enter Air Waybill (AWB)...")
                  }
                  className={`w-full h-14 rounded-2xl ${
                    isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
                  } font-mono bg-gray-50/90 border border-gray-200 focus:bg-white focus:border-[#C45B2A] text-xs sm:text-sm font-bold text-gray-950 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs uppercase`}
                  required
                />
                <Search className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none`} />
              </div>

              <button
                type="submit"
                className="h-14 px-7 sm:px-8 rounded-2xl bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98] whitespace-nowrap min-h-[44px]"
              >
                <span>{t("track.trackBtn") || (isRTL ? "تتبع الآن" : "Track Shipment")}</span>
                <Truck className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

       

        {/* 3. 4-Step Milestone Stepper Preview (1 row of 4 on md: screens) */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 sm:p-8 md:p-9 border border-orange-100/90 shadow-sm space-y-6 text-start">
          <div className="space-y-1">
            <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
              {isRTL ? "مراحل الشحن والتتبع" : "Standard Logistics Lifecycle"}
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-black text-gray-950">
              {isRTL ? "كيف تتم متابعة شحنتك خطوة بخطوة" : "How XSPEED Tracks Consignments Step-by-Step"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-gray-100/90 space-y-2 hover:border-orange-200 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#C45B2A] flex items-center justify-center font-black text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-gray-950">
                {isRTL ? "تم استلام الطرد" : "Consignment Picked Up"}
              </h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {isRTL ? "مسح البار كود وإدخال البيانات بالمنظومة" : "Scanned at origin facility & waybill generated"}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-gray-100/90 space-y-2 hover:border-orange-200 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#C45B2A] flex items-center justify-center font-black text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-gray-950">
                {isRTL ? "في طريق الشحن الجوي/البحري" : "In Global Transit"}
              </h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {isRTL ? "مغادرة المطار أو الميناء إلى بلد الوصول" : "Dispatched on active flight or sea vessel"}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-gray-100/90 space-y-2 hover:border-orange-200 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#C45B2A] flex items-center justify-center font-black text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-gray-950">
                {isRTL ? "التخليص الجمركي" : "Customs Cleared"}
              </h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {isRTL ? "معالجة المستندات والإفراج الجمركي" : "Nafeza & customs inspection finalized"}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-gray-100/90 space-y-2 hover:border-emerald-200 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                4
              </div>
              <h4 className="text-sm font-bold text-gray-950">
                {isRTL ? "جاري التوصيل النهائي" : "Out for Final Delivery"}
              </h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                {isRTL ? "تسليم الشحنة للعميل وتأكيد الاستلام" : "Dispatched to recipient address with POD"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="w-8 h-8 border-4 border-[#C45B2A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}

