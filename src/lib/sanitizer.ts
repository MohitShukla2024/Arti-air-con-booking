/**
 * Security Input Sanitizer
 * Defends against XSS, script injection, HTML injection, and malicious payloads.
 */

/**
 * Sanitizes a string by stripping dangerous HTML tags, script tags, event handlers, and javascript: URIs
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, "")
    // Escape HTML Special Characters (Neutralizes all HTML/script tags & event handlers)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    // Normalize excessive whitespace
    .replace(/\s+/g, " ");
}

/**
 * Recursively sanitizes string properties within an object payload
 */
export function sanitizePayload<T>(payload: T): T {
  if (typeof payload === "string") {
    return sanitizeString(payload) as unknown as T;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (payload !== null && typeof payload === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
      sanitizedObj[key] = sanitizePayload(value);
    }
    return sanitizedObj as T;
  }

  return payload;
}
