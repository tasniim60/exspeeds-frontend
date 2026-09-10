"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ExternalLink,
  Building,
  ShieldCheck,
  Plane,
  Truck,
  FileCheck,
  Headphones,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Package,
  Globe2,
} from "lucide-react";

export default function ContactPage() {
  const { t, isRTL } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const whatsappUrl =
    isRTL
      ? "https://wa.me/201208027171?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%20XSPEED%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B4%D8%AD%D9%86."
      : "https://wa.me/201208027171?text=Hello%20XSPEED%20Logistics%20Support%2C%20I%20have%20an%20inquiry%20regarding%20shipping%20and%20express%20freight.";

  const departments = [
    {
      title: isRTL ? "مكتب العمليات والتتبع المباشر (24/7)" : "24/7 Operations & Dispatch Desk",
      desc: isRTL
        ? "مخصص لمتابعة الشحنات الحية، الاستعلام عن بوالص الشحن، وحالات الطوارئ."
        : "Dedicated to live consignment tracking, waybill inquiries, and immediate routing support.",
      icon: <Headphones className="w-6 h-6 text-[#C45B2A]" />,
      contact: "+20 120 802 7171",
      email: "sales@exspeeds.com",
      actionText: isRTL ? "محادثة فورية عبر واتساب" : "Chat on WhatsApp",
      actionLink: whatsappUrl,
      isPrimary: true,
      badge: isRTL ? "متواجد 24/7" : "Live 24/7",
    },
    {
      title: isRTL ? "إدارة مبيعات الشركات وحلول الشحن الكبرى" : "Corporate Accounts & Enterprise Sales",
      desc: isRTL
        ? "عقود سنوية بأسعار تفضيلية، حلول سلاسل إمداد متكاملة، ومدير حساب مخصص."
        : "High-volume contracted freight rates, supply chain SLA agreements, and dedicated account management.",
      icon: <Building className="w-6 h-6 text-[#C45B2A]" />,
      contact: "+20 120 802 7171",
      email: "sales@exspeeds.com",
      actionText: isRTL ? "طلب عرض أسعار للشركات" : "Request Corporate Quote",
      actionLink: "/ship",
      isPrimary: false,
      badge: isRTL ? "للشركات والتجار" : "B2B & Enterprise",
    },
    {
      title: isRTL ? "قسم التخليص الجمركي والاستشارات" : "Customs Clearance & Brokerage Desk",
      desc: isRTL
        ? "فريق متخصص في التسجيل المسبق للشحنات (ACI)، نظام نافذة، وتصنيف البنود الجمركية."
        : "Specialized advisory for ACI pre-clearance, Egyptian Nafeza compliance, and HS tariff codes.",
      icon: <FileCheck className="w-6 h-6 text-[#C45B2A]" />,
      contact: "+20 120 802 7171",
      email: "sales@exspeeds.com",
      actionText: isRTL ? "استشارة جمركية سريعة" : "Customs Consultation",
      actionLink: whatsappUrl,
      isPrimary: false,
      badge: isRTL ? "تخليص سريع" : "Port Fast-Track",
    },
    {
      title: isRTL ? "الشحن الجوي والبحري الدولي" : "International Air & Ocean Freight",
      desc: isRTL
        ? "حجز المساحات في أول رحلة طيران متاحة (NFO) وشحن الحاويات الكاملة والمجمعة (FCL/LCL)."
        : "Priority cargo space booking, next-flight-out dispatch, and ocean container coordination.",
      icon: <Plane className="w-6 h-6 text-[#C45B2A]" />,
      contact: "+20 120 802 7171",
      email: "sales@exspeeds.com",
      actionText: isRTL ? "حجز شحن دولي" : "Book International Cargo",
      actionLink: "/ship",
      isPrimary: false,
      badge: isRTL ? "220+ دولة" : "220+ Countries",
    },
  ];

  const faqs = [
    {
      q: isRTL ? "كيف يمكنني تتبع شحنتي فوراً؟" : "How can I track my shipment immediately?",
      a: isRTL
        ? "يمكنك إدخال رقم بوليصة الشحن (AWB) في صفحة التتبع بموقعنا أو إرسال رقم الشحنة مباشرة لفريق الدعم عبر الواتساب لتلقي تقرير حي خلال دقائق."
        : "You can enter your Air Waybill (AWB) number on our tracking page or message our operations team directly on WhatsApp for an instant status update.",
    },
    {
      q: isRTL ? "ما هي المستندات المطلوبة للتخليص الجمركي الدولي؟" : "What documents are required for international customs clearance?",
      a: isRTL
        ? "المستندات الأساسية تشمل الفاتورة التجارية الأصلية، قائمة التعبئة (Packing List)، بوليصة الشحن، ورقم التسجيل المسبق للشحنات ACI في حالة الاستيراد لمصر."
        : "Standard requirements include the Commercial Invoice, Packing List, Bill of Lading / AWB, and the ACI registration number for Egyptian import shipments.",
    },
    {
      q: isRTL ? "ما هي سرعة الاستلام وتوصيل الشحنات العاجلة؟" : "How quickly can XSPEED arrange express pickup?",
      a: isRTL
        ? "نوفر خدمة الاستلام في نفس اليوم (Same-Day Pickup) في القاهرة والجيزة والمناطق الصناعية، وجدولة الشحن على أقرب رحلة طيران مباشرة."
        : "We provide same-day scheduled pickups across Cairo, Giza, and major logistics zones, dispatched on the next available commercial or charter flight.",
    },
    {
      q: isRTL ? "هل تقدمون خدمات الدفع عند الاستلام (COD) للتجارة الإلكترونية؟" : "Do you offer Cash-on-Delivery (COD) for eCommerce?",
      a: isRTL
        ? "نعم، نقدم حلولاً متكاملة تشمل التحصيل النقدي، التأمين الكامل على الشحنات، وتحويل المستحقات دورياً في مواعيد محددة."
        : "Yes, we offer complete COD solutions with fast financial settlement cycles, insurance coverage, and integrated returns management.",
    },
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans">
      {/* 1. Header Banner with 3D Logistics Hero Background */}
      <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#ECE2D5] overflow-hidden">
        {/* 3D Logistics Background Asset */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/xspeed_contact_header.jpg')" }}
        />
        {/* Luminous Warm Light Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF8F5]/85 via-[#FAF8F5]/75 to-[#FAF8F5]/95 backdrop-blur-[1px] pointer-events-none" />

        {/* Content Container */}
        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 border border-orange-200/80 px-4 py-1.5 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
              {t("contact.tag")}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-gray-950 tracking-[-0.03em] leading-[1.15]">
            {t("contact.title")}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            {t("contact.subtitle")}
          </p>

          {/* Live Status Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-orange-100/90 shadow-2xs flex items-center gap-2.5 text-xs font-bold text-gray-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>
                {isRTL
                  ? "مكتب العمليات متواجد الآن • متوسط الرد عبر واتساب: أقل من 3 دقائق"
                  : "Operations Desk Online • Average WhatsApp Response: < 3 mins"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Direct Communication Departments Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
            {isRTL ? "قنوات التواصل المباشرة" : "Direct Logistics Channels"}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-gray-950">
            {isRTL ? "تواصل مباشرة مع القسم المختص" : "Connect Directly With Our Specialized Desks"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {departments.map((dept, idx) => (
            <div
              key={idx}
              className={`bg-white/95 backdrop-blur-md rounded-[32px] p-7 sm:p-8 border ${
                dept.isPrimary
                  ? "border-[#C45B2A]/40 shadow-[0_15px_40px_rgba(196,91,42,0.12)]"
                  : "border-orange-100/90 shadow-[0_10px_30px_rgba(37,21,22,0.04)]"
              } hover:border-[#C45B2A] transition-all duration-300 flex flex-col justify-between space-y-6 text-start`}
            >
              <div className="space-y-4">
                {/* Card Top Row */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-center shadow-2xs">
                    {dept.icon}
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-orange-100/70 text-[#C45B2A]">
                    {dept.badge}
                  </span>
                </div>

                {/* Card Title & Desc */}
                <div>
                  <h3 className="text-xl font-display font-black text-gray-950 tracking-tight">
                    {dept.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1.5 leading-relaxed font-medium">
                    {dept.desc}
                  </p>
                </div>

                {/* Contact Coordinates */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#C45B2A] shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-gray-400 font-bold block leading-none">
                        {isRTL ? "الهاتف والواتساب" : "Direct Phone / WA"}
                      </span>
                      <span className="font-bold text-gray-900 truncate block mt-0.5" dir="ltr">
                        {dept.contact}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#C45B2A] shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-gray-400 font-bold block leading-none">
                        {isRTL ? "البريد الإلكتروني" : "Direct Email"}
                      </span>
                      <span className="font-bold text-gray-900 truncate block mt-0.5">
                        {dept.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <a
                  href={dept.actionLink}
                  target={dept.actionLink.startsWith("http") ? "_blank" : undefined}
                  rel={dept.actionLink.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`w-full py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm ${
                    dept.isPrimary
                      ? "bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white shadow-orange-500/25"
                      : "bg-[#FAF8F5] hover:bg-white text-gray-900 border border-orange-200/80 hover:border-[#C45B2A]"
                  }`}
                >
                  {dept.isPrimary ? <MessageSquare className="w-4 h-4" /> : <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />}
                  <span>{dept.actionText}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Headquarters Location & Interactive Map */}
      <section className="bg-white border-t border-b border-gray-200/80 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Details (lg:col-span-5) */}
          <div className={`lg:col-span-5 space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-2">
              <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
                {isRTL ? "المقر الرئيسي والعمليات" : "Headquarters & Logistics Hub"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-gray-950 tracking-tight">
                {t("contact.info.cairoOffice")}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                {isRTL
                  ? "مقر العمليات وخدمة العملاء في الهرم بالجيزة مجهز لتنسيق جميع الشحنات السريعة والمتابعة اللوجستية الفورية على مدار الساعة."
                  : "Headquarters and logistics customer operations located in Al Haram, Giza, coordinating express consignments and round-the-clock dispatch."}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 bg-[#FAF8F5] p-4 rounded-2xl border border-orange-100/80">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#C45B2A] flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {isRTL ? "العنوان" : "Physical Address"}
                  </h4>
                  <p className="text-sm font-bold text-gray-950 mt-0.5">
                    {t("contact.info.cairoAddress")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-[#FAF8F5] p-4 rounded-2xl border border-orange-100/80">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("contact.info.workingHours")}
                  </h4>
                  <p className="text-sm font-bold text-gray-950 mt-0.5">
                    {t("contact.info.workingHoursVal")}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.app.goo.gl/keiPvSvp1UH4ZqZL7?g_st=iw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FAF8F5] hover:bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-full font-bold text-xs sm:text-sm shadow-2xs hover:border-[#C45B2A] transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-[#C45B2A]" />
                <span>{isRTL ? "فتح الاتجاهات في خرائط Google" : "Get Directions in Google Maps"}</span>
              </a>
            </div>
          </div>

          {/* Right Map (lg:col-span-7) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] overflow-hidden border border-orange-100 shadow-xl flex flex-col">
              <div className="bg-gray-50/90 border-b border-gray-100 py-3.5 px-6 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <MapPin className="w-4 h-4 text-[#C45B2A]" />
                  <span>{t("contact.info.cairoAddress")}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {isRTL ? "مفتوح 24 ساعة" : "Open 24/7"}
                </span>
              </div>
              <div className="relative min-h-[380px] w-full bg-gray-100">
                <iframe
                  title="XSPEED Headquarters Location - Haram Giza"
                  src="https://maps.google.com/maps?q=7+%D8%B1%D9%83%D9%86+%D8%A7%D9%84%D8%B5%D9%81%D8%A7+%D9%85%D9%86+%D8%AE%D8%A7%D9%84%D8%AF+%D8%A7%D9%85%D9%8A%D9%86+%D8%A7%D9%84%D8%B9%D8%B1%D9%8A%D8%B4+%D8%A7%D9%84%D9%87%D8%B1%D9%85&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full min-h-[380px] border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Frequently Asked Questions (FAQ) Section */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[#C45B2A] text-xs font-black uppercase tracking-wider">
            {isRTL ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-gray-950">
            {isRTL ? "إجابات سريعة على استفساراتكم" : "Quick Answers to Common Logistics Inquiries"}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => (
            <div
              key={fIdx}
              className="bg-white/95 backdrop-blur-md rounded-2xl border border-orange-100/90 overflow-hidden shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
                className={`w-full p-5 sm:p-6 text-start flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-950 transition-colors hover:text-[#C45B2A] cursor-pointer`}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                    openFaq === fIdx ? "rotate-180 text-[#C45B2A]" : ""
                  }`}
                />
              </button>
              {openFaq === fIdx && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-medium border-t border-gray-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Direct WhatsApp Support Bar */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-[1400px] mx-auto bg-emerald-50/90 border border-emerald-200/80 rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${isRTL ? "text-right" : "text-left"}`}>
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>{isRTL ? "هل تفضل المحادثة الفورية عبر واتساب؟" : "Prefer Live Instant Chat?"}</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              {isRTL
                ? "اضغط لبدء محادثة مباشرة وفورية مع مكتب توزيع ومتابعة شحنات XSPEED المتاح على مدار 24/7."
                : "Click to open direct WhatsApp conversation with our 24/7 logistics dispatch desk."}
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 rounded-full text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg shadow-emerald-600/20 whitespace-nowrap hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isRTL ? "محادثة فورية عبر واتساب" : "Chat via WhatsApp Now"}</span>
          </a>
        </div>
      </section>
    </div>
  );
}


