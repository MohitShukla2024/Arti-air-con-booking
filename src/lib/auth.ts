const SESSION_COOKIE = "arti_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type SessionUser = {
  id: string;
  role: "ADMIN" | "CUSTOMER";
  fullName: string;
  mobileNumber: string;
  email: string | null;
};

type SessionPayload = SessionUser & { exp: number };

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL: SESSION_SECRET environment variable is missing in production!");
  }
  if (secret && secret.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL: SESSION_SECRET must be at least 32 characters long in production!");
  }
  return secret || "arti-air-con-super-secret-key-development-2026-secure-32chars";
}

function base64urlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64url");
  }
  return btoa(encodeURIComponent(str)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64url").toString("utf8");
  }
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(atob(base64));
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Standard Web Crypto API HMAC-SHA256 Signature (Compatible with Node.js & Edge Runtime)
 */
async function computeSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return bufferToBase64Url(signature);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload: SessionPayload = { ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encoded = base64urlEncode(JSON.stringify(payload));
  const signature = await computeSignature(encoded, getSessionSecret());
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const expectedSignature = await computeSignature(encoded, getSessionSecret());
    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64urlDecode(encoded)) as SessionPayload;
    const { exp, ...user } = payload;
    if (!payload.id || !payload.role || exp <= Math.floor(Date.now() / 1000)) return null;
    return user as SessionUser;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(remember?: boolean) {
  const maxAge = remember === false ? undefined : remember === true ? 7 * 24 * 60 * 60 : SESSION_TTL_SECONDS;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
