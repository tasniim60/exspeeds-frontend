"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ShipmentRequestWizard from "@/components/ship/ShipmentRequestWizard";
import { ShieldAlert, LogIn, UserPlus, Sparkles } from "lucide-react";

export default function ShipPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      // Redirect unauthenticated public visitors to login with return redirect parameter
      router.push("/login?redirect=/ship");
    }
  }, [mounted, isLoading, user, router]);

  // Render neutral loading screen while checking auth session state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#C45B2A] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-xs font-bold">{t("common.loading") || "Loading..."}</p>
      </div>
    );
  }

  // Authorization Guard for Public / Guest Users
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#FDFBF9] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/90 shadow-2xl p-6 text-center space-y-6 animate-fade-up">
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
              href="/login?redirect=/ship"
              className="h-12 px-6 rounded-xl bg-[#C45B2A] hover:bg-[#A8481B] font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{t("nav.signIn") || "Sign In"}</span>
            </Link>

            <Link
              href="/register?redirect=/ship"
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

  // Render Private Route for Logged in / Registered User
  return (
    <div className="bg-[#FDFBF9] min-h-screen py-10 sm:py-14 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-orange-100/70 border border-orange-300/60 text-[#C45B2A] text-[11px] font-extrabold uppercase px-4 py-1.5 rounded-full tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("shipment.tag") || (isRTL ? "حجز وشحن سريع ومباشر" : "Instant Express Booking")}</span>
          </div>

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
            {t("shipment.subtitle") || (isRTL ? "أدخل تفاصيل ومواصفات شحنتك في 4 خطوات سهلة. سيقوم فريق العمليات بحساب أفضل سعر تنافسي مع كبرى شركات الشحن وتأكيده لك عبر واتساب." : "Enter your cargo details in 4 simple steps. Our operations team will calculate the lowest rate and send your quote via WhatsApp.")}
          </p>
        </div>

        {/* Wizard Component */}
        <ShipmentRequestWizard />
      </div>
    </div>
  );
}
