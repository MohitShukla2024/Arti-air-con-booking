import { NextResponse } from "next/server";
import { adminSignupSchema } from "@/validators/auth.schema";
import { createSessionToken, getSessionCookieName, sessionCookieOptions } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";

function normalizeAdminEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.includes("@") ? trimmed : `${trimmed}@artiair.com`;
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.CUSTOMER_SIGNUP);
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const currentUser = await getRequestUser(request);

    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== "ADMIN") {
      return forbiddenResponse();
    }

    const parsed = adminSignupSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
    }

    const email = normalizeAdminEmail(parsed.data.adminEmail);
    const mobileNumber = parsed.data.mobileNumber.replace(/[\s-]/g, "");

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { mobileNumber }] },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "An admin account with this email or mobile number already exists." }, { status: 409 });
    }

    const admin = await prisma.user.create({
      data: {
        fullName: parsed.data.fullName.trim(),
        mobileNumber,
        email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "ADMIN",
      },
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        mobileNumber: admin.mobileNumber,
        email: admin.email,
        role: admin.role,
        languagePref: admin.languagePref,
      },
    }, { status: 201 });

    response.cookies.set(getSessionCookieName(), await createSessionToken(admin), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[POST /api/auth/admin/signup]", error);
    return NextResponse.json({ success: false, message: "Unable to create admin account." }, { status: 500 });
  }
}