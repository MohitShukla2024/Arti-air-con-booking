import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { inMemoryBookings } from "@/app/api/bookings/route";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { handleServerError } from "@/lib/error-handler";

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

    // Mutate in-memory store so both Customer & Admin dashboards see the updated status
    const inMemItem = inMemoryBookings.find((b) => b.id === id || b.bookingCode === id);
    if (inMemItem) {
      inMemItem.status = status;
      inMemItem.updatedAt = new Date().toISOString();
    }

    const db = getPrisma();
    if (db) {
      try {
        const updated = await db.booking.update({
          where: { id },
          data: { status: status as BookingStatus },
        });
        return NextResponse.json({ success: true, booking: updated });
      } catch {
        // Ignore DB offline fallback
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: id,
      status,
      message: `Booking ${id} status updated to ${status} (in-memory)`,
    });
  } catch (error) {
    return handleServerError("PATCH /api/admin/bookings/[id]/status", error, "Unable to update booking status. Please try again.");
  }
}
