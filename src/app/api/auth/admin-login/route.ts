import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/validators/auth.schema";
import { createSessionToken, getSessionCookieName, sessionCookieOptions } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { findMemoryUser } from "@/lib/mock-user-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";
import { handleServerError } from "@/lib/error-handler";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.ADMIN_LOGIN);
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const adminId = parsed.data.adminId.trim();
    let admin: { id: string; fullName: string; mobileNumber: string; email: string | null; role: string; passwordHash?: string | null; languagePref?: string } | null = null;

    try {
      admin = await prisma.user.findFirst({
        where: { role: "ADMIN", OR: [{ email: adminId.toLowerCase() }, { mobileNumber: adminId.replace(/[\s-]/g, "") }] },
      });
    } catch {
      // DB offline fallback
    }

    // 1. Check DB Admin
    if (admin && admin.role === "ADMIN") {
      if (admin.passwordHash && (await verifyPassword(parsed.data.password, admin.passwordHash))) {
        const sessionPayload = {
          id: admin.id,
          fullName: admin.fullName,
          mobileNumber: admin.mobileNumber,
          email: admin.email,
          role: admin.role as "ADMIN" | "CUSTOMER",
        };
        const response = NextResponse.json({
          success: true,
          admin: {
            ...sessionPayload,
            languagePref: admin.languagePref || "en",
          },
        });
        response.cookies.set(
          getSessionCookieName(),
          await createSessionToken(sessionPayload),
          sessionCookieOptions(parsed.data.remember)
        );
        return response;
      }
    }

    // 2. Check Memory Admin (Master Admin Fallback Mode)
    const memoryAdmin = findMemoryUser(adminId);
    if (memoryAdmin && memoryAdmin.role === "ADMIN") {
      if (memoryAdmin.passwordHash && (await verifyPassword(parsed.data.password, memoryAdmin.passwordHash))) {
        const response = NextResponse.json({ success: true, admin: memoryAdmin });
        response.cookies.set(
          getSessionCookieName(),
          await createSessionToken(memoryAdmin),
          sessionCookieOptions(parsed.data.remember)
        );
        return response;
      }
    }

    // Invalid Admin Credentials
    return NextResponse.json({ success: false, message: "Invalid Admin ID or password." }, { status: 401 });
  } catch (error) {
    return handleServerError("POST /api/auth/admin-login", error, "Unable to sign in to admin portal. Please try again.");
  }
}
