"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Locale, Direction, getTranslationValue, defaultLocale } from "@/locales";

interface LanguageContextType {
  locale: Locale;
  dir: Direction;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  formatDate: (date: string | Date | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  formatWeight: (weightKg: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "xspeed_language";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "ar";

  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === "en" || saved === "ar")) {
      return saved;
    }

    // Check cookie
    const match = document.cookie.match(new RegExp(`(^| )${STORAGE_KEY}=([^;]+)`));
    if (match && (match[2] === "en" || match[2] === "ar")) {
      return match[2] as Locale;
    }
  } catch (err) {
    console.warn("Error detecting language:", err);
  }

  return "ar";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Sync DOM attributes (lang and dir)
  const applyLocaleToDom = useCallback((loc: Locale) => {
    if (typeof document === "undefined") return;
    const direction: Direction = loc === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = loc;
    document.documentElement.dir = direction;
    if (loc === "ar") {
      document.documentElement.classList.add("rtl");
      document.documentElement.classList.remove("ltr");
    } else {
      document.documentElement.classList.add("ltr");
      document.documentElement.classList.remove("rtl");
    }
  }, []);

  useEffect(() => {
    const detected = getInitialLocale();
    setLocaleState(detected);
    applyLocaleToDom(detected);
    setMounted(true);
  }, [applyLocaleToDom]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      applyLocaleToDom(newLocale);
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
        document.cookie = `${STORAGE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (err) {
        console.warn("Failed to persist language choice:", err);
      }
    },
    [applyLocaleToDom]
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "ar" : "en");
  }, [locale, setLocale]);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      return getTranslationValue(locale, path, params);
    },
    [locale]
  );

  const formatDate = useCallback(
    (dateVal: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string => {
      if (!dateVal) return "";
      try {
        const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
        if (isNaN(d.getTime())) return String(dateVal);
        return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          ...options,
        }).format(d);
      } catch {
        return String(dateVal);
      }
    },
    [locale]
  );

  const formatNumber = useCallback(
    (num: number): string => {
      try {
        return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(num);
      } catch {
        return String(num);
      }
    },
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number, currencyCode: string = "EGP"): string => {
      if (locale === "ar") {
        const currLabel =
          currencyCode === "EGP"
            ? "جنيه مصري"
            : currencyCode === "USD"
            ? "دولار"
            : currencyCode === "EUR"
            ? "يورو"
            : currencyCode === "AED"
            ? "درهم"
            : currencyCode === "SAR"
            ? "ريال"
            : currencyCode;
        return `${formatNumber(amount)} ${currLabel}`;
      }
      return `${currencyCode} ${formatNumber(amount)}`;
    },
    [locale, formatNumber]
  );

  const formatWeight = useCallback(
    (weightKg: number | string): string => {
      const unit = locale === "ar" ? "كجم" : "KG";
      return `${weightKg} ${unit}`;
    },
    [locale]
  );

  const dir: Direction = locale === "ar" ? "rtl" : "ltr";
  const isRTL = locale === "ar";

  const value = useMemo(
    () => ({
      locale,
      dir,
      isRTL,
      setLocale,
      toggleLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatWeight,
    }),
    [locale, dir, isRTL, setLocale, toggleLocale, t, formatDate, formatNumber, formatCurrency, formatWeight]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, locale, dir, isRTL } = useLanguage();
  return { t, locale, dir, isRTL };
}
