"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, Direction, getTranslationValue, defaultLocale } from "@/locales";

interface LanguageContextType {
  locale: Locale;
  dir: Direction;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  getLocalizedPath: (path: string, targetLocale?: Locale) => string;
  t: (path: string, params?: Record<string, string | number>) => string;
  formatDate: (date: string | Date | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: string | Date | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: string | Date | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  formatWeight: (weightKg: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "xspeed_language";

function parseDateSafe(dateVal: string | Date | undefined): Date | null {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
}

export function LanguageProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
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

  // Sync when initialLocale changes (e.g. on navigation)
  useEffect(() => {
    if (initialLocale && initialLocale !== locale) {
      setLocaleState(initialLocale);
      applyLocaleToDom(initialLocale);
    }
  }, [initialLocale, locale, applyLocaleToDom]);

  useEffect(() => {
    applyLocaleToDom(locale);
    setMounted(true);
  }, [locale, applyLocaleToDom]);

  const getLocalizedPath = useCallback(
    (targetPath: string, targetLoc: Locale = locale): string => {
      if (!targetPath) return `/${targetLoc}`;
      let cleanPath = targetPath;
      if (cleanPath.startsWith("/ar/") || cleanPath === "/ar") {
        cleanPath = cleanPath.replace(/^\/ar/, "");
      } else if (cleanPath.startsWith("/en/") || cleanPath === "/en") {
        cleanPath = cleanPath.replace(/^\/en/, "");
      }
      if (!cleanPath.startsWith("/")) {
        cleanPath = `/${cleanPath}`;
      }
      return cleanPath === "/" ? `/${targetLoc}` : `/${targetLoc}${cleanPath}`;
    },
    [locale]
  );

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

      // Navigate to the localized URL if route is available
      if (pathname) {
        const nextUrl = getLocalizedPath(pathname, newLocale);
        if (nextUrl !== pathname) {
          router.push(nextUrl);
        }
      }
    },
    [applyLocaleToDom, getLocalizedPath, pathname, router]
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
        const d = parseDateSafe(dateVal);
        if (!d) return typeof dateVal === "string" && dateVal !== "—" && dateVal !== "N/A" ? dateVal : "";
        return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
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

  const formatTime = useCallback(
    (dateVal: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string => {
      if (!dateVal) return "";
      try {
        const d = parseDateSafe(dateVal);
        if (!d) return "";
        return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          ...options,
        }).format(d);
      } catch {
        return "";
      }
    },
    [locale]
  );

  const formatDateTime = useCallback(
    (dateVal: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string => {
      if (!dateVal) return "";
      try {
        const d = parseDateSafe(dateVal);
        if (!d) return typeof dateVal === "string" && dateVal !== "—" && dateVal !== "N/A" ? dateVal : "";
        return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
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
      getLocalizedPath,
      t,
      formatDate,
      formatTime,
      formatDateTime,
      formatNumber,
      formatCurrency,
      formatWeight,
    }),
    [locale, dir, isRTL, setLocale, toggleLocale, getLocalizedPath, t, formatDate, formatTime, formatDateTime, formatNumber, formatCurrency, formatWeight]
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
