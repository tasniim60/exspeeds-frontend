import { NextResponse } from "next/server";
import { generateDynamicOtp } from "@/lib/otpStore";
import { sendOtpViaEmailJS } from "@/lib/emailService";

export const dynamic = "force-dynamic";

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 1. Generate dynamic, randomized 6-digit OTP stored with expiry
    const { otp, token } = generateDynamicOtp(cleanEmail);

    // 2. Sync with Laravel Backend if online
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      await fetch(`${LARAVEL_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch {
      // Backend offline fallback: Handled by dynamic OTP store
    }

    // 3. Dispatch Dynamic OTP via EmailJS
    const emailResult = await sendOtpViaEmailJS({
      email: cleanEmail,
      otp,
      name: cleanEmail.split("@")[0],
    });

    if (!emailResult.success) {
      console.warn(`[Forgot Password] EmailJS dispatch issue: ${emailResult.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "A dynamic verification code has been sent to your email address via EmailJS.",
      email: cleanEmail,
      token,
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process forgot password request" },
      { status: 500 }
    );
  }
}
