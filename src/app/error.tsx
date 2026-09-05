"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    console.error("Next.js Error Boundary caught:", error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies safely
      if (typeof document !== "undefined") {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
    } catch {}
    window.location.reload();
  };

  return (
    <main
      className={`min-h-[78vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50/50 ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xl shadow-gray-200/50 space-y-6 text-center">
        {/* Error Shield Icon */}
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200 shadow-xs">
          <AlertCircle className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase text-red-600 bg-red-100/80 px-3 py-1 rounded-full tracking-wider">
            {t("errors.appException")}
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-[#251516]">
            {t("errors.somethingWentWrong")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
            {t("errors.unexpectedError")}
          </p>
        </div>

        {/* Technical Diagnostics */}
        {error?.message && (
          <div
            className={`rounded-2xl border border-gray-200 bg-gray-50 p-3.5 space-y-2 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-gray-700 hover:text-gray-900 cursor-pointer px-1"
            >
              <span>{t("errors.errorDetails")}</span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {showDetails && (
              <div
                className="pt-2 border-t border-gray-200 font-mono text-[11px] text-red-700 break-words whitespace-pre-wrap leading-relaxed"
                dir="ltr"
              >
                {error.message}
                {error.digest && (
                  <p className="text-gray-400 mt-1 text-[10px]">Digest: {error.digest}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#251516] hover:bg-[#3D2527] active:scale-[0.98] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t("errors.tryAgain")}</span>
          </button>

          <button
            onClick={handleClearCacheAndReload}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 active:scale-[0.98] text-[#C45B2A] font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t("errors.clearCacheReload")}</span>
          </button>

          <Link
            href="/"
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Home className="w-4 h-4" />
            <span>{t("errors.homepage")}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

