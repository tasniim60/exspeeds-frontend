"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowUp, Phone, MessageSquare } from "lucide-react";

export default function FloatingWidgets() {
  const pathname = usePathname();
  const { isRTL } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Normalize pathname to strip language prefix (/ar, /en) and trailing slashes
  const cleanPath = (pathname || "")
    .split("?")[0]
    .replace(/^\/(ar|en)(\/|$)/, "/")
    .replace(/\/+$/, "") || "/";

  // Hide floating widgets completely on login, register, auth, dashboard, and admin routes
  const isHiddenRoute =
    cleanPath === "/login" ||
    cleanPath === "/register" ||
    cleanPath === "/forgot-password" ||
    cleanPath === "/organic-login" ||
    cleanPath === "/dashboard" ||
    cleanPath.startsWith("/dashboard/") ||
    cleanPath === "/client" ||
    cleanPath.startsWith("/client/") ||
    cleanPath === "/admin" ||
    cleanPath.startsWith("/admin/") ||
    cleanPath === "/wp-admin" ||
    cleanPath.startsWith("/wp-admin/");

  if (isHiddenRoute) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const whatsappUrl = isRTL
    ? "https://wa.me/201208027171?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%20XSPEED%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B4%D8%AD%D9%86."
    : "https://wa.me/201208027171?text=Hello%20XSPEED%20Logistics%20Support%2C%20I%20have%20an%20inquiry%20regarding%20shipping%20and%20express%20freight.";

  return (
    <>
      {/* 1. Floating Action Stack: WhatsApp & Direct Phone Call */}
      <div
        className={`fixed bottom-6 z-50 flex flex-col gap-3 transition-all duration-300 ${
          isRTL ? "left-4 sm:left-6" : "right-4 sm:right-6"
        }`}
      >
        {/* Direct Call Button (tel:) */}
        <a
          href="tel:+201208027171"
          aria-label={isRTL ? "اتصال هاتفي مباشر" : "Direct Phone Call"}
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#1C1415] to-[#2E2021] text-white border-2 border-orange-200/80 shadow-[0_10px_25px_rgba(28,20,21,0.4)] hover:shadow-[0_15px_35px_rgba(196,91,42,0.4)] hover:border-[#C45B2A] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#C45B2A] group-hover:rotate-12 transition-transform duration-300" />
          
          {/* Pulsing indicator */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-[#1C1415] animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-[#1C1415]" />

          {/* Desktop Hover Tooltip */}
          <span
            className={`hidden md:block absolute ${
              isRTL ? "left-16" : "right-16"
            } whitespace-nowrap bg-gray-950 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border border-white/10`}
          >
            {isRTL ? "اتصال مباشر: 7171 802 120 20+" : "Call Operations: +20 120 802 7171"}
          </span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={isRTL ? "محادثة فورية عبر واتساب" : "Chat on WhatsApp"}
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white border-2 border-emerald-300/80 shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_35px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white group-hover:scale-110 transition-transform duration-300" />
          
          {/* Live Online Badge */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-emerald-800 animate-pulse" />

          {/* Desktop Hover Tooltip */}
          <span
            className={`hidden md:block absolute ${
              isRTL ? "left-16" : "right-16"
            } whitespace-nowrap bg-gray-950 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border border-white/10`}
          >
            {isRTL ? "واتساب العمليات (رد فوري)" : "WhatsApp Support (Live)"}
          </span>
        </a>
      </div>

      {/* 2. Floating Return to Top Button (Opposite Corner or Stacked Top) */}
      <div
        className={`fixed bottom-6 z-40 transition-all duration-300 ${
          isRTL ? "right-4 sm:right-6" : "left-4 sm:left-6"
        }`}
      >
        <div
          className={`transition-all duration-300 transform ${
            showScrollTop
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={scrollToTop}
            aria-label={isRTL ? "العودة للأعلى" : "Back to top"}
            className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-orange-200/90 text-gray-800 shadow-[0_10px_25px_rgba(37,21,22,0.08)] hover:shadow-[0_15px_30px_rgba(196,91,42,0.2)] hover:border-[#C45B2A] hover:bg-white hover:text-[#C45B2A] hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-95"
          >
            <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            
            {/* Tooltip Label */}
            <span
              className={`hidden md:block absolute ${
                isRTL ? "right-14" : "left-14"
              } whitespace-nowrap bg-gray-950 text-white text-[11px] font-bold px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md`}
            >
              {isRTL ? "العودة للأعلى" : "Back to Top"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
