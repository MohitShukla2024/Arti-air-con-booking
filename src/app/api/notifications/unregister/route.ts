import { NextResponse } from "next/server";
import { getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { getPrisma } from "@/lib/prisma";
import { removeInMemoryFcmToken } from "@/lib/fcm-store";
import { handleServerError } from "@/lib/error-handler";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();

    // SECURITY (H-03): Apply rate limiting on unregister as well
    const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.FCM_TOKEN_REGISTER, user.id);
    if (!rateLimit.allowed) return rateLimit.response!;

    const body = (await request.json()) as { fcmToken?: string };
    const { fcmToken } = body;

    if (!fcmToken || typeof fcmToken !== "string") {
      return NextResponse.json({ success: false, message: "Valid fcmToken is required." }, { status: 400 });
    }

    const cleanToken = fcmToken.trim();

    // 1. Remove from memory store
    removeInMemoryFcmToken(cleanToken);

    // 2. Remove from Database if available — scoped to current user for safety
    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.fcmToken.deleteMany({
          where: {
            token: cleanToken,
            userId: user.id,
          },
        });
      } catch (dbErr) {
        console.warn("[POST /api/notifications/unregister] DB delete warning:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "FCM Token unregistered successfully",
    });
  } catch (error) {
    return handleServerError("POST /api/notifications/unregister", error, "Unable to unregister notification token.");
  }
}
