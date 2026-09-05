"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Package,
  Clock,
  ShieldCheck,
  Globe2,
  Headphones,
  Scan,
  Send,
  Layers,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
  Plane,
  BarChart2,
  Warehouse,
  Truck,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CARRIERS } from "@/lib/tracking";

export function HomeHeroSection() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [carrier, setCarrier] = useState("DHL");
  const [awb, setAwb] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;
    router.push(`/track?awb=${encodeURIComponent(awb.trim())}&carrier=${encodeURIComponent(carrier)}`);
  };

  return (
    <section className="relative min-h-[calc(100vh-74px)] flex flex-col justify-between overflow-hidden bg-[#FAF8F5] text-[#251516] pt-10 pb-16 lg:pt-14 lg:pb-20">
      {/* Generated 3D Logistics Composition Background Image with RTL mirror inversion */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <img
          src="/assets/xspeed_hero_bg_new.jpg"
          alt="XSPEED Express Logistics World"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={1920}
          height={1080}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isRTL
              ? "scale-x-[-1] object-center lg:object-left"
              : "object-center lg:object-right"
          }`}
        />
        {/* Soft gradient wash mirroring based on text position in RTL/LTR */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/80 via-transparent to-[#FAF8F5]/90 ${
            isRTL
              ? "lg:bg-gradient-to-l lg:from-[#FAF8F5]/95 lg:via-[#FAF8F5]/50 lg:to-transparent"
              : "lg:bg-gradient-to-r lg:from-[#FAF8F5]/95 lg:via-[#FAF8F5]/50 lg:to-transparent"
          } pointer-events-none`}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-grow flex items-start pt-6 sm:pt-10 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start w-full py-6 lg:py-8">
          
          {/* Left/Right Column: Headline, CTAs, and 4 Feature Badges */}
          <div className="lg:col-span-7 flex flex-col space-y-8 text-start">
            
            {/* Main Headline */}
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-display font-black tracking-[-0.035em] leading-[1.1] text-gray-950">
                <span>{t("home.hero.titlePrefix") || (isRTL ? "خدمات لوجستية سريعة" : "Express Logistics")}</span>{" "}
                <br className="hidden sm:inline" />
                <span className="text-[#C45B2A] inline-block mt-1">
                  {t("home.hero.titleHighlight") || (isRTL ? "تواكب سرعة أعمالك" : "at the Speed of Business")}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 font-body max-w-xl leading-relaxed">
                {t("home.hero.subtitle")}
              </p>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link href="/ship">
                <button
                  type="button"
                  className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer"
                >
                  <Package className="w-5 h-5 stroke-[2.2]" />
                  <span>{t("home.hero.requestShipment")}</span>
                </button>
              </Link>

             
            </div>

            {/* 4 Feature Badges in Row matching Reference Image */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t border-orange-950/10 max-w-2xl">
              {/* 1. Fast Delivery */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 text-[#C45B2A] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="text-xs sm:text-sm font-black text-gray-950 leading-tight">
                    {t("home.hero.fastDelivery")}
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold leading-tight mt-0.5">
                    {t("home.hero.fastDeliveryDesc")}
                  </div>
                </div>
              </div>

              {/* 2. Secure & Safe */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 text-[#C45B2A] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="text-xs sm:text-sm font-black text-gray-950 leading-tight">
                    {t("home.hero.secureSafe")}
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold leading-tight mt-0.5">
                    {t("home.hero.secureSafeDesc")}
                  </div>
                </div>
              </div>

              {/* 3. 220+ Countries */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 text-[#C45B2A] flex items-center justify-center shrink-0 mt-0.5">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="text-xs sm:text-sm font-black text-gray-950 leading-tight">
                    {t("home.hero.countriesCoverage")}
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold leading-tight mt-0.5">
                    {t("home.hero.countriesCoverageDesc")}
                  </div>
                </div>
              </div>

              {/* 4. 24/7 Support */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 text-[#C45B2A] flex items-center justify-center shrink-0 mt-0.5">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="text-xs sm:text-sm font-black text-gray-950 leading-tight">
                    {t("home.hero.support247")}
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold leading-tight mt-0.5">
                    {t("home.hero.support247Desc")}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Tracking Console Card */}
          <div className="lg:col-span-5 relative z-10 flex justify-center">
            <div className="bg-white/95 rounded-[36px] p-6 sm:p-8 md:p-9 shadow-[0_25px_60px_rgba(37,21,22,0.12)] border border-orange-100/90 relative backdrop-blur-xl max-w-[420px] w-full space-y-6 min-h-[480px]">
              
              {/* Card Header with Official Website Logo */}
              <div className="text-center space-y-2">
                <div className="h-16 flex items-center justify-center mx-auto max-w-[220px]">
                  <img
                    src="/assets/xspeed_logo_earth_wide.jpg"
                    alt="XSPEED Logo"
                    width={220}
                    height={48}
                    style={{ aspectRatio: "220 / 48" }}
                    className="h-12 w-auto object-contain mix-blend-multiply"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-gray-950">
                  {t("home.hero.trackCard.title")}
                </h2>
                <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                  {t("home.hero.trackCard.subtitle")}
                </p>
              </div>

              {/* Input & Form with Carrier Selector */}
              <form onSubmit={handleTrackSubmit} className="space-y-3">
                {/* Carrier Selector + Tracking Number on a single row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Carrier Selection */}
                  <div className="sm:w-2/5 space-y-1">
                    <select
                      id="carrier-select"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      aria-label={t("home.hero.trackCard.carrierLabel")}
                      className="w-full h-12 px-3.5 rounded-2xl border border-gray-200 bg-gray-50/90 text-gray-950 text-xs font-bold focus:bg-white focus:border-[#C45B2A] focus:ring-2 focus:ring-orange-500/20 outline-none transition-all cursor-pointer shadow-2xs text-start"
                    >
                      {CARRIERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tracking Number Input */}
                  <div className="sm:flex-1 space-y-1">
                    <div className="relative">
                      <input
                        id="tracking-input"
                        type="text"
                        value={awb}
                        onChange={(e) => setAwb(e.target.value)}
                        placeholder={t("home.hero.trackCard.placeholder")}
                        aria-label={t("home.hero.trackCard.placeholder")}
                        className={`w-full h-12 rounded-2xl px-4 ${isRTL ? "text-right" : "text-left"} bg-gray-50/90 border border-gray-200 text-gray-950 font-mono text-xs font-bold focus:bg-white focus:border-[#C45B2A] focus:ring-3 focus:ring-orange-500/20 outline-none transition-all placeholder:text-gray-400 shadow-2xs`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <span>{t("home.hero.trackCard.trackNow")}</span>
                  <Send className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              </form>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {t("home.hero.trackCard.or")}
                </span>
                <div className="border-t border-gray-200 w-full" />
              </div>

              {/* Track Multiple Shipments Button */}
              <Link href="/track" className="block">
                <button
                  type="button"
                  className="w-full h-12 rounded-full bg-gray-50/90 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Layers className="w-4 h-4 text-gray-500" />
                  <span>{t("home.hero.trackCard.trackMultiple")}</span>
                </button>
              </Link>

            </div>
          </div>

        </div>
      </div>

      {/* Floating Bottom Stats Bar matching Reference Image */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 w-full relative z-20 mt-6 lg:mt-10">
        <div className="bg-white/95 rounded-3xl md:rounded-full py-5 px-6 md:px-12 shadow-[0_15px_45px_rgba(37,21,22,0.08)] border border-orange-100/80 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-center backdrop-blur-md">
          {/* 1. 15,000+ Shipments Delivered */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-[#C45B2A] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-start">
              <div className="text-xl sm:text-2xl font-display font-black text-gray-950 tracking-tight leading-none mb-1">
                {t("home.hero.stats.shipmentsDeliveredCount")}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 font-semibold leading-tight">
                {t("home.hero.stats.shipmentsDelivered")}
              </div>
            </div>
          </div>

          {/* 2. 8,500+ Happy Customers */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-[#C45B2A] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-start">
              <div className="text-xl sm:text-2xl font-display font-black text-gray-950 tracking-tight leading-none mb-1">
                {t("home.hero.stats.happyCustomersCount")}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 font-semibold leading-tight">
                {t("home.hero.stats.happyCustomers")}
              </div>
            </div>
          </div>

          {/* 3. 220+ Countries Covered */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-[#C45B2A] flex items-center justify-center shrink-0">
              <Globe2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-start">
              <div className="text-xl sm:text-2xl font-display font-black text-gray-950 tracking-tight leading-none mb-1">
                {t("home.hero.stats.countriesCoveredCount")}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 font-semibold leading-tight">
                {t("home.hero.stats.countriesCovered")}
              </div>
            </div>
          </div>

          {/* 4. 99.4% On-Time Delivery */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-[#C45B2A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-start">
              <div className="text-xl sm:text-2xl font-display font-black text-gray-950 tracking-tight leading-none mb-1">
                {t("home.hero.stats.onTimeDeliveryRate")}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 font-semibold leading-tight">
                {t("home.hero.stats.onTimeDelivery")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



export function HomeAboutSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section className="bg-[#FAF8F5] py-20 border-b border-gray-100 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-start">
          <div className="space-y-3">
            <Badge variant="outline" className="rounded-full bg-orange-50 text-[#C45B2A] border-orange-200 px-3.5 py-1 text-xs font-semibold inline-flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{isRTL ? "ريادة وتميز لوجستي متكامل" : "Established Logistics Excellence"}</span>
            </Badge>

            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-950 tracking-[-0.03em]">
              {t("about.tag")} <span className="text-[#C45B2A]">XSPEED</span>
            </h2>
            <div className="w-20 h-1 bg-[#C45B2A] rounded-full" />
          </div>

          <p className="text-gray-600 text-lg leading-relaxed font-body">
            {t("about.subtitle")}
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#C45B2A] flex items-center justify-center shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h3 className="text-base font-bold text-gray-950 mb-0.5">{t("about.values.speed")}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t("about.values.speedDesc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#C45B2A] flex items-center justify-center shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h3 className="text-base font-bold text-gray-950 mb-0.5">{t("about.values.integrity")}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t("about.values.integrityDesc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#C45B2A] flex items-center justify-center shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h3 className="text-base font-bold text-gray-950 mb-0.5">{t("about.values.innovation")}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t("about.values.innovationDesc")}</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/about">
              <Button variant="outline" className="rounded-full px-6 py-2.5 font-bold border-gray-300 hover:border-[#C45B2A] text-gray-900 flex items-center gap-2 cursor-pointer shadow-2xs">
                <span>{t("common.learnMore")}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative rounded-[32px] overflow-hidden shadow-xl border border-gray-200 bg-white h-[380px] md:h-[440px] w-full group">
          <img
            src="/assets/xspeed_about_showcase.jpg"
            alt="About XSPEED Logistics"
            width={640}
            height={440}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 text-gray-950 text-start shadow-lg">
            <p className="text-xs font-black text-[#C45B2A] uppercase tracking-wider">{isRTL ? "التميز في الشحن الدولي" : "International Excellence"}</p>
            <p className="text-sm font-bold text-gray-800 mt-1">{isRTL ? "شراكات استراتيجية لأكثر من 10 سنوات" : "Over 10 Years of Trusted Global Logistics"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeFeaturesSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section className="bg-white py-20 border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="outline" className="rounded-full bg-orange-50 text-[#C45B2A] border-orange-200 px-3.5 py-1 text-xs font-semibold inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRTL ? "حلول لوجستية فائقة الأداء" : "High-Performance Solutions"}</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-black text-gray-950 tracking-[-0.03em]">
            {t("home.services.tag")}
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            {t("home.services.subtitle")}
          </p>
          <div className="w-24 h-1 mx-auto bg-[#C45B2A] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#FAF8F5] rounded-[28px] border border-gray-200/80 p-8 text-start flex flex-col items-start hover:shadow-xl hover:border-[#C45B2A]/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#C45B2A] border border-orange-200/60 flex items-center justify-center mb-6 shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
              <Plane className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-display font-black text-gray-950 mb-3 tracking-[-0.02em]">
              {t("home.services.expressAirTitle")}
            </h3>
            <p className="text-gray-600 font-body text-sm leading-relaxed">
              {t("home.services.expressAirDesc")}
            </p>
          </div>

          <div className="bg-[#FAF8F5] rounded-[28px] border border-gray-200/80 p-8 text-start flex flex-col items-start hover:shadow-xl hover:border-[#C45B2A]/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#C45B2A] border border-orange-200/60 flex items-center justify-center mb-6 shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
              <BarChart2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-display font-black text-gray-950 mb-3 tracking-[-0.02em]">
              {t("home.services.customsTitle")}
            </h3>
            <p className="text-gray-600 font-body text-sm leading-relaxed">
              {t("home.services.customsDesc")}
            </p>
          </div>

          <div className="bg-[#FAF8F5] rounded-[28px] border border-gray-200/80 p-8 text-start flex flex-col items-start hover:shadow-xl hover:border-[#C45B2A]/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#C45B2A] border border-orange-200/60 flex items-center justify-center mb-6 shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
              <Warehouse className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-display font-black text-gray-950 mb-3 tracking-[-0.02em]">
              {t("home.services.warehousingTitle")}
            </h3>
            <p className="text-gray-600 font-body text-sm leading-relaxed">
              {t("home.services.warehousingDesc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeBlogHeader() {
  const { t } = useLanguage();

  return (
    <div className="text-center space-y-3">
      <h2 className="text-3xl md:text-4xl font-display font-black text-gray-950 tracking-[-0.03em]">
        {t("home.blogSection.title")}
      </h2>
      <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
        {t("home.blogSection.subtitle")}
      </p>
      <div className="w-24 h-1 mx-auto bg-[#C45B2A] rounded-full" />
    </div>
  );
}

