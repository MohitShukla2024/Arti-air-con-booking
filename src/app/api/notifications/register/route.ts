import { NextResponse } from "next/server";
import { getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { getPrisma } from "@/lib/prisma";
import { saveInMemoryFcmToken } from "@/lib/fcm-store";
import { handleServerError } from "@/lib/error-handler";

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as { fcmToken?: string; deviceType?: string };
    const { fcmToken, deviceType = "web" } = body;

    if (!fcmToken || typeof fcmToken !== "string" || fcmToken.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Valid fcmToken is required." }, { status: 400 });
    }

    const cleanToken = fcmToken.trim();

    // 1. Save in Memory Store (for dev / demo mode fallback)
    saveInMemoryFcmToken(user.id, cleanToken, user.role, deviceType);

    // 2. Save in Database if available
    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.fcmToken.upsert({
          where: { token: cleanToken },
          update: {
            userId: user.id,
            deviceType,
            updatedAt: new Date(),
          },
          create: {
            userId: user.id,
            token: cleanToken,
            deviceType,
          },
        });
      } catch (dbErr) {
        console.warn("[POST /api/notifications/register] DB save warning (using memory store fallback):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "FCM Token registered successfully",
      userId: user.id,
    });
  } catch (error) {
    return handleServerError("POST /api/notifications/register", error, "Unable to register notification token.");
  }
}
