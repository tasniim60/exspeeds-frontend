"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function AuthFooter() {
  const { isRTL } = useLanguage();

  return (
    <footer className="bg-[#1C1415] text-white py-4 px-6 text-xs font-medium border-t border-white/10 relative z-20">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 font-medium">
          {isRTL
            ? "جميع الحقوق محفوظة © 2025 XSPEED Express"
            : "© 2025 XSPEED Express. All rights reserved."}
        </p>

        <div className="flex items-center gap-4 text-gray-300 font-semibold">
          <a href="#" className="hover:text-[#D45225] transition-colors">
            {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
          </a>
          <span className="text-gray-600">|</span>
          <a href="#" className="hover:text-[#D45225] transition-colors">
            {isRTL ? "الشروط والأحكام" : "Terms & Conditions"}
          </a>
        </div>
      </div>
    </footer>
  );
}
