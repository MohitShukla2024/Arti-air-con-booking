import { randomInt } from "crypto";
import { scrypt as scryptCallback, timingSafeEqual, randomBytes } from "crypto";
import { promisify } from "util";
import { getPrisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

function normalizeMobile(mobile: string): string {
  return mobile.replace(/[\s-]/g, "");
}

/**
 * Hash an OTP code with a random salt using scrypt.
 * OTP codes must NOT be stored as plaintext in the database.
 */
async function hashOtpCode(code: string): Promise<string> {
  const salt = randomBytes(8).toString("hex");
  const derivedKey = (await scrypt(code, salt, 32)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyOtpHash(inputCode: string, storedHash: string): Promise<boolean> {
  const [salt, storedKey] = storedHash.split(":");
  if (!salt || !storedKey) return false;
  try {
    const derivedKey = (await scrypt(inputCode, salt, 32)) as Buffer;
    const storedBuffer = Buffer.from(storedKey, "hex");
    return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Stores the HASHED code in the database for security — not plaintext (C-04).
 */
export async function generateOTP(mobileNumber: string): Promise<string> {
  const cleanMobile = normalizeMobile(mobileNumber);
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const codeHash = await hashOtpCode(code);

  const prisma = getPrisma();
  if (prisma) {
    try {
      // Upsert: replace any existing OTP for this number (prevents OTP accumulation)
      await (prisma as ReturnType<typeof getPrisma> & { otp: { upsert: Function } }).otp.upsert({
        where: { mobileNumber: cleanMobile },
        update: { codeHash, expiresAt, attempts: 0 },
        create: { mobileNumber: cleanMobile, codeHash, expiresAt },
      });
    } catch (err) {
      console.error("[OTP] Failed to persist OTP to database:", err);
      throw new Error("OTP service temporarily unavailable. Please try again.");
    }
  } else {
    throw new Error("OTP service requires database connection. Please try again.");
  }

  return code;
}

/**
 * Verify an OTP for a given mobile number against the database.
 * Uses timing-safe comparison to prevent timing attacks (C-04).
 */
export async function verifyOTP(
  mobileNumber: string,
  inputCode: string
): Promise<{ success: boolean; message: string }> {
  const cleanMobile = normalizeMobile(mobileNumber);

  const prisma = getPrisma();
  if (!prisma) {
    return { success: false, message: "OTP service temporarily unavailable. Please try again." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otpTable = (prisma as any).otp;
  if (!otpTable) {
    return { success: false, message: "OTP service not configured. Please try again." };
  }

  let record: { id: string; codeHash: string; expiresAt: Date; attempts: number } | null = null;
  try {
    record = await otpTable.findUnique({ where: { mobileNumber: cleanMobile } });
  } catch (err) {
    console.error("[OTP] DB read error:", err);
    return { success: false, message: "OTP service temporarily unavailable. Please try again." };
  }

  if (!record) {
    return { success: false, message: "No OTP requested for this phone number or OTP expired." };
  }

  if (new Date() > record.expiresAt) {
    await otpTable.delete({ where: { mobileNumber: cleanMobile } }).catch(() => {});
    return { success: false, message: "OTP code has expired. Please request a new one." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await otpTable.delete({ where: { mobileNumber: cleanMobile } }).catch(() => {});
    return { success: false, message: "Maximum verification attempts exceeded. Please request a new OTP." };
  }

  // Increment attempt count before verifying to prevent timing attacks on the counter
  try {
    await otpTable.update({
      where: { mobileNumber: cleanMobile },
      data: { attempts: { increment: 1 } },
    });
  } catch {
    // Non-critical: attempt count tracking failed, still proceed with verification
  }

  const isValid = await verifyOtpHash(inputCode.trim(), record.codeHash);
  if (!isValid) {
    return { success: false, message: "Invalid OTP code. Please check and try again." };
  }

  // OTP verified successfully — delete record to prevent replay attacks
  await otpTable.delete({ where: { mobileNumber: cleanMobile } }).catch(() => {});
  return { success: true, message: "OTP verified successfully." };
}
