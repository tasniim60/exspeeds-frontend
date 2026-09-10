"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Truck,
  Globe2,
  Clock,
  ThumbsUp,
  Box,
  Eye,
  EyeOff,
  Headphones,
  MonitorCheck,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { signIn } from "next-auth/react";

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const { t, isRTL, getLocalizedPath } = useLanguage();
  const { user, registerWithBackend } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  useEffect(() => {
    if (user) {
      const rawDestination = redirectParam || (user.role === "admin" ? "/admin" : "/ship");
      router.replace(getLocalizedPath(rawDestination));
    }
  }, [user, redirectParam, router, getLocalizedPath]);

  const handleGoogleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      await signIn("google", {
        callbackUrl: getLocalizedPath(redirectParam || "/ship"),
      });
    } catch {
      setErrorMsg(
        isRTL
          ? "تعذر الاتصال بـ Google. يرجى إعادة المحاولة."
          : "Could not connect to Google. Please try again."
      );
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormInputs) => {
    setErrorMsg(null);
    const cleanEmail = data.email.trim().toLowerCase();
    const isAdmin = cleanEmail.includes("admin") || cleanEmail.includes("ops@");

    const res = await registerWithBackend({
      name: data.name.trim() || "Customer",
      email: cleanEmail,
      password: data.password,
    });

    if (res.success) {
      const rawDestination = redirectParam || (isAdmin ? "/admin" : "/ship");
      router.push(getLocalizedPath(rawDestination));
    } else {
      setErrorMsg(res.error || "Registration failed. Please try again.");
    }
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
      {/* Subtle warm overlay for optimal readability and depth */}
      <div className="absolute inset-0 z-0 bg-[#FAF8F5]/45 backdrop-blur-[0.5px] pointer-events-none" />

      {/* Main Content Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center relative z-10 w-full">

        {/* Hero Column: Headline & Value Propositions */}
        <div className="md:col-span-7 lg:col-span-6 flex flex-col space-y-6 text-start">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 self-start bg-white/90 backdrop-blur-md border border-orange-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C45B2A]" />
            <span className="text-xs font-bold text-gray-800">
              {isRTL ? "انضم إلى نخبة عملاء وشركات الشحن" : "Join The World's Leading Shippers"}
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-gray-950 leading-[1.18] tracking-tight">
              {isRTL ? "انضم إلى شبكة" : "Join The World's"}
              <span className="text-[#C45B2A] block mt-1">
                {isRTL ? "الشحن الأسرع والأكثر موثوقية" : "Fastest & Most Reliable Shipping Network"}
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium max-w-lg">
              {isRTL
                ? "أنشئ حسابك مجاناً الآن للاستفادة من حلول لوجستية متطورة، عروض أسعار تفضيلية للشركات، وتتبع مباشر لكافة شحناتك."
                : "Create your free account today to access smart logistics, instant freight quotes, and exclusive business shipping rates."}
            </p>
          </div>

          {/* 3 Service Highlights */}
          <div className="space-y-3.5 pt-2 max-w-md">
            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white/95 border border-orange-200/80 flex items-center justify-center text-[#C45B2A] shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-gray-950">
                  {isRTL ? "سرعة فائقة في التسليم" : "Express Delivery Speed"}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {isRTL ? "مواعيد دقيقة وشحن سريع عبر شبكة رحلات يومية" : "Precise transit times with daily scheduled departures"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white/95 border border-orange-200/80 flex items-center justify-center text-[#C45B2A] shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-gray-950">
                  {isRTL ? "أمان وحماية شاملة" : "Complete Cargo Safety"}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {isRTL ? "تأمين معتمد ومتابعة دقيقة لكافة البضائع والطرود" : "Comprehensive insurance and strict security handling"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white/95 border border-orange-200/80 flex items-center justify-center text-[#C45B2A] shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-gray-950">
                  {isRTL ? "دعم لوجستي 24/7" : "24/7 Dedicated Support"}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {isRTL ? "فريق دعم ومتابعة متخصص جاهز لمساعدتكم على مدار الساعة" : "Specialized logistics desk ready to assist around the clock"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Column: Floating Register Card */}
        <div className="md:col-span-5 lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-orange-100/90 shadow-[0_20px_50px_rgba(37,21,22,0.1)] text-center space-y-3.5 relative z-20">
            {/* Top Accent Bar */}
            <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-[#C45B2A] rounded-full mx-auto -mt-1 mb-1 opacity-90" />

            {/* Emblem Badge */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C45B2A] to-[#E65100] flex items-center justify-center text-white mx-auto shadow-md shadow-orange-500/20">
              <Truck className="w-6 h-6" />
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-950 tracking-tight">
                {isRTL ? "إنشاء حساب جديد" : "Create an Account"}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {isRTL ? "سجّل بياناتك للبدء في حجز وإدارة شحناتك بسهولة" : "Fill in your details to start shipping effortlessly"}
              </p>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center gap-2 text-start animate-fade-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-start pt-1" noValidate>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  {isRTL ? "الاسم الكامل" : "Full Name"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    {...register("name", {
                      required: t("auth.validation.nameRequired") || (isRTL ? "الاسم بالكامل مطلوب" : "Full name is required"),
                      minLength: {
                        value: 2,
                        message: t("auth.validation.nameMin") || (isRTL ? "يجب ألا يقل الاسم عن حرفين" : "Name must be at least 2 characters"),
                      },
                    })}
                    placeholder={isRTL ? "مثال: أحمد محمد" : "e.g. John Doe"}
                    className={`w-full h-10 sm:h-11 rounded-xl ${
                      isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                    } bg-gray-50/90 border ${
                      errors.name ? "border-rose-400 bg-rose-50/20 focus:border-rose-500" : "border-gray-200 focus:border-[#C45B2A]"
                    } focus:bg-white text-xs sm:text-sm font-semibold text-gray-900 outline-none focus:ring-2 ${
                      errors.name ? "focus:ring-rose-500/20" : "focus:ring-orange-500/20"
                    } transition-all shadow-2xs`}
                  />
                  <User className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} w-4 h-4 text-gray-400 pointer-events-none`} />
                </div>
                {errors.name && (
                  <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1 animate-fade-up">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
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
                    placeholder={isRTL ? "name@example.com" : "name@example.com"}
                    className={`w-full h-10 sm:h-11 rounded-xl ${
                      isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                    } bg-gray-50/90 border ${
                      errors.email ? "border-rose-400 bg-rose-50/20 focus:border-rose-500" : "border-gray-200 focus:border-[#C45B2A]"
                    } focus:bg-white text-xs sm:text-sm font-semibold text-gray-900 outline-none focus:ring-2 ${
                      errors.email ? "focus:ring-rose-500/20" : "focus:ring-orange-500/20"
                    } transition-all shadow-2xs`}
                  />
                  <Mail className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} w-4 h-4 text-gray-400 pointer-events-none`} />
                </div>
                {errors.email && (
                  <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1 animate-fade-up">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
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
                    className={`w-full h-10 sm:h-11 rounded-xl ${
                      isRTL ? "pr-10 pl-10 text-right" : "pl-10 pr-10 text-left"
                    } bg-gray-50/90 border ${
                      errors.password ? "border-rose-400 bg-rose-50/20 focus:border-rose-500" : "border-gray-200 focus:border-[#C45B2A]"
                    } focus:bg-white text-xs sm:text-sm font-semibold text-gray-900 outline-none focus:ring-2 ${
                      errors.password ? "focus:ring-rose-500/20" : "focus:ring-orange-500/20"
                    } transition-all shadow-2xs`}
                  />
                  <Lock className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} w-4 h-4 text-gray-400 pointer-events-none`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? (t("auth.hidePassword") || "Hide password") : (t("auth.showPassword") || "Show password")}
                    className={`absolute ${isRTL ? "left-3" : "right-3"} text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1.5 transition-colors cursor-pointer`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1 animate-fade-up">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: t("auth.validation.confirmPasswordRequired") || (isRTL ? "يرجى تأكيد كلمة المرور" : "Please confirm your password"),
                      validate: (val) =>
                        val === passwordValue || (t("auth.validation.passwordMismatch") || (isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match")),
                    })}
                    placeholder="••••••••"
                    className={`w-full h-10 sm:h-11 rounded-xl ${
                      isRTL ? "pr-10 pl-10 text-right" : "pl-10 pr-10 text-left"
                    } bg-gray-50/90 border ${
                      errors.confirmPassword ? "border-rose-400 bg-rose-50/20 focus:border-rose-500" : "border-gray-200 focus:border-[#C45B2A]"
                    } focus:bg-white text-xs sm:text-sm font-semibold text-gray-900 outline-none focus:ring-2 ${
                      errors.confirmPassword ? "focus:ring-rose-500/20" : "focus:ring-orange-500/20"
                    } transition-all shadow-2xs`}
                  />
                  <Lock className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} w-4 h-4 text-gray-400 pointer-events-none`} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? (t("auth.hidePassword") || "Hide password") : (t("auth.showPassword") || "Show password")}
                    className={`absolute ${isRTL ? "left-3" : "right-3"} text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1.5 transition-colors cursor-pointer`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1 animate-fade-up">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.confirmPassword.message}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#C45B2A] via-[#D86227] to-[#E65100] hover:from-[#A8481B] hover:to-[#C45B2A] text-white font-bold text-sm shadow-[0_4px_16px_rgba(196,91,42,0.28)] hover:shadow-[0_6px_20px_rgba(196,91,42,0.38)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جاري إنشاء الحساب..." : "Creating Account..."}</span>
                  </>
                ) : (
                  <span>{isRTL ? "إنشاء الحساب" : "Create Account"}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2.5">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-gray-500 absolute">
                {isRTL ? "أو التسجيل عبر" : "Or sign up with"}
              </span>
            </div>

            {/* Social Auth */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full h-11 sm:h-12 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/90 text-gray-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs transition-all duration-200 hover:scale-[1.005] active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C45B2A]" />
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
                    <span>{isRTL ? "التسجيل باستخدام Google" : "Continue with Google"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium">
                {isRTL ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <Link
                  href={getLocalizedPath(redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login")}
                  className="text-[#C45B2A] font-bold hover:text-[#A8481B] hover:underline transition-colors"
                >
                  {isRTL ? "تسجيل الدخول" : "Log In"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center text-gray-500 text-sm font-semibold">...</div>}>
      <RegisterForm />
    </Suspense>
  );
}


