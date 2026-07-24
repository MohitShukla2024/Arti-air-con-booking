import { NextResponse } from "next/server";
import { type RateLimitRule } from "./rate-limit-config";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window store with automatic garbage collection
const rateLimitTracker = new Map<string, RateLimitRecord>();

// Periodically clean up expired keys every 60 seconds
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitTracker.entries()) {
      if (now > record.resetTime) {
        rateLimitTracker.delete(key);
      }
    }
  }, 60 * 1000);
  timer.unref?.();
}

/**
 * Extract client IP address from standard proxy headers
 */
export function getClientIP(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (cfIp) return cfIp.trim();
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Result returned by the rate limit evaluation
 */
export interface RateLimitCheckResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  response?: NextResponse;
}

/**
 * Evaluates rate limit for a request against a given rule.
 *
 * @param request Standard Fetch / NextRequest object
 * @param rule Rate limit configuration rule (prefix, limit, windowMs)
 * @param userId Optional authenticated user ID for user-specific rate limiting
 */
export function checkRateLimit(
  request: Request,
  rule: RateLimitRule,
  userId?: string | null
): RateLimitCheckResult {
  // Allow bypassing rate limits in local testing environments if explicitly set
  if (process.env.RATE_LIMIT_DISABLED === "true") {
    return {
      allowed: true,
      limit: rule.limit,
      remaining: rule.limit,
      resetTime: Date.now() + rule.windowMs,
    };
  }

  const clientIP = getClientIP(request);
  const identifier = userId ? `user:${userId}` : `ip:${clientIP}`;
  const key = `${rule.prefix}:${identifier}`;

  const now = Date.now();
  let record = rateLimitTracker.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + rule.windowMs,
    };
    rateLimitTracker.set(key, record);

    return {
      allowed: true,
      limit: rule.limit,
      remaining: rule.limit - 1,
      resetTime: record.resetTime,
    };
  }

  if (record.count >= rule.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    const resetDateString = new Date(record.resetTime).toUTCString();

    const response = NextResponse.json(
      {
        success: false,
        error: "Too Many Requests",
        message: `Too many ${rule.actionName}. Please try again in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfterSeconds.toString(),
          "X-RateLimit-Limit": rule.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(record.resetTime / 1000).toString(),
          "X-RateLimit-Reset-Date": resetDateString,
        },
      }
    );

    return {
      allowed: false,
      limit: rule.limit,
      remaining: 0,
      resetTime: record.resetTime,
      response,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, rule.limit - record.count);

  return {
    allowed: true,
    limit: rule.limit,
    remaining,
    resetTime: record.resetTime,
  };
}
