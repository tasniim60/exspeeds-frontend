"use client";

import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-[70vh] flex items-center justify-center px-4 py-16 text-center bg-gray-50/50 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 bg-orange-50 text-[#C45B2A] rounded-full flex items-center justify-center mx-auto border border-orange-200">
          <Package className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-[#C45B2A] bg-orange-100 px-3 py-1 rounded-full">
            {t("errors.notFound.code")}
          </span>
          <h1 className="text-2xl font-display font-black text-[#251516]">
            {t("errors.notFound.title")}
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t("errors.notFound.subtitle")}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="btn-primary !bg-[#C45B2A] hover:!bg-[#D9531E] text-white font-bold py-3 px-6 rounded-xl text-xs inline-flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            <span>{t("errors.notFound.homeBtn")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
