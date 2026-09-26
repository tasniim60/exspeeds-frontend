"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ShipmentRequestWizard from "@/components/ship/ShipmentRequestWizard";
import { ShieldCheck, LogIn, UserPlus, Package } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export default function ShipClient() {
  const { user, isLoading } = useAuth();
  const { t, isRTL, getLocalizedPath } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#C45B2A] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-xs font-bold">{t("common.loading") || "Loading..."}</p>
      </div>
    );
  }

  // If user is not logged in / not registered, show the dedicated Authorization & Sign In Screen
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#FDFBF9] flex items-center justify-center py-12 sm:py-16 px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200/90 shadow-2xl p-6 sm:p-9 text-center space-y-6 animate-fade-up">
          <div className="w-20 h-20 bg-orange-50 text-[#C45B2A] rounded-3xl flex items-center justify-center mx-auto border border-orange-200 shadow-sm">
            <Package className="w-10 h-10 stroke-[2]" />
          </div>

          <div className="space-y-3">
            <SectionEyebrow centered>
              {isRTL ? "خدمة العملاء الحصرية" : "Registered Clients Portal"}
            </SectionEyebrow>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-[#251516] tracking-tight">
              {isRTL ? (
                <>
                  تسجيل الدخول <span className="text-[#C45B2A]">مطلوب</span> لطلب الشحن
                </>
              ) : (
                <>
                  Sign In Required to <span className="text-[#C45B2A]">Book Shipment</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              {isRTL
                ? "خدمة تقديم طلبات الشحن وحساب الأسعار والتنسيق اللوجستي الفوري متاحة لعملائنا المسجلين. يرجى تسجيل الدخول بحسابك أو إنشاء حساب جديد للبدء فوراً."
                : "Booking shipments and generating direct quotations is exclusively available to registered clients. Please sign in or create an account to proceed."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={getLocalizedPath("/login?redirect=/ship")}
              className="flex-1 h-12 px-6 rounded-2xl bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A8481B] hover:to-[#C45B2A] font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-orange-950/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{t("nav.signIn") || (isRTL ? "تسجيل الدخول" : "Sign In")}</span>
            </Link>

            <Link
              href={getLocalizedPath("/register?redirect=/ship")}
              className="flex-1 h-12 px-6 rounded-2xl border-2 border-gray-200 hover:border-[#C45B2A] bg-gray-50 hover:bg-white font-bold text-xs sm:text-sm text-gray-800 hover:text-[#C45B2A] flex items-center justify-center gap-2 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#C45B2A]" />
              <span>{t("auth.signUpBtn") || (isRTL ? "إنشاء حساب جديد" : "Create Account")}</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? "حسابك يتيح لك تتبع الشحنات وحفظ سجل الفواتير تلقائياً" : "Your account secures automatic telemetry & billing records"}</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in, show the full Booking Experience
  return (
    <div className="bg-[#FDFBF9] min-h-screen py-8 sm:py-12 md:py-14 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <SectionEyebrow centered>
            {t("shipment.tag") || (isRTL ? "حجز وشحن سريع ومباشر" : "Instant Express Booking")}
          </SectionEyebrow>

          <h1 className="text-[#251516] font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.03em]">
            {isRTL ? (
              <>
                طلب <span className="text-[#C45B2A]">شحن سريع</span> وتحديد الأسعار
              </>
            ) : (
              <>
                Book an Express <span className="text-[#C45B2A]">Shipment</span>
              </>
            )}
          </h1>

          <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            {t("shipment.subtitle") ||
              (isRTL
                ? "أدخل تفاصيل شحنتك في خطوات سهلة. سيقوم فريق العمليات بحساب أفضل سعر شحن وإرساله لك مباشرة عبر واتساب."
                : "Enter cargo specs for instant dispatch and direct WhatsApp coordination with operations desk.")}
          </p>
        </div>

        {/* Wizard Component */}
        <ShipmentRequestWizard />
      </div>
    </div>
  );
}
