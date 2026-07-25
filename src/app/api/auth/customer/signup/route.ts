import { NextResponse } from "next/server";
import { customerSignupSchema } from "@/validators/auth.schema";
import { createSessionToken, getSessionCookieName, sessionCookieOptions } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { saveMemoryUser } from "@/lib/mock-user-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";

import { handleServerError } from "@/lib/error-handler";
import { sendFcmNotificationToRole } from "@/lib/notifications/fcm-server";

function normalizeMobile(value: string) {
  return value.replace(/[\s-]/g, "");
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.CUSTOMER_SIGNUP);
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const parsed = customerSignupSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
    }

    const mobileNumber = normalizeMobile(parsed.data.mobileNumber);
    let user: { id: string; fullName: string; mobileNumber: string; email: string | null; role: string; passwordHash?: string | null; languagePref?: string } | null = null;

    try {
      const existing = await prisma.user.findUnique({ where: { mobileNumber } });
      if (existing) {
        return NextResponse.json({ success: false, message: "An account already exists for this mobile number." }, { status: 409 });
      }

      // Email uniqueness check (only if email is provided)
      const email = parsed.data.email?.trim() || null;
      if (email) {
        const emailExists = await prisma.user.findFirst({ where: { email } });
        if (emailExists) {
          return NextResponse.json({ success: false, message: "This email is already registered with another account." }, { status: 409 });
        }
      }

      user = await prisma.user.create({
        data: {
          fullName: parsed.data.fullName.trim(),
          mobileNumber,
          email,
          passwordHash: await hashPassword(parsed.data.password),
          role: "CUSTOMER",
        },
      });
    } catch {
      // DB offline fallback
      const hash = await hashPassword(parsed.data.password);
      user = saveMemoryUser({
        id: `cust-${Date.now()}`,
        fullName: parsed.data.fullName.trim(),
        mobileNumber,
        email: null,
        role: "CUSTOMER",
        passwordHash: hash,
      });
    }

    const sessionPayload = {
      id: user.id,
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
      email: user.email || null,
      role: user.role as "ADMIN" | "CUSTOMER",
    };

    // Notify admins of new customer signup
    sendFcmNotificationToRole("ADMIN", {
      title: "New Customer Registered",
      body: `${user.fullName} registered an account.`,
      url: "/admin/bookings",
    }).catch((err) => console.error("[Signup] Admin FCM error:", err));

    const response = NextResponse.json(
      {
        success: true,
        user: {
          ...sessionPayload,
          languagePref: user.languagePref || "en",
        },
      },
      { status: 201 }
    );
    response.cookies.set(getSessionCookieName(), await createSessionToken(sessionPayload), sessionCookieOptions());
    return response;
  } catch (error) {
    return handleServerError("POST /api/auth/customer/signup", error, "Unable to create account. Please try again.");
  }
}
