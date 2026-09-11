"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Scale, Headphones, Home } from "lucide-react";

export default function AuthFooter() {
  const { isRTL, getLocalizedPath } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1C1415] text-white py-4 px-4 sm:px-6 text-xs font-medium border-t border-white/10 relative z-20">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3.5">
        {/* Copyright */}
        <p className="text-gray-400 font-medium text-center sm:text-start">
          {isRTL
            ? `جميع الحقوق محفوظة © ${currentYear} إكس سبيد للشحن السريع (exspeeds.com)`
            : `© ${currentYear} XSPEED Express Logistics (exspeeds.com). All rights reserved.`}
        </p>

        {/* Action Links */}
        <nav aria-label="Legal & Support links" className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-gray-300 font-semibold">
          <Link
            href={getLocalizedPath("/")}
            className="hover:text-[#C45B2A] transition-colors duration-200 inline-flex items-center gap-1.5 py-1"
          >
            <Home className="w-3.5 h-3.5 text-[#C45B2A]" />
            <span>{isRTL ? "الرئيسية" : "Home"}</span>
          </Link>

          <span className="text-gray-700 select-none">|</span>

          <Link
            href={getLocalizedPath("/privacy")}
            className="hover:text-[#C45B2A] transition-colors duration-200 inline-flex items-center gap-1.5 py-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C45B2A]" />
            <span>{isRTL ? "سياسة الخصوصية" : "Privacy Policy"}</span>
          </Link>

          <span className="text-gray-700 select-none">|</span>

          <Link
            href={getLocalizedPath("/terms")}
            className="hover:text-[#C45B2A] transition-colors duration-200 inline-flex items-center gap-1.5 py-1"
          >
            <Scale className="w-3.5 h-3.5 text-[#C45B2A]" />
            <span>{isRTL ? "الشروط والأحكام" : "Terms & Conditions"}</span>
          </Link>

          <span className="text-gray-700 select-none">|</span>

          <Link
            href={getLocalizedPath("/contact")}
            className="hover:text-[#C45B2A] transition-colors duration-200 inline-flex items-center gap-1.5 py-1"
          >
            <Headphones className="w-3.5 h-3.5 text-[#C45B2A]" />
            <span>{isRTL ? "الدعم الفني 24/7" : "24/7 Support"}</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
}

