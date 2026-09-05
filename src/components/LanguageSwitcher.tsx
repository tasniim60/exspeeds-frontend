"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "default" | "compact" | "topbar" | "mobile" | "dark" | "nav-light";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "default",
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale, toggleLocale } = useLanguage();

  if (variant === "nav-light") {
    return (
      <div
        className={`relative inline-flex items-center p-1 rounded-full bg-stone-100/90 hover:bg-stone-100 border border-stone-200/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] select-none transition-all duration-200 ${className}`}
        role="group"
        aria-label={locale === "ar" ? "تبديل لغة الموقع" : "Language selector"}
      >
        {/* Interactive Globe Trigger */}
        <button
          type="button"
          onClick={toggleLocale}
          title={locale === "ar" ? "التبديل إلى English" : "Switch to العربية"}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-[#C45B2A] hover:bg-orange-50 hover:text-[#A8481B] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-orange-100/90 shrink-0 transition-all duration-200 cursor-pointer active:scale-95 group"
          aria-label={locale === "ar" ? "تبديل اللغة" : "Toggle language"}
        >
          <Globe className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />
        </button>

        {/* Segmented Controls */}
        <div className="inline-flex items-center gap-0.5 px-1">
          <button
            type="button"
            onClick={() => setLocale("ar")}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
              locale === "ar"
                ? "bg-white text-[#C45B2A] font-black shadow-[0_2px_6px_rgba(196,91,42,0.12),0_1px_2px_rgba(0,0,0,0.05)] border border-orange-200/80 scale-[1.02]"
                : "text-stone-600 hover:text-stone-900 hover:bg-black/[0.03]"
            }`}
            aria-pressed={locale === "ar"}
          >
            {locale === "ar" && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#C45B2A] shrink-0 animate-pulse" />
            )}
            <span>العربية</span>
          </button>

          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
              locale === "en"
                ? "bg-white text-stone-950 font-black shadow-[0_2px_6px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.05)] border border-stone-300/80 scale-[1.02]"
                : "text-stone-600 hover:text-stone-900 hover:bg-black/[0.03]"
            }`}
            aria-pressed={locale === "en"}
          >
            {locale === "en" && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#C45B2A] shrink-0 animate-pulse" />
            )}
            <span className="hidden sm:inline">English</span>
            <span className="sm:hidden">EN</span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={`inline-flex items-center gap-1 p-1 rounded-full border border-white/15 bg-white/10 backdrop-blur-md select-none text-xs font-bold ${className}`}
        role="group"
        aria-label="Language switcher"
      >
        <button
          type="button"
          onClick={toggleLocale}
          className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 text-white/80 hover:text-white shrink-0 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setLocale("ar")}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            locale === "ar"
              ? "bg-white text-[#C45B2A] font-extrabold shadow-sm"
              : "text-white/60 hover:text-white"
          }`}
          aria-pressed={locale === "ar"}
        >
          العربية
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            locale === "en"
              ? "bg-white text-[#251516] font-extrabold shadow-sm"
              : "text-white/60 hover:text-white"
          }`}
          aria-pressed={locale === "en"}
        >
          English
        </button>
      </div>
    );
  }

  if (variant === "topbar") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-full bg-gray-100/90 hover:bg-gray-100 border border-gray-200/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] text-xs font-bold select-none transition-all ${className}`}
        role="group"
        aria-label="Language selector"
      >
        <button
          type="button"
          onClick={toggleLocale}
          title={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
          className="w-6 h-6 rounded-full flex items-center justify-center bg-white text-[#C45B2A] hover:text-[#A8481B] shadow-2xs border border-orange-100 shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Globe className="w-3 h-3" />
        </button>
        <div className="inline-flex items-center gap-0.5 px-0.5">
          <button
            id="admin-lang-btn-ar"
            type="button"
            onClick={() => setLocale("ar")}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              locale === "ar"
                ? "bg-white text-[#C45B2A] shadow-2xs font-extrabold border border-orange-200/60"
                : "text-gray-500 hover:text-gray-900"
            }`}
            aria-pressed={locale === "ar"}
          >
            العربية
          </button>
          <button
            id="admin-lang-btn-en"
            type="button"
            onClick={() => setLocale("en")}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              locale === "en"
                ? "bg-white text-[#251516] shadow-2xs font-extrabold border border-gray-200"
                : "text-gray-500 hover:text-gray-900"
            }`}
            aria-pressed={locale === "en"}
          >
            EN
          </button>
        </div>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div
        className={`w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold ${className}`}
      >
        <div className="flex items-center gap-2 text-gray-700">
          <Globe className="w-4 h-4 text-[#C45B2A]" />
          <span>{locale === "ar" ? "اللغة / Language" : "Language / اللغة"}</span>
        </div>
        <div className="inline-flex p-1 bg-white rounded-lg border border-gray-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              locale === "en" ? "bg-[#251516] text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLocale("ar")}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              locale === "ar" ? "bg-[#C45B2A] text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            العربية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-gray-100/90 hover:bg-gray-100 border border-gray-200/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] select-none text-xs font-bold transition-all ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={toggleLocale}
        title={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
        className="w-6 h-6 rounded-full flex items-center justify-center bg-white text-[#C45B2A] hover:text-[#A8481B] shadow-2xs border border-orange-100 shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
      >
        <Globe className="w-3.5 h-3.5" />
      </button>
      <div className="inline-flex items-center gap-0.5 px-1">
        <button
          type="button"
          id="lang-btn-ar"
          onClick={() => setLocale("ar")}
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            locale === "ar"
              ? "bg-white text-[#C45B2A] shadow-xs font-extrabold border border-orange-200/60"
              : "text-gray-500 hover:text-gray-900"
          }`}
          aria-pressed={locale === "ar"}
        >
          العربية
        </button>
        <button
          type="button"
          id="lang-btn-en"
          onClick={() => setLocale("en")}
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            locale === "en"
              ? "bg-white text-[#251516] shadow-xs font-extrabold border border-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
          aria-pressed={locale === "en"}
        >
          EN
        </button>
      </div>
    </div>
  );
}
