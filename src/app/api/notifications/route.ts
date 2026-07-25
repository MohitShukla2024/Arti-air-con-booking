import { NextResponse } from "next/server";
import { getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { getPrisma } from "@/lib/prisma";
import { handleServerError } from "@/lib/error-handler";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0 });
    }

    // Query notifications by specific userId OR matching role
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { role: user.role as Role },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.readStatus).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return handleServerError("GET /api/notifications", error, "Unable to fetch notifications.");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as { notificationId?: string; markAll?: boolean };
    const { notificationId, markAll } = body;

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: true, message: "Marked as read (offline mode)" });
    }

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: user.id },
            { role: user.role as Role },
          ],
          readStatus: false,
        },
        data: { readStatus: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notificationId) {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          OR: [
            { userId: user.id },
            { role: user.role as Role },
          ],
        },
        data: { readStatus: true },
      });
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  } catch (error) {
    return handleServerError("PATCH /api/notifications", error, "Unable to update notification.");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();

    const body = (await request.json().catch(() => ({}))) as { notificationId?: string };

    const prisma = getPrisma();
    if (prisma) {
      if (body.notificationId) {
        await prisma.notification.deleteMany({
          where: {
            id: body.notificationId,
            OR: [
              { userId: user.id },
              { role: user.role as Role },
            ],
          },
        });
      } else {
        await prisma.notification.deleteMany({
          where: {
            OR: [
              { userId: user.id },
              { role: user.role as Role },
            ],
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Notifications deleted successfully" });
  } catch (error) {
    return handleServerError("DELETE /api/notifications", error, "Unable to delete notifications.");
  }
}
