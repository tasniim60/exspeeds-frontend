"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe2,
  Clock,
  ThumbsUp,
  Box,
  MonitorCheck,
  RotateCw,
  Send,
  Sparkles,
  Loader2,
  Headphones,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

interface RequestCodeInputs {
  email: string;
}

interface ResetPasswordInputs {
  code: string;
  password: string;
  confirmPassword: string;
}

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const initialEmail = searchParams.get("email") || "";

  const { t, isRTL, getLocalizedPath } = useLanguage();
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [targetEmail, setTargetEmail] = useState(initialEmail);
  const [generatedToken, setGeneratedToken] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1 Form
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest, isSubmitting: isSubmittingRequest },
  } = useForm<RequestCodeInputs>({
    mode: "onTouched",
    defaultValues: {
      email: initialEmail,
    },
  });

  // Step 2 Form
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    watch: watchReset,
    formState: { errors: errorsReset, isSubmitting: isSubmittingReset },
  } = useForm<ResetPasswordInputs>({
    mode: "onTouched",
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watchReset("password");

  const onRequestCode = async (data: RequestCodeInputs) => {
    setServerError(null);
    setSuccessInfo(null);
    const cleanEmail = data.email.trim().toLowerCase();
    setTargetEmail(cleanEmail);

    const res = await forgotPassword(cleanEmail);
    if (res.success) {
      setGeneratedToken(res.token || "");
      setResendCooldown(60);
      setStep("reset");
      setSuccessInfo(
        isRTL
          ? `تم إرسال رمز التحقق الديناميكي إلى ${cleanEmail} بنجاح.`
          : `A dynamic verification OTP has been sent to ${cleanEmail}.`
      );
    } else {
      setServerError(res.message || "Failed to process forgot password request.");
    }
  };

  const onResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setServerError(null);

    const res = await forgotPassword(targetEmail);
    setIsResending(false);

    if (res.success) {
      setGeneratedToken(res.token || "");
      setResendCooldown(60);
      setSuccessInfo(
        isRTL
          ? `تم إعادة إرسال رمز تحقق جديد إلى ${targetEmail}.`
          : `A fresh verification OTP has been sent to ${targetEmail}.`
      );
    } else {
      setServerError(res.message || "Failed to resend verification code.");
    }
  };

  const onResetPassword = async (data: ResetPasswordInputs) => {
    setServerError(null);

    const res = await resetPassword({
      email: targetEmail,
      token: data.code.trim() || generatedToken,
      password: data.password,
    });

    if (res.success) {
      setStep("success");
    } else {
      setServerError(res.message || "Invalid or expired verification code. Please try again.");
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
        {/* Left Column: Explanatory Content */}
        <div className="md:col-span-7 lg:col-span-6 flex flex-col space-y-6 text-start">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 self-start bg-white/90 backdrop-blur-md border border-orange-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C45B2A]" />
            <span className="text-xs font-bold text-gray-800">
              {isRTL ? "استعادة الوصول الآمن للحساب" : "Secure Account Recovery"}
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-gray-950 leading-[1.18] tracking-tight">
              {isRTL ? "استعادة حسابك بسهولة وأمان" : "Recover Your Account Safely"}
              <span className="text-[#C45B2A] block mt-1">
                {isRTL ? "مع منصة XSPEED اللوجستية" : "With XSPEED Logistics"}
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium max-w-lg">
              {isRTL
                ? "نحن نحمي بياناتك وحسابك اللوجستي بأعلى معايير التشفير والأمان. اتبع الخطوات السريعة لتعيين كلمة مرور جديدة ومتابعة شحناتك."
                : "We safeguard your freight and logistics account with enterprise-grade encryption. Follow the quick steps to set a new password."}
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-3.5 pt-2 max-w-md">
            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white/95 border border-orange-200/80 flex items-center justify-center text-[#C45B2A] shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-gray-950">
                  {isRTL ? "تشفير وحماية ديناميكية (OTP)" : "Secure Dynamic OTP Verification"}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {isRTL ? "رموز أمان ديناميكية ومؤقتة لكل عملية استعادة لحماية حسابك" : "Dynamic, one-time verification codes sent securely to your email"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white/95 border border-orange-200/80 flex items-center justify-center text-[#C45B2A] shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-gray-950">
                  {isRTL ? "سرعة وسهولة في الاستعادة" : "Fast & Effortless Recovery"}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {isRTL ? "خطوتين فقط لإعادة تعيين كلمة المرور واستئناف إدارة الشحنات" : "Only 2 quick steps to regain access and manage your consignments"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white/95 border border-orange-200/80 flex items-center justify-center text-[#C45B2A] shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="text-sm font-bold text-gray-950">
                  {isRTL ? "دعم ومساعدة فورية 24/7" : "24/7 Support Assistance"}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {isRTL ? "فريق خدمة العملاء جاهز لمساعدتك في حال واجهت أي صعوبة" : "Our dedicated support team is available to assist you anytime"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Card */}
        <div className="md:col-span-5 lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-orange-100/90 shadow-[0_20px_50px_rgba(37,21,22,0.1)] text-center space-y-4 relative z-20">
            {/* Top Accent Bar */}
            <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-[#C45B2A] rounded-full mx-auto -mt-1 mb-1 opacity-90" />

            {/* Emblem Badge */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C45B2A] to-[#E65100] flex items-center justify-center text-white mx-auto shadow-md shadow-orange-500/20">
              <KeyRound className="w-6 h-6" />
            </div>

            {/* Header Titles */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-950 tracking-tight">
                {step === "success"
                  ? isRTL ? "تم تعيين كلمة المرور!" : "Password Reset Complete!"
                  : step === "reset"
                  ? isRTL ? "تعيين كلمة المرور الجديدة" : "Set New Password"
                  : t("auth.forgotPasswordTitle") || (isRTL ? "استعادة كلمة المرور" : "Reset Your Password")}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {step === "success"
                  ? isRTL ? "تم تحديث كلمة المرور الخاصة بحسابك بنجاح" : "Your account password has been updated"
                  : step === "reset"
                  ? isRTL ? `أدخل رمز التحقق (OTP) المرسل إلى ${targetEmail}` : `Enter the verification OTP sent to ${targetEmail}`
                  : t("auth.forgotPasswordSubtitle") || (isRTL ? "أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز الاستعادة" : "Enter your registered email address to receive an OTP")}
              </p>
            </div>

            {/* Success Info Banner */}
            {successInfo && step === "reset" && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 text-start animate-fade-up">
                <Send className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successInfo}</span>
              </div>
            )}

            {/* Error Banner */}
            {serverError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 text-start animate-fade-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{serverError}</span>
              </div>
            )}

            {/* STEP 1: REQUEST CODE */}
            {step === "request" && (
              <form onSubmit={handleSubmitRequest(onRequestCode)} className="space-y-3.5 text-start pt-1" noValidate>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    {isRTL ? "البريد الإلكتروني المسجل" : "Registered Email Address"}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      {...registerRequest("email", {
                        required: t("auth.validation.emailRequired") || (isRTL ? "البريد الإلكتروني مطلوب" : "Email address is required"),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t("auth.validation.emailInvalid") || (isRTL ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address"),
                        },
                      })}
                      placeholder={isRTL ? "name@example.com" : "name@example.com"}
                      className={`w-full h-11 sm:h-12 rounded-xl ${
                        isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                      } bg-gray-50/90 border ${
                        errorsRequest.email ? "border-rose-400 bg-rose-50/20 focus:border-rose-500" : "border-gray-200 focus:border-[#C45B2A]"
                      } focus:bg-white text-xs sm:text-sm font-semibold text-gray-900 outline-none focus:ring-2 ${
                        errorsRequest.email ? "focus:ring-rose-500/20" : "focus:ring-orange-500/20"
                      } transition-all shadow-2xs`}
                    />
                    <Mail className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} w-4 h-4 text-gray-400 pointer-events-none`} />
                  </div>
                  {errorsRequest.email && (
                    <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1 animate-fade-up">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorsRequest.email.message}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#C45B2A] via-[#D86227] to-[#E65100] hover:from-[#A8481B] hover:to-[#C45B2A] text-white font-bold text-sm shadow-[0_4px_16px_rgba(196,91,42,0.28)] hover:shadow-[0_6px_20px_rgba(196,91,42,0.38)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmittingRequest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("auth.sendingResetCodeBtn") || (isRTL ? "جاري إرسال رمز OTP..." : "Sending OTP...")}</span>
                    </>
                  ) : (
                    <span>{t("auth.sendResetCodeBtn") || (isRTL ? "إرسال رمز التحقق (OTP)" : "Send Verification Code")}</span>
                  )}
                </button>

                <div className="text-center pt-3 border-t border-gray-100">
                  <Link
                    href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"}
                    className="inline-flex items-center gap-1.5 text-xs text-[#C45B2A] font-bold hover:text-[#A8481B] hover:underline transition-colors"
                  >
                    {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                    <span>{t("auth.backToLogin") || (isRTL ? "العودة لتسجيل الدخول" : "Back to Sign In")}</span>
                  </Link>
                </div>
              </form>
            )}

            {/* STEP 2: ENTER OTP & SET NEW PASSWORD */}
            {step === "reset" && (
              <form onSubmit={handleSubmitReset(onResetPassword)} className="space-y-3.5 text-start pt-1" noValidate>
                {/* Dynamic OTP Code Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      {t("auth.resetCodeLabel") || (isRTL ? "رمز التحقق OTP (6 أرقام)" : "6-Digit OTP Code")}
                    </label>
                    <button
                      type="button"
                      onClick={onResendCode}
                      disabled={resendCooldown > 0 || isResending}
                      className="text-xs font-bold text-[#C45B2A] hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <RotateCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                      <span>
                        {resendCooldown > 0
                          ? isRTL ? `إعادة الإرسال بعد (${resendCooldown}s)` : `Resend in (${resendCooldown}s)`
                          : isRTL ? "إعادة إرسال الرمز" : "Resend OTP"}
                      </span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      maxLength={6}
                      {...registerReset("code", {
                        required: t("auth.validation.codeRequired") || (isRTL ? "رمز التحقق مطلوب" : "Verification OTP is required"),
                        minLength: {
                          value: 6,
                          message: isRTL ? "يجب إدخال الرمز المكون من 6 أرقام" : "Please enter the 6-digit OTP code",
                        },
                      })}
                      placeholder={t("auth.resetCodePlaceholder") || "مثال: 123456"}
                      className={`w-full h-11 sm:h-12 rounded-xl ${
                        isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                      } bg-gray-50/90 border ${
                        errorsReset.code ? "border-rose-400 bg-rose-50/20 focus:border-rose-500" : "border-gray-200 focus:border-[#C45B2A]"
                      } focus:bg-white text-sm font-mono font-bold tracking-widest text-gray-900 outline-none focus:ring-2 ${
                        errorsReset.code ? "focus:ring-rose-500/20" : "focus:ring-orange-500/20"
                      } transition-all shadow-2xs`}
                    />
                    <KeyRound className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} w-4 h-4 text-gray-400 pointer-events-none`} />
                  </div>
                  {errorsReset.code && (
                    <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1 animate-fade-up">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorsReset.code.message}</span>
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    {t("client.profile.newPasswordLabel") || (isRTL ? "كلمة المرور الجديدة" : "New Password")}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...registerReset("password", {
                        required: t("auth.validation.passwordRequired") || (isRTL ? "كلمة المرور مطلوبة" : "Password is required"),
                        minLength: {
                          value: 6,
                          message: t("auth.validation.passwordMin") || (isRTL ? "يجب ألا تقل كلمة المرور عن 6 خانات" : "Password must be at least 6 characters"),
                        },
                      })}
                      placeholder="••••••••"
                      className={`w-full h-11 sm:h-12 rounded-xl ${
                        isRTL ? "pr-10 pl-10 text-right" : "pl-10 pr-10 text-left"
                      } bg-gray-50/90 border ${
                        errorsReset.password ? "border-rose-400 bg-rose-50/20 focus:border-rose-500" : "border-gray-200 focus:border-[#C45B2A]"
                      } focus:bg-white text-xs sm:text-sm font-semibold text-gray-900 outline-none focus:ring-2 ${
                        errorsReset.password ? "focus:ring-rose-500/20" : "focus:ring-orange-500/20"
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
                  {errorsReset.password && (
                    <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1 animate-fade-up">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorsReset.password.message}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    {t("client.profile.confirmPasswordLabel") || (isRTL ? "تأكيد كلمة المرور" : "Confirm Password")}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerReset("confirmPassword", {
                        required: t("auth.validation.confirmPasswordRequired") || (isRTL ? "يرجى تأكيد كلمة المرور" : "Please confirm your password"),
                        validate: (val) =>
                          val === newPasswordValue || (t("auth.validation.passwordMismatch") || (isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match")),
                      })}
                      placeholder="••••••••"
                      className={`w-full h-11 sm:h-12 rounded-xl ${
                        isRTL ? "pr-10 pl-10 text-right" : "pl-10 pr-10 text-left"
                      } bg-gray-50/90 border ${
                        errorsReset.confirmPassword ? "border-rose-400 bg-rose-50/20 focus:border-rose-500" : "border-gray-200 focus:border-[#C45B2A]"
                      } focus:bg-white text-xs sm:text-sm font-semibold text-gray-900 outline-none focus:ring-2 ${
                        errorsReset.confirmPassword ? "focus:ring-rose-500/20" : "focus:ring-orange-500/20"
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
                  {errorsReset.confirmPassword && (
                    <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1 animate-fade-up">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorsReset.confirmPassword.message}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#C45B2A] via-[#D86227] to-[#E65100] hover:from-[#A8481B] hover:to-[#C45B2A] text-white font-bold text-sm shadow-[0_4px_16px_rgba(196,91,42,0.28)] hover:shadow-[0_6px_20px_rgba(196,91,42,0.38)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmittingReset ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("auth.resettingPasswordBtn") || (isRTL ? "جاري حفظ كلمة المرور..." : "Resetting Password...")}</span>
                    </>
                  ) : (
                    <span>{t("auth.resetPasswordBtn") || (isRTL ? "تعيين كلمة المرور الجديدة" : "Set New Password")}</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setServerError(null);
                      setSuccessInfo(null);
                    }}
                    className="text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
                  >
                    {isRTL ? "تغيير البريد الإلكتروني" : "Change Email"}
                  </button>
                  <Link
                    href={getLocalizedPath(redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login")}
                    className="text-[#C45B2A] font-bold hover:text-[#A8481B] hover:underline transition-colors"
                  >
                    {t("auth.backToLogin") || (isRTL ? "تسجيل الدخول" : "Sign In")}
                  </Link>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {step === "success" && (
              <div className="py-4 space-y-4 animate-fade-up">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-950">
                    {t("auth.resetPasswordSuccess") || (isRTL ? "تمت استعادة كلمة المرور بنجاح!" : "Password Reset Successfully!")}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isRTL
                      ? "تم تعيين كلمة المرور الجديدة بنجاح. يمكنك الآن تسجيل الدخول إلى حسابك ومتابعة شحناتك."
                      : "Your new password has been saved. You can now sign in to your account and manage shipments."}
                  </p>
                </div>
                <Link
                  href={getLocalizedPath(redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login")}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#C45B2A] via-[#D86227] to-[#E65100] hover:from-[#A8481B] hover:to-[#C45B2A] text-white font-bold text-sm shadow-[0_4px_16px_rgba(196,91,42,0.28)] hover:shadow-[0_6px_20px_rgba(196,91,42,0.38)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                >
                  <span>{isRTL ? "تسجيل الدخول الآن" : "Sign In Now"}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center text-gray-500 text-sm font-semibold">...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

