"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Truck, ShieldCheck, User, PhoneCall, LayoutDashboard, Plus, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeCtaSection() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useAuth();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <section className="bg-gradient-to-r from-gray-950 via-[#251516] to-gray-950 text-white py-16 sm:py-20 relative overflow-hidden border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-display font-black tracking-[-0.03em]">
                {t("home.cta.title")}
              </h2>
              <p className="text-gray-300 font-body text-lg max-w-xl">
                {t("home.cta.subtitle")}
              </p>
            </div>
            <Link href="/ship">
              <button className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] text-white font-bold py-4 px-8 text-base rounded-full shadow-lg shadow-orange-500/25">
                {t("home.cta.requestBtn")}
              </button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // 1. Logged in as Admin
  if (user && user.role === "admin") {
    return (
      <section className="bg-gradient-to-r from-gray-950 via-[#251516] to-gray-950 text-white py-16 sm:py-20 border-t border-orange-900/30 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-start">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C45B2A]" />
                <span>{isRTL ? "مسؤول النظام المسجل" : "Logged in as System Administrator"}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-black tracking-[-0.03em]">
                {t("admin.sidebar.brandSub")}
              </h2>
              <p className="text-gray-300 font-body text-base md:text-lg max-w-2xl leading-relaxed">
                {t("admin.topbar.tabTitles.statistics.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link href="/admin">
                <button className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{t("nav.adminDashboard")}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              </Link>
              <Link href="/track">
                <button className="border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-full flex items-center gap-2 cursor-pointer transition-all">
                  <Truck className="h-4 w-4 text-[#C45B2A]" />
                  <span>{t("nav.track")}</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. Logged in as Customer / Shipper
  if (user) {
    return (
      <section className="bg-gradient-to-r from-gray-950 via-[#251516] to-gray-950 text-white py-16 sm:py-20 border-t border-gray-800 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-start">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-orange-400" />
                <span>{t("client.dashboard.welcomeBack")}, {user.name}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-black tracking-[-0.03em]">
                {t("client.dashboard.title")}
              </h2>
              <p className="text-gray-300 font-body text-base md:text-lg max-w-2xl leading-relaxed">
                {t("client.dashboard.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link href="/ship">
                <button className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]">
                  <Package className="w-4 h-4 stroke-[2.2]" />
                  <span>{t("nav.requestShipment")}</span>
                </button>
              </Link>
              <Link href="/profile">
                <button className="border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-full flex items-center gap-2 cursor-pointer transition-all">
                  <span>{t("home.cta.portalBtn")}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 3. Guest User CTA
  return (
    <section className="bg-gradient-to-r from-gray-950 via-[#251516] to-gray-950 text-white py-16 sm:py-20 relative overflow-hidden border-t border-gray-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-start">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3.5 py-1 rounded-full text-xs font-semibold">
              <Package className="w-3.5 h-3.5 text-orange-400" />
              <span>{isRTL ? "شحن دولي سريع وموثوق" : "High-Speed Global Dispatch"}</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-[-0.03em] text-white">
              {t("home.cta.title")}
            </h2>
            <p className="text-gray-300 font-body text-base md:text-lg max-w-xl leading-relaxed">
              {t("home.cta.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/login?redirect=/ship">
              <button className="bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A34920] hover:to-[#C45B2A] text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-2.5 cursor-pointer transition-all hover:scale-[1.02]">
                <Package className="w-5 h-5 stroke-[2.2]" />
                <span>{t("home.cta.requestBtn")}</span>
              </button>
            </Link>
            <a
              href="https://wa.me/201208027171"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-emerald-500/50 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/70 text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>{t("home.cta.whatsappBtn")}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

