import { NextResponse } from "next/server";
import { getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { getPrisma } from "@/lib/prisma";
import { removeInMemoryFcmToken } from "@/lib/fcm-store";
import { handleServerError } from "@/lib/error-handler";

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as { fcmToken?: string };
    const { fcmToken } = body;

    if (!fcmToken || typeof fcmToken !== "string") {
      return NextResponse.json({ success: false, message: "Valid fcmToken is required." }, { status: 400 });
    }

    const cleanToken = fcmToken.trim();

    // 1. Remove from memory store
    removeInMemoryFcmToken(cleanToken);

    // 2. Remove from Database if available
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
