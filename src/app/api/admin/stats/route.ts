import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/request-auth";

export async function GET(request: Request) {
  const currentUser = await getRequestUser(request);
  if (!currentUser) return unauthorizedResponse();
  if (currentUser.role !== "ADMIN") return forbiddenResponse();

  try {
    const prisma = getPrisma();

    if (prisma) {
      const [totalOrders, pending, accepted, completed, cancelled] = await Promise.all([
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.booking.count({ where: { status: "ACCEPTED" } }),
        prisma.booking.count({ where: { status: "COMPLETED" } }),
        prisma.booking.count({ where: { status: "CANCELLED" } }),
      ]);

      const cancellationRate =
        totalOrders > 0 ? parseFloat(((cancelled / totalOrders) * 100).toFixed(1)) : 0;

      return NextResponse.json({
        success: true,
        stats: {
          totalOrders,
          pending,
          accepted,
          completed,
          cancelled,
          totalOrdersGrowth: 0, // Requires historical data — set to 0 until implemented
          cancellationRate,
        },
      });
    }
  } catch (error) {
    console.error("[GET /api/admin/stats] DB error:", error);
  }

  // Fallback when DB is offline — return zeroed stats (not fake data)
  return NextResponse.json({
    success: true,
    stats: {
      totalOrders: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
      totalOrdersGrowth: 0,
      cancellationRate: 0,
    },
  });
}
