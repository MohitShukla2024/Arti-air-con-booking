import { NextResponse } from "next/server";
import { customerLoginSchema } from "@/validators/auth.schema";
import { createSessionToken, getSessionCookieName, sessionCookieOptions } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { findMemoryUser } from "@/lib/mock-user-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";
import { handleServerError } from "@/lib/error-handler";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.CUSTOMER_LOGIN);
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const parsed = customerLoginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });

    const cleanMobile = parsed.data.mobileNumber.replace(/[\s-]/g, "");
    let user: { id: string; fullName: string; mobileNumber: string; email: string | null; role: string; passwordHash?: string | null; languagePref?: string } | null = null;

    try {
      user = await prisma.user.findUnique({ where: { mobileNumber: cleanMobile } });
    } catch {
      // DB offline fallback
    }

    // 1. Check DB User
    if (user && user.role === "CUSTOMER") {
      if (user.passwordHash && (await verifyPassword(parsed.data.password, user.passwordHash))) {
        const sessionPayload = {
          id: user.id,
          fullName: user.fullName,
          mobileNumber: user.mobileNumber,
          email: user.email,
          role: user.role as "ADMIN" | "CUSTOMER",
        };
        const response = NextResponse.json({
          success: true,
          user: {
            ...sessionPayload,
            languagePref: user.languagePref || "en",
          },
        });
        response.cookies.set(getSessionCookieName(), await createSessionToken(sessionPayload), sessionCookieOptions());
        return response;
      }
      // Password mismatch
      return NextResponse.json({ success: false, message: "Invalid mobile number or password." }, { status: 401 });
    }

    // 2. Check Memory User (Offline / Demo mode)
    const memoryUser = findMemoryUser(cleanMobile);
    if (memoryUser && memoryUser.role === "CUSTOMER") {
      if (memoryUser.passwordHash && (await verifyPassword(parsed.data.password, memoryUser.passwordHash))) {
        const response = NextResponse.json({ success: true, user: memoryUser });
        response.cookies.set(getSessionCookieName(), await createSessionToken(memoryUser), sessionCookieOptions());
        return response;
      }
    }

    // Invalid credentials
    return NextResponse.json({ success: false, message: "Invalid mobile number or password." }, { status: 401 });
  } catch (error) {
    return handleServerError("POST /api/auth/customer/login", error, "Unable to sign in. Please try again.");
  }
}
