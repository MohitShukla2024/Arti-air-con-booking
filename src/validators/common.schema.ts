import { z } from "zod";
import { sanitizeString } from "@/lib/sanitizer";

/**
 * Reusable primitive Zod validators adhering to strict security and validation constraints
 */

/** Name / Full Name Validator */
export const nameSchema = z
  .string()
  .transform((val) => sanitizeString(val))
  .pipe(
    z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must not exceed 50 characters.")
      .regex(/^[a-zA-Z\s'-]+$/, "Name must contain only letters, spaces, hyphens, or apostrophes.")
  );

/** Mobile Phone Number Validator (10 digits) */
export const phoneSchema = z
  .string()
  .transform((val) => val.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .length(10, "Phone number must contain exactly 10 digits.")
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.")
  );

/** Alternate Mobile Phone Number Validator (Optional) */
export const altPhoneSchema = z
  .string()
  .transform((val) => val.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .length(10, "Alternate phone number must contain exactly 10 digits.")
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.")
  )
  .optional()
  .or(z.literal(""));

/** Email Address Validator */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.");

/** Optional Email Validator */
export const optionalEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .optional()
  .or(z.literal(""));

/** Password Validator (Complexity Enforcement) */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64, "Password must not exceed 64 characters.")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must contain at least one lowercase letter.",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Password must contain at least one number.",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Password must contain at least one special character.",
  });

/** Full Address Validator */
export const addressSchema = z
  .string()
  .transform((val) => sanitizeString(val))
  .pipe(
    z
      .string()
      .min(10, "Address must be at least 10 characters.")
      .max(200, "Address must not exceed 200 characters.")
  );

/** City Validator (Alphabetic only) */
export const citySchema = z
  .string()
  .transform((val) => sanitizeString(val))
  .pipe(
    z
      .string()
      .min(2, "City is required.")
      .max(50, "City must not exceed 50 characters.")
      .regex(/^[a-zA-Z\s]+$/, "City must contain letters only.")
  );

/** Pincode Validator (Exactly 6 digits) */
export const pincodeSchema = z
  .string()
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .length(6, "Pincode must contain exactly 6 digits.")
      .regex(/^\d{6}$/, "Pincode must contain numeric digits only.")
  );

/** Problem Description Validator */
export const problemDescriptionSchema = z
  .string()
  .transform((val) => sanitizeString(val))
  .pipe(
    z
      .string()
      .min(20, "Problem description must be at least 20 characters.")
      .max(500, "Problem description must not exceed 500 characters.")
  );

/** Optional Problem Description Validator */
export const optionalProblemDescriptionSchema = z
  .string()
  .transform((val) => sanitizeString(val))
  .pipe(
    z
      .string()
      .max(500, "Problem description must not exceed 500 characters.")
  )
  .optional()
  .or(z.literal(""));

/** OTP Code Validator (Exactly 6 digits) */
export const otpCodeSchema = z
  .string()
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .length(6, "OTP code must contain exactly 6 digits.")
      .regex(/^\d{6}$/, "OTP must contain numeric digits only.")
  );
