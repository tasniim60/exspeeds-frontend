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
        className={`relative inline-flex items-center p-1 rounded-full bg-stone-100/90 hover:bg-stone-200/60 border border-stone-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] select-none transition-all duration-200 ${className}`}
        role="group"
        aria-label={locale === "ar" ? "تبديل لغة الموقع" : "Language selector"}
      >
        {/* Arabic Button */}
        <button
          type="button"
          onClick={() => setLocale("ar")}
          className={`relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            locale === "ar"
              ? "bg-white text-[#C45B2A] font-extrabold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-stone-200/70"
              : "text-stone-500 hover:text-stone-900 hover:bg-white/40 font-semibold"
          }`}
          aria-pressed={locale === "ar"}
        >
          {locale === "ar" && (
            <Globe className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
          )}
          <span className="sm:hidden">عربي</span>
          <span className="hidden sm:inline">العربية</span>
        </button>

        {/* English Button */}
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            locale === "en"
              ? "bg-white text-[#C45B2A] font-extrabold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-stone-200/70"
              : "text-stone-500 hover:text-stone-900 hover:bg-white/40 font-semibold"
          }`}
          aria-pressed={locale === "en"}
        >
          {locale === "en" && (
            <Globe className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
          )}
          <span className="sm:hidden">EN</span>
          <span className="hidden sm:inline">English</span>
        </button>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={`relative inline-flex items-center p-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] select-none text-xs transition-all duration-200 ${className}`}
        role="group"
        aria-label="Language switcher"
      >
        <button
          type="button"
          onClick={() => setLocale("ar")}
          className={`relative flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            locale === "ar"
              ? "bg-white text-[#251516] font-extrabold shadow-[0_1px_3px_rgba(0,0,0,0.2)] border border-white/30"
              : "text-white/70 hover:text-white hover:bg-white/10 font-semibold"
          }`}
          aria-pressed={locale === "ar"}
        >
          {locale === "ar" && (
            <Globe className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
          )}
          <span>العربية</span>
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`relative flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            locale === "en"
              ? "bg-white text-[#251516] font-extrabold shadow-[0_1px_3px_rgba(0,0,0,0.2)] border border-white/30"
              : "text-white/70 hover:text-white hover:bg-white/10 font-semibold"
          }`}
          aria-pressed={locale === "en"}
        >
          {locale === "en" && (
            <Globe className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
          )}
          <span>English</span>
        </button>
      </div>
    );
  }

  if (variant === "topbar") {
    return (
      <div
        className={`relative inline-flex items-center p-1 rounded-full bg-gray-100/90 hover:bg-gray-200/60 border border-gray-200/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-xs select-none transition-all duration-200 ${className}`}
        role="group"
        aria-label="Language selector"
      >
        <button
          id="admin-lang-btn-ar"
          type="button"
          onClick={() => setLocale("ar")}
          className={`relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            locale === "ar"
              ? "bg-white text-[#C45B2A] font-extrabold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-gray-200/80"
              : "text-gray-500 hover:text-gray-900 hover:bg-white/40 font-semibold"
          }`}
          aria-pressed={locale === "ar"}
        >
          {locale === "ar" && (
            <Globe className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
          )}
          <span className="sm:hidden">عربي</span>
          <span className="hidden sm:inline">العربية</span>
        </button>
        <button
          id="admin-lang-btn-en"
          type="button"
          onClick={() => setLocale("en")}
          className={`relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            locale === "en"
              ? "bg-white text-[#C45B2A] font-extrabold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-gray-200/80"
              : "text-gray-500 hover:text-gray-900 hover:bg-white/40 font-semibold"
          }`}
          aria-pressed={locale === "en"}
        >
          {locale === "en" && (
            <Globe className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
          )}
          <span>EN</span>
        </button>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div
        className={`w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50/90 border border-gray-200/90 text-xs font-bold shadow-2xs ${className}`}
      >
        <div className="flex items-center gap-2 text-gray-700">
          <Globe className="w-4 h-4 text-[#C45B2A]" />
          <span>{locale === "ar" ? "لغة العرض" : "Display Language"}</span>
        </div>
        <div className="inline-flex items-center p-1 bg-white rounded-full border border-gray-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setLocale("ar")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              locale === "ar"
                ? "bg-[#C45B2A] text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            العربية
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              locale === "en"
                ? "bg-[#251516] text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            English
          </button>
        </div>
      </div>
    );
  }

  // Default fallback mirrors nav-light
  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full bg-stone-100/90 hover:bg-stone-200/60 border border-stone-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] select-none transition-all duration-200 ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        id="lang-btn-ar"
        onClick={() => setLocale("ar")}
        className={`relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          locale === "ar"
            ? "bg-white text-[#C45B2A] font-extrabold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-stone-200/70"
            : "text-stone-500 hover:text-stone-900 hover:bg-white/40 font-semibold"
        }`}
        aria-pressed={locale === "ar"}
      >
        {locale === "ar" && (
          <Globe className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
        )}
        <span className="sm:hidden">عربي</span>
        <span className="hidden sm:inline">العربية</span>
      </button>

      <button
        type="button"
        id="lang-btn-en"
        onClick={() => setLocale("en")}
        className={`relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          locale === "en"
            ? "bg-white text-[#C45B2A] font-extrabold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-stone-200/70"
            : "text-stone-500 hover:text-stone-900 hover:bg-white/40 font-semibold"
        }`}
        aria-pressed={locale === "en"}
      >
        {locale === "en" && (
          <Globe className="w-3.5 h-3.5 text-[#C45B2A] shrink-0" />
        )}
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </button>
    </div>
  );
}
