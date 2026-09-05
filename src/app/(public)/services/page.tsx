"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Plane,
  Ship,
  Truck,
  Warehouse,
  FileCheck,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Clock,
  Globe2,
  Headphones,
  CheckCircle2,
  Package,
  Search,
} from "lucide-react";

export default function ServicesPage() {
  const { t, isRTL } = useLanguage();

  const services = [
    {
      title: t("home.services.expressAirTitle"),
      desc: t("home.services.expressAirDesc"),
      icon: <Plane className="w-5 h-5" />,
      image: "/assets/CardImg1-CdBNo1i7.Jpg",
      highlights: [
        isRTL ? "شحن في أول رحلة متاحة (Next-Flight-Out)" : "Next-Flight-Out priority dispatch",
        isRTL ? "تغطية لأكثر من 220 مطار دولي" : "220+ international airports covered",
        isRTL ? "تتبع حراري وحي للشحنات الحساسة" : "Real-time telemetry & temperature control",
      ],
    },
    {
      title: t("home.services.oceanFreightTitle"),
      desc: t("home.services.oceanFreightDesc"),
      icon: <Ship className="w-5 h-5" />,
      image: "/assets/cardImg2-Dm2V1F7w.Jpg",
      highlights: [
        isRTL ? "حاويات كاملة (FCL) ومجتمعة (LCL)" : "Full (FCL) & consolidated (LCL) containers",
        isRTL ? "تخليص مسبق في الموانئ الرئيسية" : "Pre-clearance in major international ports",
        isRTL ? "حلول تخزين جمركي ومناولة سريعة" : "Bonded warehousing & express handling",
      ],
    },
    {
      title: t("home.services.warehousingTitle"),
      desc: t("home.services.warehousingDesc"),
      icon: <Warehouse className="w-5 h-5" />,
      image: "/assets/cardImg3-DBReHElf.Jpg",
      highlights: [
        isRTL ? "مستودعات مكيفة ومؤمنة بأحدث التقنيات" : "Climate-controlled & high-security hubs",
        isRTL ? "إدارة مخزون ذكية بنظام WMS متكامل" : "Integrated smart WMS inventory platform",
        isRTL ? "تجهيز وتغليف الطلبات خلال ساعات" : "Rapid pick, pack & dispatch turnaround",
      ],
    },
    {
      title: t("home.services.landTransportTitle"),
      desc: t("home.services.landTransportDesc"),
      icon: <Truck className="w-5 h-5" />,
      image: "/assets/bg-home-BYMxMBP3.jpg",
      highlights: [
        isRTL ? "أسطول شاحنات حديث مجهز بنظام GPS" : "Modern GPS-tracked commercial fleet",
        isRTL ? "نقل داخلي ودولي عبر الحدود" : "Cross-border & nationwide linehaul routes",
        isRTL ? "خدمات توصيل الميل الأخير السريع" : "Express last-mile direct delivery",
      ],
    },
    {
      title: t("home.services.customsTitle"),
      desc: t("home.services.customsDesc"),
      icon: <FileCheck className="w-5 h-5" />,
      image: "/assets/Home-pic1-C9kYJzAW.jpg",
      highlights: [
        isRTL ? "تخليص جمركي فوري عبر نافذة وACI" : "Instant clearance via Nafeza & ACI systems",
        isRTL ? "تصنيف تعريفي دقيق لتفادي الغرامات" : "Accurate HS code tariff classification",
        isRTL ? "إعفاءات وتسهيلات للمصنعين والشركات" : "Duty optimization & corporate exemptions",
      ],
    },
    {
      title: t("home.services.ecomTitle"),
      desc: t("home.services.ecomDesc"),
      icon: <ShoppingCart className="w-5 h-5" />,
      image: "/assets/CardImg1-CdBNo1i7.Jpg",
      highlights: [
        isRTL ? "الدفع عند الاستلام (COD) مع تحويل سريع" : "Cash-on-delivery (COD) with fast payouts",
        isRTL ? "إدارة المرتجعات واستبدال الشحنات" : "Seamless returns & exchange management",
        isRTL ? "ربط برمجي مباشر عبر API مع المتاجر" : "Direct eCommerce API store integrations",
      ],
    },
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans">
      {/* 1. Header Banner with 3D Logistics Hero Background */}
      <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#ECE2D5] overflow-hidden">
        {/* 3D Logistics Background Asset */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/xspeed_services_header.jpg')" }}
        />
        {/* Luminous Warm Light Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF8F5]/85 via-[#FAF8F5]/75 to-[#FAF8F5]/95 backdrop-blur-[1px] pointer-events-none" />

        {/* Content Container */}
        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10 min-h-[220px]">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 border border-orange-200/80 px-4 py-1.5 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#C45B2A] animate-pulse" />
            <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
              {t("servicesPage.tag")}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-[-0.03em] leading-[1.15]">
            {t("servicesPage.title")}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            {t("servicesPage.subtitle")}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ship"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Package className="w-4 h-4" />
              <span>{t("home.hero.ctaRequest")}</span>
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-gray-900 border border-gray-200/90 font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-2xs hover:border-[#C45B2A]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-4 h-4 text-[#C45B2A]" />
              <span>{t("home.hero.ctaTrack")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Services Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <div
              key={idx}
              className={`bg-white/95 backdrop-blur-md rounded-[28px] border border-orange-100/90 overflow-hidden shadow-[0_10px_30px_rgba(37,21,22,0.05)] hover:shadow-[0_20px_40px_rgba(196,91,42,0.12)] hover:border-orange-200/90 transition-all duration-300 flex flex-col group ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {/* Image Container */}
              <div className="h-56 w-full bg-gray-100 overflow-hidden relative">
                <img
                  src={s.image}
                  alt={s.title}
                  width={600}
                  height={340}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div
                  className={`absolute top-4 ${
                    isRTL ? "right-4" : "left-4"
                  } w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md text-[#C45B2A] border border-white/60 flex items-center justify-center shadow-md`}
                >
                  {s.icon}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xl font-display font-black text-gray-950 tracking-tight group-hover:text-[#C45B2A] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium">
                    {s.desc}
                  </p>

                  {/* Highlights List */}
                  <div className="pt-2 space-y-2">
                    {s.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href="/ship"
                    className="text-xs font-bold text-[#C45B2A] hover:text-[#A34920] inline-flex items-center gap-2 group/link transition-colors"
                  >
                    <span>{t("servicesPage.requestQuoteBtn")}</span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1 ${
                        isRTL ? "rotate-180 group-hover/link:-translate-x-1" : ""
                      }`}
                    />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Value Pillars Section */}
      <section className="bg-white border-t border-b border-gray-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
              {isRTL ? "لماذا تختار XSPEED؟" : "Why Choose XSPEED?"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-gray-950">
              {isRTL ? "معايير عالمية في كل شحنة" : "World-Class Standards for Every Shipment"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-orange-100/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 text-[#C45B2A] flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-950">
                {isRTL ? "مواعيد تسليم مضمونة" : "Guaranteed Transit Times"}
              </h4>
              <p className="text-xs text-gray-600">
                {isRTL ? "التزام كامل بمواعيد الاستلام والتسليم المحددة" : "Strict adherence to agreed pickup & delivery SLAs"}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-orange-100/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 text-[#C45B2A] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-950">
                {isRTL ? "تأمين وحماية كاملة" : "100% Cargo Protection"}
              </h4>
              <p className="text-xs text-gray-600">
                {isRTL ? "تغطية تأمينية شاملة ومعايير أمان صارمة" : "Comprehensive insurance and rigorous handling protocols"}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-orange-100/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 text-[#C45B2A] flex items-center justify-center mx-auto mb-3">
                <Globe2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-950">
                {isRTL ? "شبكة شحن في 220+ دولة" : "220+ Countries Network"}
              </h4>
              <p className="text-xs text-gray-600">
                {isRTL ? "شراكات استراتيجية مع كبرى خطوط الطيران والملاحة" : "Direct integration with leading global airlines and sea carriers"}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-orange-100/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 text-[#C45B2A] flex items-center justify-center mx-auto mb-3">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-950">
                {isRTL ? "دعم مخصص على مدار 24/7" : "24/7 Dedicated Support"}
              </h4>
              <p className="text-xs text-gray-600">
                {isRTL ? "فريق عمليات ومتابعة متاح دائماً عبر الواتساب والهاتف" : "Live operations desk ready anytime via WhatsApp and phone"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Strip */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto bg-gradient-to-r from-[#1C1415] via-[#2A1D1E] to-[#1C1415] rounded-[32px] p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight">
              {t("home.cta.title")}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              {t("home.cta.subtitle")}
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

