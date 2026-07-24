import { randomInt } from "crypto";

interface OTPRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP store with TTL expiration and attempt limiting
const otpMap = new Map<string, OTPRecord>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

function normalizeMobile(mobile: string): string {
  return mobile.replace(/[\s-]/g, "");
}

/**
 * Generate a cryptographically secure 6-digit OTP for a given mobile number
 */
export function generateOTP(mobileNumber: string): string {
  const cleanMobile = normalizeMobile(mobileNumber);
  const code = randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + OTP_TTL_MS;

  otpMap.set(cleanMobile, {
    code,
    expiresAt,
    attempts: 0,
  });

  return code;
}

/**
 * Verify an OTP for a given mobile number
 */
export function verifyOTP(mobileNumber: string, inputCode: string): { success: boolean; message: string } {
  const cleanMobile = normalizeMobile(mobileNumber);
  const record = otpMap.get(cleanMobile);

  if (!record) {
    return { success: false, message: "No OTP requested for this phone number or OTP expired." };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(cleanMobile);
    return { success: false, message: "OTP code has expired. Please request a new one." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpMap.delete(cleanMobile);
    return { success: false, message: "Maximum verification attempts exceeded. Please request a new OTP." };
  }

  record.attempts += 1;

  if (record.code !== inputCode.trim()) {
    return { success: false, message: "Invalid OTP code. Please check and try again." };
  }

  // OTP verified successfully - invalidate to prevent replay attacks
  otpMap.delete(cleanMobile);
  return { success: true, message: "OTP verified successfully." };
}
