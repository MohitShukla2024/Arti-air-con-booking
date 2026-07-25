import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { inMemoryBookings } from "@/app/api/bookings/route";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { handleServerError } from "@/lib/error-handler";
import { sendFcmNotificationToUser } from "@/lib/notifications/fcm-server";

function buildNotificationPayload(status: string, bookingCode: string) {
  switch (status) {
    case "ACCEPTED":
      return {
        title: "Booking Accepted 🚀",
        body: `Your booking ${bookingCode} has been accepted. Technician is assigned.`,
      };
    case "COMPLETED":
      return {
        title: "Booking Completed ✅",
        body: `Your AC service for booking ${bookingCode} has been completed successfully.`,
      };
    case "CANCELLED":
      return {
        title: "Booking Cancelled ❌",
        body: `Your booking ${bookingCode} has been cancelled by admin.`,
      };
    case "EN_ROUTE":
      return {
        title: "Technician En Route 🛵",
        body: `Your technician is on the way for booking ${bookingCode}.`,
      };
    case "IN_PROGRESS":
      return {
        title: "Service In Progress 🔧",
        body: `Work has started on your booking ${bookingCode}.`,
      };
    default:
      return {
        title: "Booking Status Update 🔔",
        body: `Your booking ${bookingCode} status has been updated to ${status}.`,
      };
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse();

    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    const status = body.status;

    // Whitelist valid booking statuses — reject anything outside this list
    const VALID_STATUSES = ["PENDING", "ACCEPTED", "EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    let customerId: string | null = null;
    let bookingCode: string = id;

    // 1. Mutate in-memory store so both Customer & Admin dashboards see updated status
    const inMemItem = inMemoryBookings.find((b) => b.id === id || b.bookingCode === id);
    if (inMemItem) {
      inMemItem.status = status;
      inMemItem.updatedAt = new Date().toISOString();
      customerId = inMemItem.customerId;
      bookingCode = inMemItem.bookingCode;
    }

    // 2. Query & Update Database
    const db = getPrisma();
    if (db) {
      try {
        // Find existing booking by ID or Booking Code
        const existingBooking = await db.booking.findFirst({
          where: {
            OR: [{ id }, { bookingCode: id }],
          },
        });

        if (existingBooking) {
          const updated = await db.booking.update({
            where: { id: existingBooking.id },
            data: { status: status as BookingStatus },
          });

          customerId = updated.customerId || existingBooking.customerId || customerId;
          bookingCode = updated.bookingCode || existingBooking.bookingCode || bookingCode;
        }
      } catch (dbError) {
        console.error("[PATCH /api/admin/bookings/[id]/status] DB update error:", dbError);
      }
    }

    // 3. Send Real-Time Push Notification to Customer
    if (customerId) {
      const payload = buildNotificationPayload(status, bookingCode);
      sendFcmNotificationToUser(customerId, {
        ...payload,
        url: "/dashboard",
        bookingId: id,
        role: "CUSTOMER",
      }).catch((err) => console.error("[PATCH status] FCM error:", err));
    } else {
      console.warn(`[PATCH status] CustomerId missing for booking ${id}. FCM notification skipped.`);
    }

    return NextResponse.json({
      success: true,
      bookingId: id,
      status,
      message: `Booking ${bookingCode} status updated to ${status}`,
    });
  } catch (error) {
    return handleServerError("PATCH /api/admin/bookings/[id]/status", error, "Unable to update booking status. Please try again.");
  }
}
