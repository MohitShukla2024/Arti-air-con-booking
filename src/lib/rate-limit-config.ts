/**
 * Centralized Rate Limiting Configuration
 *
 * Enforces production security thresholds across all sensitive API routes:
 * - Login (Customer): 5 requests per 15 minutes
 * - Signup (Customer & Admin): 3 requests per hour
 * - Admin Login: 5 requests per 30 minutes
 * - OTP (Send & Verify): 5 requests per 15 minutes
 * - Booking (Create & Cancel): 10 requests per hour
 * - Contact / Settings API: 5 requests per hour
 */

export interface RateLimitRule {
  /** Unique key prefix for the rate limiting rule */
  prefix: string;
  /** Maximum number of allowed requests within the time window */
  limit: number;
  /** Time window duration in milliseconds */
  windowMs: number;
  /** Human-readable action description for error messages */
  actionName: string;
}

export const RATE_LIMIT_CONFIGS = {
  /** Customer Login: 5 requests per 15 minutes */
  CUSTOMER_LOGIN: {
    prefix: "cust_login",
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    actionName: "login attempts",
  },

  /** Customer & Admin Signup: 3 requests per hour */
  CUSTOMER_SIGNUP: {
    prefix: "cust_signup",
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    actionName: "account registrations",
  },

  /** Admin Login: 5 requests per 30 minutes */
  ADMIN_LOGIN: {
    prefix: "admin_login",
    limit: 5,
    windowMs: 30 * 60 * 1000, // 30 minutes
    actionName: "admin login attempts",
  },

  /** OTP Requests (Send / Verify): 5 requests per 15 minutes */
  OTP_API: {
    prefix: "otp_api",
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    actionName: "OTP requests",
  },

  /** Create Booking: 10 requests per hour */
  BOOKING_CREATE: {
    prefix: "booking_create",
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    actionName: "booking creations",
  },

  /** Cancel Booking: 10 requests per hour */
  BOOKING_CANCEL: {
    prefix: "booking_cancel",
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    actionName: "booking cancellations",
  },

  /** Contact / Settings API: 5 requests per hour */
  CONTACT_SETTINGS: {
    prefix: "contact_settings",
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    actionName: "settings modifications",
  },

  /** FCM Token Registration: 10 registrations per user per hour */
  FCM_TOKEN_REGISTER: {
    prefix: "fcm_register",
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    actionName: "token registrations",
  },
} as const satisfies Record<string, RateLimitRule>;
