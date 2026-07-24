import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { inMemoryBookings } from "@/app/api/bookings/route";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";
import { handleServerError } from "@/lib/error-handler";

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

    const prisma = getPrisma();
    if (prisma) {
      try {
        const existing = await prisma.booking.findUnique({ where: { id } });
        if (existing) {
          if (currentUser.role !== "ADMIN" && existing.customerId && existing.customerId !== currentUser.id) {
            return forbiddenResponse();
          }

          const updated = await prisma.booking.update({
            where: { id },
            data: { status: "CANCELLED" },
          });

          if (inMemItem) {
            inMemItem.status = "CANCELLED";
            inMemItem.updatedAt = new Date().toISOString();
          }

          return NextResponse.json({
            success: true,
            bookingId: updated.id,
            status: updated.status,
            message: `Booking ${id} cancelled successfully`,
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

    // Fallback if DB is offline
    return NextResponse.json({
      success: true,
      bookingId: id,
      status: "CANCELLED",
      message: `Booking ${id} cancelled (in-memory)`,
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
