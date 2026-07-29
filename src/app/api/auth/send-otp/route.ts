import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/validators/auth.schema";
import { generateOTP } from "@/lib/otp-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";
import { handleServerError } from "@/lib/error-handler";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.OTP_API);
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    try {
      const code = await generateOTP(parsed.data.mobileNumber);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV OTP SENT] Mobile: ${parsed.data.mobileNumber} -> OTP Code: ${code}`);
      }
    } catch {
      return NextResponse.json(
        { success: false, message: "Unable to send OTP code. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP code sent successfully to ${parsed.data.mobileNumber}`,
    });
  } catch (error) {
    return handleServerError("POST /api/auth/send-otp", error, "Unable to send OTP code. Please try again.");
  }
}
