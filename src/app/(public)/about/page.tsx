"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Globe,
  ShieldCheck,
  Clock,
  Award,
  CheckCircle2,
  Zap,
  Eye,
  Cpu,
  HeartHandshake,
  Package,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function AboutPage() {
  const { t, isRTL } = useLanguage();

  const coreValues = [
    {
      title: t("about.values.speed"),
      desc: t("about.values.speedDesc"),
      icon: <Zap className="w-6 h-6 text-[#C45B2A]" />,
      badge: isRTL ? "السرعة والأداء" : "Speed & Agility",
    },
    {
      title: t("about.values.integrity"),
      desc: t("about.values.integrityDesc"),
      icon: <Eye className="w-6 h-6 text-[#C45B2A]" />,
      badge: isRTL ? "الشفافية الكاملة" : "Radical Transparency",
    },
    {
      title: t("about.values.innovation"),
      desc: t("about.values.innovationDesc"),
      icon: <Cpu className="w-6 h-6 text-[#C45B2A]" />,
      badge: isRTL ? "الابتكار والتقنية" : "Tech-Driven Logistics",
    },
    {
      title: t("about.values.customer"),
      desc: t("about.values.customerDesc"),
      icon: <HeartHandshake className="w-6 h-6 text-[#C45B2A]" />,
      badge: isRTL ? "خدمة متميزة" : "24/7 Care",
    },
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans">
      {/* 1. Header Banner with 3D Logistics Hero Background */}
      <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#ECE2D5] overflow-hidden">
        {/* 3D Logistics Background Asset */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/xspeed_about_header.jpg')" }}
        />
        {/* Luminous Warm Light Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF8F5]/85 via-[#FAF8F5]/75 to-[#FAF8F5]/95 backdrop-blur-[1px] pointer-events-none" />

        {/* Content Container */}
        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 border border-orange-200/80 px-4 py-1.5 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#C45B2A] animate-pulse" />
            <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
              {t("about.tag")}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-[-0.03em] leading-[1.15]">
            {t("about.title")}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            {t("about.subtitle")}
          </p>

          {/* Key Stat Highlights Pill Row */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-gray-800">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-orange-100 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>15+ {isRTL ? "سنوات خبرة" : "Years Experience"}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-orange-100 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C45B2A]" />
              <span>220+ {isRTL ? "دولة ووجهة" : "Countries Covered"}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-orange-100 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>2.5M+ {isRTL ? "طرد تم تسليمه" : "Consignments Delivered"}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-orange-100 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>99.4% {isRTL ? "نسبة الالتزام بالمواعيد" : "On-Time SLA"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mission & Vision Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Story & Mission Cards */}
        <div className={`lg:col-span-6 space-y-8 ${isRTL ? "text-right" : "text-left"}`}>
          {/* Mission Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-7 sm:p-8 border border-orange-100/90 shadow-[0_10px_30px_rgba(37,21,22,0.04)] space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C45B2A] uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>{isRTL ? "هدفنا الأساسي" : "Strategic Purpose"}</span>
            </div>
            <h2 className="text-2xl font-display font-black text-gray-950 tracking-tight">
              {t("about.missionTitle")}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
              {t("about.missionDesc")}
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-7 sm:p-8 border border-orange-100/90 shadow-[0_10px_30px_rgba(37,21,22,0.04)] space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C45B2A] uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>{isRTL ? "رؤيتنا المستقبلية" : "Global Horizon"}</span>
            </div>
            <h2 className="text-2xl font-display font-black text-gray-950 tracking-tight">
              {t("about.visionTitle")}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
              {t("about.visionDesc")}
            </p>
          </div>
        </div>

        {/* Right Column: High-Impact Operations Image with Floating Badges */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-orange-100/90 bg-gray-100 h-[420px] sm:h-[480px]">
            <img
              src="/assets/xspeed_about_showcase.jpg"
              alt="XSPEED Express Logistics Operations"
              width={640}
              height={480}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1415]/70 via-transparent to-transparent" />

            {/* Bottom Floating Stats Box */}
            <div className="absolute bottom-6 inset-x-6 bg-white/95 backdrop-blur-xl rounded-2xl p-5 border border-white/80 shadow-xl grid grid-cols-2 gap-4">
              <div className={`${isRTL ? "border-r-3 pr-4 border-[#C45B2A]" : "border-l-3 pl-4 border-[#C45B2A]"}`}>
                <span className="text-2xl sm:text-3xl font-display font-black text-gray-950 block">220+</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t("home.hero.stats.destinations")}</span>
              </div>
              <div className={`${isRTL ? "border-r-3 pr-4 border-[#C45B2A]" : "border-l-3 pl-4 border-[#C45B2A]"}`}>
                <span className="text-2xl sm:text-3xl font-display font-black text-gray-950 block">99.4%</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t("home.hero.stats.onTimeRate")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Bento Grid */}
      <section className="bg-white border-t border-b border-gray-200/80 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
              {t("about.valuesTitle")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-gray-950 tracking-tight">
              {isRTL ? "القيم التي تقود تميزنا اليومي" : "Principles That Drive Our Execution"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] rounded-[24px] p-6 sm:p-7 border border-orange-100/90 shadow-2xs hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col justify-between space-y-4 text-start"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-orange-200/70 flex items-center justify-center shadow-2xs">
                    {val.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C45B2A] block mb-1">
                      {val.badge}
                    </span>
                    <h3 className="text-lg font-display font-bold text-gray-950">
                      {val.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                    {val.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Stats Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-orange-100 shadow-2xs">
            <span className="text-3xl sm:text-4xl font-display font-black text-[#C45B2A] block mb-1">18</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t("about.stats.globalHubs")}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-orange-100 shadow-2xs">
            <span className="text-3xl sm:text-4xl font-display font-black text-[#C45B2A] block mb-1">2.5M+</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t("about.stats.packagesDelivered")}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-orange-100 shadow-2xs">
            <span className="text-3xl sm:text-4xl font-display font-black text-[#C45B2A] block mb-1">99.4%</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t("about.stats.clientSatisfaction")}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-orange-100 shadow-2xs">
            <span className="text-3xl sm:text-4xl font-display font-black text-[#C45B2A] block mb-1">15+</span>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t("about.stats.yearsExp")}</span>
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto bg-gradient-to-r from-[#1C1415] via-[#2A1D1E] to-[#1C1415] rounded-[32px] p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight">
              {isRTL ? "مستعد لتجربة خدمات الشحن السريع مع XSPEED؟" : "Ready to Experience Premium Logistics with XSPEED?"}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              {isRTL
                ? "ابدأ طلب شحنتك الآن أو تواصل مع مستشارينا لتصميم حلول شحن مخصصة لشركتك."
                : "Create your shipment request in minutes or contact our enterprise team for customized corporate freight rates."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              href="/ship"
              className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95"
            >
              {t("home.cta.requestBtn")}
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              {t("contact.tag")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

