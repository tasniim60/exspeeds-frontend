"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ShipmentRequestWizard from "@/components/ship/ShipmentRequestWizard";
import { LogIn, UserCheck, Sparkles, ArrowUpRight } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export default function ShipClient() {
  const { user, isLoading } = useAuth();
  const { t, isRTL, getLocalizedPath } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render neutral loading screen while checking auth session state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#C45B2A] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-xs font-bold">{t("common.loading") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF9] min-h-screen py-8 sm:py-12 md:py-14 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          {/* Natural Editorial Eyebrow */}
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
                ? "اختر نوع الخدمة اللوجستية المطلوبة أو أدخل تفاصيل شحنتك لحجز موعد الاستلام والتنسيق المباشر مع فريق العمليات."
                : "Select your required logistics service or enter cargo specs for instant dispatch and direct WhatsApp coordination.")}
          </p>
        </div>

        {/* User Context Callout Banner */}
        {user ? (
          <div className="max-w-4xl mx-auto bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-start">
                <p className="text-xs font-bold text-emerald-950">
                  {isRTL ? "تم تسجيل الدخول بحساب:" : "Signed in as:"}{" "}
                  <span className="font-black text-[#C45B2A]">{user.name || user.email}</span>
                </p>
                <p className="text-[11px] text-emerald-700">
                  {isRTL
                    ? "سيتم ربط طلب الشحن تلقائياً ببياناتك وسجلك التجاري."
                    : "Your shipment request will be automatically linked to your account profile."}
                </p>
              </div>
            </div>
            <Link
              href={getLocalizedPath("/profile")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100/60 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <span>{t("nav.profile") || (isRTL ? "الملف الشخصي" : "Profile")}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-start">
                <p className="text-xs font-bold text-amber-950">
                  {isRTL
                    ? "لديك حساب مسجل بالفعل في إكس سبيد؟"
                    : "Already registered with XSPEED?"}
                </p>
                <p className="text-[11px] text-amber-800">
                  {isRTL
                    ? "سجل دخولك لتعبئة بيانات الشاحن والمستلم تلقائياً وحفظ سجل الشحنات."
                    : "Sign in to autofill your shipping details and archive requests in your dashboard."}
                </p>
              </div>
            </div>
            <Link
              href={getLocalizedPath("/login?redirect=/ship")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#C45B2A] hover:bg-[#A8481B] px-4 py-2 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t("nav.signIn") || (isRTL ? "تسجيل الدخول" : "Sign In")}</span>
            </Link>
          </div>
        )}

        {/* Wizard Component */}
        <ShipmentRequestWizard />
      </div>
    </div>
  );
}
