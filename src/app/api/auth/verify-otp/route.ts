import { NextResponse } from "next/server";
import { otpVerifySchema } from "@/validators/auth.schema";
import { createSessionToken, getSessionCookieName, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findMemoryUser } from "@/lib/mock-user-store";
import { verifyOTP } from "@/lib/otp-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";
import { handleServerError } from "@/lib/error-handler";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.OTP_API);
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = await request.json();
    const parsed = otpVerifySchema.safeParse({ otp: body.otp });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP format. Must be 6 digits." },
        { status: 400 }
      );
    }

    const rawMobile = body.mobileNumber;
    if (!rawMobile || typeof rawMobile !== "string" || rawMobile.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: "Mobile number is required to verify OTP." },
        { status: 400 }
      );
    }

    const mobileNumber = rawMobile.replace(/[\s-]/g, "");

    // Verify OTP dynamically against stored timed OTP
    const otpResult = verifyOTP(mobileNumber, parsed.data.otp);
    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, message: otpResult.message },
        { status: 401 }
      );
    }

    let user: { id: string; fullName: string; mobileNumber: string; email: string | null; role: string; languagePref?: string } | null = null;

    try {
      user = await prisma.user.findUnique({ where: { mobileNumber } });
    } catch {
      // DB offline check memory store
    }

    if (!user) {
      const memoryUser = findMemoryUser(mobileNumber);
      if (memoryUser) {
        user = memoryUser;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "User account not found for this mobile number." }, { status: 404 });
    }

    const sessionUser = {
      id: user.id,
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
      email: user.email,
      role: user.role as "ADMIN" | "CUSTOMER",
    };

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    response.cookies.set(
      getSessionCookieName(),
      await createSessionToken(sessionUser),
      sessionCookieOptions()
    );

    return response;
  } catch (error) {
    return handleServerError("POST /api/auth/verify-otp", error, "Unable to verify OTP code. Please try again.");
  }
}
