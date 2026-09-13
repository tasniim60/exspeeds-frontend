"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Package,
  Globe2,
  Send,
  Layers,
  ArrowRight,
  CheckCircle2,
  Plane,
  BarChart2,
  Warehouse,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { CARRIERS } from "@/lib/tracking";

export function HomeHeroSection() {
  const router = useRouter();
  const { t, isRTL, getLocalizedPath } = useLanguage();
  const [carrier, setCarrier] = useState("DHL");
  const [awb, setAwb] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;
    router.push(getLocalizedPath(`/track?awb=${encodeURIComponent(awb.trim())}&carrier=${encodeURIComponent(carrier)}`));
  };

  return (
    <section className="relative min-h-[calc(100vh-74px)] flex flex-col justify-between overflow-hidden bg-[#FAFBFC] text-[#0F172A] pt-10 pb-16 lg:pt-14 lg:pb-20">
      {/* Generated 3D Logistics Composition Background Image with RTL mirror inversion */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <Image
          src="/assets/xspeed_hero_bg_new.jpg"
          alt="XSPEED Express Logistics World"
          fill
          priority
          sizes="100vw"
          quality={85}
          className={`object-cover transition-transform duration-700 ${
            isRTL ? "scale-x-[-1]" : ""
          }`}
        />
        {/* Soft Radial Vignette for Content Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFC]/90 via-[#FAFBFC]/70 to-[#FAFBFC]/95 backdrop-blur-[1.5px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 w-full relative z-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Expressive Copy & Highlights */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-start">
            
            {/* Natural Editorial Eyebrow */}
            <SectionEyebrow>
              {t("home.hero.badge")}
            </SectionEyebrow>

            {/* Display Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-[-0.03em] leading-[1.12] text-gray-950">
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
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
              <Link href={getLocalizedPath("/ship")}>
                <button
                  type="button"
                  className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer"
                >
                  <Package className="w-5 h-5 stroke-[2.2]" />
                  <span>{t("home.hero.requestShipment")}</span>
                </button>
              </Link>

             
              <Link href={getLocalizedPath("/services")}>
                <button
                  type="button"
                  className="border-2 border-gray-200 hover:border-[#C45B2A] bg-white/90 hover:bg-white text-gray-800 hover:text-[#C45B2A] font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full transition-all shadow-2xs flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                >
                  <span>{t("home.hero.exploreServices")}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Tracking Console Card */}
          <div className="lg:col-span-5 relative z-10 flex justify-center">
            <div className="bg-white/95 rounded-[36px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(37,21,22,0.12)] border border-orange-100/90 relative backdrop-blur-xl max-w-[420px] w-full space-y-5">
              
              {/* Card Header with Official Website Logo */}
              <div className="text-center space-y-2">
                <div className="h-16 flex items-center justify-center mx-auto max-w-[220px]">
                  <img
                    src="/assets/xspeed_logo_earth_light.jpg"
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

              {/* Bulk Tracking Link */}
              <div className="text-center pt-0.5">
                <Link
                  href={getLocalizedPath("/track")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#C45B2A] transition-colors group cursor-pointer py-1"
                >
                  <Layers className="w-4 h-4 text-gray-500 group-hover:text-[#C45B2A] transition-colors" />
                  <span>{t("home.hero.trackCard.trackMultiple")}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function AnimatedCounter({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2000,
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease out cubic: 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * target;

      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [hasAnimated, target, duration]);

  const formattedNumber = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString("en-US");

  return (
    <span ref={ref} className="inline-block font-numeric">
      {prefix}{formattedNumber}{suffix}
    </span>
  );
}

export function HomeStatsSection() {
  const { t, isRTL } = useLanguage();

  const stats = [
    {
      id: "shipments",
      icon: Package,
      target: 15000,
      decimals: 0,
      suffix: "+",
      label: t("home.hero.stats.shipmentsDelivered"),
      desc: t("home.hero.statsSection.shipmentsDesc"),
      badge: "+24%",
      badgeLabel: isRTL ? "نمو سنوي" : "YoY",
    },
    {
      id: "customers",
      icon: Users,
      target: 8500,
      decimals: 0,
      suffix: "+",
      label: t("home.hero.stats.happyCustomers"),
      desc: t("home.hero.statsSection.customersDesc"),
      badge: "99.8%",
      badgeLabel: isRTL ? "رضا العملاء" : "Satisfaction",
    },
    {
      id: "countries",
      icon: Globe2,
      target: 220,
      decimals: 0,
      suffix: "+",
      label: t("home.hero.stats.countriesCovered"),
      desc: t("home.hero.statsSection.countriesDesc"),
      badge: "220+",
      badgeLabel: isRTL ? "دولة" : "Countries",
    },
    {
      id: "ontime",
      icon: CheckCircle2,
      target: 99.4,
      decimals: 1,
      suffix: "%",
      label: t("home.hero.stats.onTimeDelivery"),
      desc: t("home.hero.statsSection.onTimeDesc"),
      badge: "SLA",
      badgeLabel: isRTL ? "التزام كامل" : "SLA Precision",
    },
  ];

  return (
    <section className="bg-white py-16 lg:py-20 border-b border-[#E2E8F0] relative z-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 lg:mb-14">
          <SectionEyebrow centered>
            {t("home.hero.statsSection.tag")}
          </SectionEyebrow>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-gray-950 tracking-tight leading-tight">
            {t("home.hero.statsSection.title")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {t("home.hero.statsSection.subtitle")}
          </p>
        </div>

        {/* 4 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#F8FAFC] hover:bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.06)] hover:border-[#C45B2A]/40 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/80 text-[#C45B2A] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#C45B2A] group-hover:text-white transition-all duration-300 shadow-2xs">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200/90 px-2.5 py-1 rounded-full shadow-2xs">
                    <span className="text-[#C45B2A] font-extrabold">{item.badge}</span>
                    <span className="text-slate-500 font-medium">{item.badgeLabel}</span>
                  </span>
                </div>

                {/* Metric Number & Text */}
                <div className="text-start">
                  <div className="text-3xl sm:text-4xl lg:text-[40px] font-display font-black text-gray-950 tracking-tight leading-none group-hover:text-[#C45B2A] transition-colors duration-300 mb-2">
                    <AnimatedCounter
                      target={item.target}
                      decimals={item.decimals}
                      suffix={item.suffix}
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    {item.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed mt-2">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Interactive Accent Line */}
                <div className="w-8 h-0.5 bg-orange-200 group-hover:w-full group-hover:bg-[#C45B2A] transition-all duration-500 rounded-full mt-6" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



export function HomeAboutSection() {
  const { t, isRTL, getLocalizedPath } = useLanguage();

  return (
    <section className="bg-[#FAFBFC] py-20 border-b border-[#E2E8F0] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-start">
          <div className="space-y-3">
            <SectionEyebrow>
              {isRTL ? "ريادة وتميز لوجستي متكامل" : "Established Logistics Excellence"}
            </SectionEyebrow>

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
            <Link href={getLocalizedPath("/about")}>
              <Button variant="outline" className="rounded-full px-6 py-2.5 font-bold border-gray-300 hover:border-[#C45B2A] text-gray-900 flex items-center gap-2 cursor-pointer shadow-2xs">
                <span>{t("common.learnMore")}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative rounded-[32px] overflow-hidden shadow-xl border border-gray-200 bg-white h-[380px] md:h-[440px] w-full group">
          <Image
            src="/assets/xspeed_about_showcase.jpg"
            alt="About XSPEED Logistics"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent pointer-events-none" />
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
          <SectionEyebrow centered>
            {isRTL ? "حلول لوجستية فائقة الأداء" : "High-Performance Solutions"}
          </SectionEyebrow>
          <h2 className="text-3xl md:text-4xl font-display font-black text-gray-950 tracking-[-0.03em]">
            {t("home.services.tag")}
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            {t("home.services.subtitle")}
          </p>
          <div className="w-24 h-1 mx-auto bg-[#C45B2A] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#F8FAFC] rounded-[28px] border border-slate-200 p-8 text-start flex flex-col items-start hover:shadow-xl hover:border-[#C45B2A]/40 transition-all duration-300 group">
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

          <div className="bg-[#F8FAFC] rounded-[28px] border border-slate-200 p-8 text-start flex flex-col items-start hover:shadow-xl hover:border-[#C45B2A]/40 transition-all duration-300 group">
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

          <div className="bg-[#F8FAFC] rounded-[28px] border border-slate-200 p-8 text-start flex flex-col items-start hover:shadow-xl hover:border-[#C45B2A]/40 transition-all duration-300 group">
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

