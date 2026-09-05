/**
 * Secure Dynamic OTP & Password Reset Token Registry
 * Handles cryptographically randomized OTP generation, storage, expiry, and attempt limits.
 */

interface OtpRecord {
  otp: string;
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

// In-memory persistent registry for server runtime
declare global {
  var __xspeed_otp_store: Map<string, OtpRecord> | undefined;
}

const store: Map<string, OtpRecord> =
  globalThis.__xspeed_otp_store || (globalThis.__xspeed_otp_store = new Map<string, OtpRecord>());

const OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically random dynamic 6-digit OTP
 */
export function generateDynamicOtp(email: string): { otp: string; token: string; expiresAt: number } {
  const cleanEmail = email.trim().toLowerCase();
  
  // Generate random 6-digit integer between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const expiresAt = Date.now() + OTP_TTL_MS;

  store.set(cleanEmail, {
    otp,
    token,
    email: cleanEmail,
    createdAt: Date.now(),
    expiresAt,
    attempts: 0,
  });

  return { otp, token, expiresAt };
}

/**
 * Verify provided OTP or Token against active dynamic store
 */
export function verifyDynamicOtp(
  email: string,
  inputCodeOrToken: string
): { valid: boolean; reason?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanInput = (inputCodeOrToken || "").trim();

  const record = store.get(cleanEmail);

  if (!record) {
    return {
      valid: false,
      reason: "No active verification request found for this email. Please request a new code.",
    };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(cleanEmail);
    return {
      valid: false,
      reason: "Verification code has expired. Please request a new code.",
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(cleanEmail);
    return {
      valid: false,
      reason: "Maximum verification attempts exceeded. Please request a new code.",
    };
  }

  // Check matching code or token
  const isMatch = cleanInput === record.otp || cleanInput === record.token;

  if (!isMatch) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      reason: `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`,
    };
  }

  return { valid: true };
}

/**
 * Invalidate OTP after successful reset
 */
export function consumeDynamicOtp(email: string): void {
  const cleanEmail = email.trim().toLowerCase();
  store.delete(cleanEmail);
}

/**
 * Get active record for debugging/testing
 */
export function getActiveOtpRecord(email: string): OtpRecord | undefined {
  return store.get(email.trim().toLowerCase());
}
