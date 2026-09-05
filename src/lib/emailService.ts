/**
 * EmailJS Delivery Service for Dynamic OTP and Notifications
 * Dispatches transactional emails via EmailJS REST API.
 */

export interface SendOtpEmailParams {
  email: string;
  otp: string;
  name?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  provider: "emailjs" | "fallback";
  message: string;
  error?: any;
}

/**
 * Send dynamic OTP to recipient via EmailJS
 */
export async function sendOtpViaEmailJS(params: SendOtpEmailParams): Promise<EmailDeliveryResult> {
  const { email, otp, name } = params;
  const cleanEmail = (email || "").trim().toLowerCase();
  const displayName = name || cleanEmail.split("@")[0];

  const serviceId = (
    process.env.EMAILJS_SERVICE_ID ||
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
    "service_k3t4f1l"
  ).trim();

  const templateId = (
    process.env.EMAILJS_TEMPLATE_ID ||
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
    "template_bkvfpjs"
  ).trim();

  const publicKey = (
    process.env.EMAILJS_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
    process.env.EMAILJS_USER_ID ||
    "o3tGynAtaVN-kFb7B"
  ).trim();

  const privateKey = (process.env.EMAILJS_PRIVATE_KEY || "lHkgkB9tjisWsNR28-8gP").trim();

  // Comprehensive template variable mapping to match any custom template configuration
  const templateParams: Record<string, string> = {
    to_email: cleanEmail,
    email: cleanEmail,
    recipient_email: cleanEmail,
    user_email: cleanEmail,
    to_name: displayName,
    user_name: displayName,
    name: displayName,
    otp: otp,
    otp_code: otp,
    code: otp,
    passcode: otp,
    verification_code: otp,
    message: `Your XSPEED verification code is: ${otp}. This code is valid for 15 minutes.`,
    expiry_minutes: "15",
    company_name: "XSPEED Express Logistics",
    support_email: "support@exspeeds.com",
    reply_to: "support@exspeeds.com",
    date_time: new Date().toLocaleString(),
    year: new Date().getFullYear().toString(),
  };

  const payload: any = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams,
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  try {
    const origin =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        Origin: origin,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (response.ok) {
      console.log(`[EmailJS] Dynamic OTP successfully dispatched to ${cleanEmail}`);
      return {
        success: true,
        provider: "emailjs",
        message: `OTP email successfully sent to ${cleanEmail}`,
      };
    } else {
      console.error(
        `[EmailJS] Dispatch failed with status ${response.status}: ${responseText}`
      );
      return {
        success: false,
        provider: "emailjs",
        message: `EmailJS responded with status ${response.status}: ${responseText}`,
        error: responseText,
      };
    }
  } catch (err: any) {
    console.error("[EmailJS] Request exception:", err.message);
    return {
      success: false,
      provider: "fallback",
      message: `Failed to send email: ${err.message}`,
      error: err.message,
    };
  }
}
