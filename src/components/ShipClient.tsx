"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ShipmentRequestWizard from "@/components/ship/ShipmentRequestWizard";
import { ShieldAlert, LogIn, UserPlus, UserCheck, ArrowUpRight } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export default function ShipClient() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t, isRTL, getLocalizedPath } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict Private Route Guard: Redirect unauthenticated guests to login with return redirect
  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.replace(getLocalizedPath("/login?redirect=/ship"));
    }
  }, [mounted, isLoading, user, router, getLocalizedPath]);

  // Neutral loading screen while checking auth session state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#C45B2A] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-xs font-bold">{t("common.loading") || "Loading..."}</p>
      </div>
    );
  }

  // Authorization Guard for Unauthenticated Public Visitors
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#FDFBF9] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/90 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-fade-up">
          <div className="w-16 h-16 bg-orange-50 text-[#C45B2A] rounded-2xl flex items-center justify-center mx-auto border border-orange-200 shadow-2xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-black text-[#251516] tracking-tight">
              {isRTL ? "يتطلب تسجيل الدخول" : "Authorization Required"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isRTL
                ? "تقديم طلبات الشحن وحساب الأسعار متاح حصريًا للعملاء المسجلين. يرجى تسجيل الدخول أو إنشاء حساب جديد للمتابعة."
                : "Submitting shipment requests is available exclusively to registered users. Please sign in or create an account to proceed."}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href={getLocalizedPath("/login?redirect=/ship")}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#C45B2A] to-[#E65100] hover:from-[#A8481B] hover:to-[#C45B2A] font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{t("nav.signIn") || "Sign In"}</span>
            </Link>

            <Link
              href={getLocalizedPath("/register?redirect=/ship")}
              className="h-12 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-bold text-xs sm:text-sm text-gray-800 flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#C45B2A]" />
              <span>{t("auth.signUpBtn") || "Register / Create Account"}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Private Route for Authenticated Logged-in User
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

        {/* User Context Badge */}
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

        {/* Wizard Component */}
        <ShipmentRequestWizard />
      </div>
    </div>
  );
}
