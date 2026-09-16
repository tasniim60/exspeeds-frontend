"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Lock,
  Mail,
  ShieldCheck,
  Truck,
  Clock,
  Eye,
  EyeOff,
  Headphones,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { signIn } from "next-auth/react";

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const { t, isRTL, getLocalizedPath } = useLanguage();

  const { user, loginWithBackend } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  useEffect(() => {
    if (user) {
      const rawDestination = redirectParam || (user.role === "admin" ? "/admin" : "/ship");
      router.replace(getLocalizedPath(rawDestination));
    }
  }, [user, redirectParam, router, getLocalizedPath]);

  // Capture OAuth or redirect error params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setAuthError(isRTL ? "بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور." : "Invalid login credentials. Please check your email and password.");
      } else if (errorParam === "OAuthSignin" || errorParam === "OAuthCallback") {
        setAuthError(isRTL ? "تعذر تسجيل الدخول عبر Google. يرجى إعادة المحاولة." : "Google authentication failed. Please try again.");
      } else {
        setAuthError(isRTL ? "حدث خطأ في الجلسة أو المصادقة. يرجى المحاولة مجدداً." : "Authentication error. Please try again.");
      }
    }
  }, [searchParams, isRTL]);

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      await signIn("google", {
        callbackUrl: getLocalizedPath(redirectParam || "/ship"),
      });
    } catch {
      setAuthError(
        isRTL
          ? "تعذر الاتصال بـ Google. يرجى إعادة المحاولة."
          : "Could not connect to Google. Please try again."
      );
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormInputs) => {
    setAuthError(null);
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.password.trim();

    const success = await loginWithBackend(cleanEmail, cleanPass);
    if (success) {
      const isAdmin = cleanEmail.includes("admin");
      const rawDestination = redirectParam || (isAdmin ? "/admin" : "/ship");
      router.push(getLocalizedPath(rawDestination));
      return;
    }

    setAuthError(
      isRTL
        ? "بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور."
        : "Invalid login credentials. Please check your email and password."
    );
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col justify-between relative overflow-hidden font-sans bg-[#FAF8F5]">
      {/* Background Image - Mirrors horizontally in Arabic (RTL) for perfect visual harmony */}
      <div
        className={`absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-transform duration-700 ease-in-out ${
          isRTL ? "-scale-x-100" : "scale-x-100"
        }`}
        style={{ backgroundImage: "url('/assets/xspeed_login_bg.jpg')" }}
      />
      {/* Directional warm overlay for optimal readability, text protection, and depth */}
      <div
        className="absolute inset-0 z-0 pointer-events-none backdrop-blur-[0.5px]"
        style={{
          background: isRTL
            ? "linear-gradient(to left, rgba(250, 248, 245, 0.96) 0%, rgba(250, 248, 245, 0.88) 45%, rgba(250, 248, 245, 0.45) 100%)"
            : "linear-gradient(to right, rgba(250, 248, 245, 0.96) 0%, rgba(250, 248, 245, 0.88) 45%, rgba(250, 248, 245, 0.45) 100%)",
        }}
      />

      {/* Main Content Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center relative z-10 w-full">

        {/* Hero Column: Headline & Value Propositions */}
        <div className="hidden md:col-span-7 lg:col-span-6 md:flex flex-col space-y-6 text-start">
          {/* Natural Editorial Eyebrow */}
          <SectionEyebrow>
            {isRTL ? "بوابة الشحن والخدمات اللوجستية الذكية" : "Smart Logistics & Express Freight Portal"}
          </SectionEyebrow>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-brand-dark leading-[1.08] tracking-[-0.03em]">
              {isRTL ? "نوصلك أسرع" : "Delivering You Faster"}
              <span className="text-brand-orange block mt-1">
                {isRTL ? "إلى أي مكان في العالم" : "To Anywhere in the World"}
              </span>
            </h1>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium max-w-lg">
              {isRTL
                ? "حلول شحن متكاملة وموثوقة بأعلى معايير الجودة والأمان لتصل شحناتك وبضائعك في موعدها المحدد أينما كانت وجهتك."
                : "Integrated and reliable shipping solutions engineered with top-tier security and speed so your shipments arrive safely and on time."}
            </p>
          </div>

          {/* 3 Service Highlights */}
          <div className="grid gap-3 pt-2 max-w-xl sm:grid-cols-3">
            <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-brand-dark">
                  {isRTL ? "سرعة فائقة في التسليم" : "Express Delivery Speed"}
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {isRTL ? "مواعيد دقيقة وشحن سريع عبر رحلات يومية" : "Precise transit times with daily scheduled departures"}
                </p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-brand-dark">
                  {isRTL ? "أمان وحماية شاملة" : "Complete Cargo Safety"}
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {isRTL ? "تأمين معتمد ومتابعة دقيقة لكافة البضائع" : "Comprehensive insurance and strict security handling"}
                </p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-brand-dark">
                  {isRTL ? "دعم لوجستي 24/7" : "24/7 Dedicated Support"}
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {isRTL ? "فريق دعم ومتابعة متخصص جاهز لمساعدتكم" : "Specialized logistics desk ready to assist around the clock"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Column: Clean login card */}
        <div className="md:col-span-5 lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.06)] w-full max-w-[440px] p-6 sm:p-8 text-center space-y-4 relative z-20">
            {/* Emblem Badge */}
            <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center text-white mx-auto shadow-sm">
              <Truck className="w-6 h-6" />
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-brand-dark tracking-tight">
                {isRTL ? "مرحباً بك مجدداً" : "Welcome Back"}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {isRTL ? "سجّل الدخول للوصول إلى حسابك ومتابعة شحناتك" : "Log in to access your account and manage shipments"}
              </p>
            </div>

            {/* Auth Error Banner if any */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 text-start animate-fade-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-start pt-1" noValidate>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-dark">
                  {isRTL ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    {...register("email", {
                      required: t("auth.validation.emailRequired") || (isRTL ? "البريد الإلكتروني مطلوب" : "Email address is required"),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t("auth.validation.emailInvalid") || (isRTL ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address"),
                      },
                    })}
                    placeholder="name@example.com"
                    className={`w-full h-10 rounded-xl ${
                      isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                    } bg-white border ${
                      errors.email ? "border-red-500 bg-red-50/50" : "border-[#E2E8F0]"
                    } text-xs sm:text-sm font-medium text-brand-dark outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 transition-all placeholder:text-slate-400 shadow-xs`}
                  />
                  <Mail className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} w-4 h-4 text-slate-400 pointer-events-none`} />
                </div>
                {errors.email && (
                  <p className="text-[11px] font-semibold text-red-600 px-1 flex items-center gap-1 animate-fade-up">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-dark">
                  {isRTL ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: t("auth.validation.passwordRequired") || (isRTL ? "كلمة المرور مطلوبة" : "Password is required"),
                      minLength: {
                        value: 6,
                        message: t("auth.validation.passwordMin") || (isRTL ? "يجب ألا تقل كلمة المرور عن 6 خانات" : "Password must be at least 6 characters"),
                      },
                    })}
                    placeholder="••••••••"
                    className={`w-full h-10 rounded-xl ${
                      isRTL ? "pr-10 pl-10 text-right" : "pl-10 pr-10 text-left"
                    } bg-white border ${
                      errors.password ? "border-red-500 bg-red-50/50" : "border-[#E2E8F0]"
                    } text-xs sm:text-sm font-medium text-brand-dark outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 transition-all placeholder:text-slate-400 shadow-xs`}
                  />
                  <Lock className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} w-4 h-4 text-slate-400 pointer-events-none`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? (t("auth.hidePassword") || "Hide password") : (t("auth.showPassword") || "Show password")}
                    className={`absolute ${isRTL ? "left-3" : "right-3"} text-[#94A3B8] hover:text-brand-dark rounded-lg p-1 transition-colors cursor-pointer`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-semibold text-red-600 px-1 flex items-center gap-1 animate-fade-up">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none group">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="accent-brand-orange rounded w-4 h-4 cursor-pointer"
                  />
                  <span className="group-hover:text-brand-dark transition-colors">
                    {isRTL ? "تذكرني في هذه الجلسة" : "Remember me"}
                  </span>
                </label>
                <Link
                  href={getLocalizedPath(redirectParam ? `/forgot-password?redirect=${encodeURIComponent(redirectParam)}` : "/forgot-password")}
                  className="text-brand-orange font-semibold hover:underline text-xs transition-colors"
                >
                  {isRTL ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </Link>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 py-2.5 rounded-xl bg-brand-orange text-white font-semibold text-sm shadow-md hover:bg-brand-orange-deep transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
                  </>
                ) : (
                  <span>{isRTL ? "تسجيل الدخول" : "Log In"}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-500 absolute">
                {isRTL ? "أو المتابعة عبر" : "Or continue with"}
              </span>
            </div>

            {/* Social Auth */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full h-10 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-brand-dark font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                    <span className="text-gray-700">
                      {isRTL ? "جاري الاتصال بـ Google..." : "Connecting to Google..."}
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{isRTL ? "المتابعة باستخدام Google" : "Continue with Google"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-3 border-t border-[#F1F5F9]">
              <p className="text-xs text-slate-500 font-medium">
                {isRTL ? "ليس لديك حساب بعد؟" : "Don't have an account?"}{" "}
                <Link
                  href={getLocalizedPath(redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register")}
                  className="text-brand-orange font-bold hover:underline transition-colors"
                >
                  {isRTL ? "إنشاء حساب جديد" : "Create new account"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center text-brand-dark text-sm font-bold">...</div>}>
      <LoginForm />
    </Suspense>
  );
}
