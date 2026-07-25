import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { inMemoryBookings } from "@/app/api/bookings/route";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";
import { handleServerError } from "@/lib/error-handler";
import { sendFcmNotificationToRole, sendFcmNotificationToUser } from "@/lib/notifications/fcm-server";

async function cancelBooking(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getRequestUser(request);
    if (!currentUser) return unauthorizedResponse();

    const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.BOOKING_CANCEL, currentUser.id);
    if (!rateLimit.allowed) return rateLimit.response!;

    const { id } = await params;

    const inMemItem = inMemoryBookings.find((b) => b.id === id || b.bookingCode === id);

    // Authorization check for in-memory booking
    if (inMemItem && currentUser.role !== "ADMIN" && inMemItem.customerId && inMemItem.customerId !== currentUser.id) {
      return forbiddenResponse();
    }

    let targetCustomerId: string | null = inMemItem?.customerId || null;
    let targetBookingCode: string = inMemItem?.bookingCode || id;

    const prisma = getPrisma();
    if (prisma) {
      try {
        const existing = await prisma.booking.findFirst({
          where: {
            OR: [{ id }, { bookingCode: id }],
          },
        });

        if (existing) {
          if (currentUser.role !== "ADMIN" && existing.customerId && existing.customerId !== currentUser.id) {
            return forbiddenResponse();
          }

          const updated = await prisma.booking.update({
            where: { id: existing.id },
            data: { status: "CANCELLED" },
          });

          targetCustomerId = updated.customerId || existing.customerId || targetCustomerId;
          targetBookingCode = updated.bookingCode || existing.bookingCode || targetBookingCode;

          if (inMemItem) {
            inMemItem.status = "CANCELLED";
            inMemItem.updatedAt = new Date().toISOString();
          }

          if (currentUser.role === "ADMIN" && targetCustomerId) {
            // Notify Customer that Admin cancelled their booking
            sendFcmNotificationToUser(targetCustomerId, {
              title: "Booking Cancelled ❌",
              body: `Your booking ${targetBookingCode} has been cancelled by admin.`,
              url: "/dashboard",
              bookingId: updated.id,
              role: "CUSTOMER",
            }).catch((err) => console.error("[Cancel Booking] Customer FCM error:", err));
          } else if (currentUser.role !== "ADMIN") {
            // Notify Admins that Customer cancelled their booking
            sendFcmNotificationToRole("ADMIN", {
              title: "Booking Cancelled by Customer ⚠️",
              body: `Booking ${targetBookingCode} was cancelled by the customer.`,
              url: "/admin/bookings",
              bookingId: updated.id,
              role: "ADMIN",
            }).catch((err) => console.error("[Cancel Booking] Admin FCM error:", err));
          }

          return NextResponse.json({
            success: true,
            bookingId: updated.id,
            status: updated.status,
            message: `Booking ${targetBookingCode} cancelled successfully`,
          });
        }
      } catch (dbError) {
        console.error(`[POST /api/bookings/${id}/cancel] DB error:`, dbError);
      }
    }

    if (inMemItem) {
      inMemItem.status = "CANCELLED";
      inMemItem.updatedAt = new Date().toISOString();
    }

    if (currentUser.role === "ADMIN" && targetCustomerId) {
      sendFcmNotificationToUser(targetCustomerId, {
        title: "Booking Cancelled ❌",
        body: `Your booking ${targetBookingCode} has been cancelled by admin.`,
        url: "/dashboard",
        bookingId: id,
        role: "CUSTOMER",
      }).catch((err) => console.error("[Cancel Booking] Customer FCM memory error:", err));
    } else if (currentUser.role !== "ADMIN") {
      sendFcmNotificationToRole("ADMIN", {
        title: "Booking Cancelled by Customer ⚠️",
        body: `Booking ${targetBookingCode} was cancelled by the customer.`,
        url: "/admin/bookings",
        bookingId: id,
        role: "ADMIN",
      }).catch((err) => console.error("[Cancel Booking] Admin FCM memory error:", err));
    }

    return NextResponse.json({
      success: true,
      bookingId: id,
      status: "CANCELLED",
      message: `Booking ${id} cancelled`,
    });
  } catch (error) {
    return handleServerError("POST /api/bookings/[id]/cancel", error, "Unable to cancel booking. Please try again.");
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return cancelBooking(request, context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return cancelBooking(request, context);
}
