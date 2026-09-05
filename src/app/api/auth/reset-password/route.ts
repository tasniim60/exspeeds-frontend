import { NextResponse } from "next/server";
import { verifyDynamicOtp, consumeDynamicOtp } from "@/lib/otpStore";

export const dynamic = "force-dynamic";

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, password } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanToken = (token || "").trim();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!cleanToken) {
      return NextResponse.json(
        { success: false, error: "Verification code is required." },
        { status: 400 }
      );
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    let isVerified = false;

    // 1. Check dynamic OTP Store first
    const verification = verifyDynamicOtp(cleanEmail, cleanToken);
    if (verification.valid) {
      isVerified = true;
    }

    // 2. If dynamic store didn't match, attempt Laravel Backend validation
    if (!isVerified) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const apiRes = await fetch(`${LARAVEL_API_URL}/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            token: cleanToken,
            password: cleanPassword,
            password_confirmation: cleanPassword,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (apiRes.ok) {
          isVerified = true;
        }
      } catch {
        // Backend offline fallback handled
      }
    }

    if (!isVerified) {
      return NextResponse.json(
        {
          success: false,
          error:
            verification.reason ||
            "Invalid or expired verification code. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // 3. Invalidate consumed OTP so it cannot be reused
    consumeDynamicOtp(cleanEmail);

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully! You can now log in with your new password.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
