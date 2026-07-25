import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { bookingFormSchema } from "@/validators/booking.schema";
import { getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";
import { handleServerError } from "@/lib/error-handler";
import { sendFcmNotificationToRole } from "@/lib/notifications/fcm-server";

// In-memory fallback (dev/offline only — not reliable in serverless production)
export const inMemoryBookings: {
  id: string;
  customerId: string;
  bookingCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  altMobile: string;
  fullAddress: string;
  city: string;
  pincode: string;
  serviceType: string;
  acType: string;
  acBrand: string;
  problemDescription: string;
  preferredDateTime: string;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}[] = [];

/** Map service type to base pricing */
function resolveAmount(serviceType: string): number {
  const lower = serviceType.toLowerCase();
  if (lower.includes("gas") || lower.includes("refill")) return 1200;
  if (lower.includes("installation") || lower.includes("install")) return 1200;
  if (lower.includes("repair") || lower.includes("pcb")) return 800;
  if (lower.includes("deep") || lower.includes("chemical") || lower.includes("jet")) return 650;
  if (lower.includes("emergency")) return 750;
  if (lower.includes("uninstall")) return 500;
  // Default: basic service / maintenance
  return 450;
}



export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const prisma = getPrisma();
    if (prisma) {
      const dbBookings = await prisma.booking.findMany({
        where: user.role === "ADMIN" ? {} : { customerId: user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      
      const upcoming =
        dbBookings.find(
          (b) => b.status === "ACCEPTED" || b.status === "PENDING"
        ) || dbBookings[0] || null;

      return NextResponse.json({
        success: true,
        upcoming,
        history: dbBookings,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return handleServerError("GET /api/bookings", error, "Unable to load bookings.");
    }
    console.error("[GET /api/bookings] DB error:", error);
  }

  // Fallback: in-memory bookings (development/demo mode only) — filtered per user
  const userFilteredInMem = user.role === "ADMIN" 
    ? inMemoryBookings 
    : inMemoryBookings.filter((b) => b.customerId === user.id);

  const upcoming =
    userFilteredInMem.find(
      (b) => b.status === "ACCEPTED" || b.status === "PENDING"
    ) || userFilteredInMem[0] || null;

  return NextResponse.json({
    success: true,
    upcoming,
    history: userFilteredInMem,
  });
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== "CUSTOMER")
      return NextResponse.json({ success: false, message: "Only customers can create bookings" }, { status: 403 });

    const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.BOOKING_CREATE, user.id);
    if (!rateLimit.allowed) return rateLimit.response!;
    const body = await request.json();
    const parsed = bookingFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `#ART-${year}-${randomNum}`;

    // Resolve pricing based on service type (#30)
    const amount = resolveAmount(parsed.data.serviceType);

    const prisma = getPrisma();
    if (prisma) {
      try {
        const createdBooking = await prisma.booking.create({
          data: {
            bookingCode,
            customerId: user.id,
            fullName: parsed.data.fullName,
            email: parsed.data.email || null,
            mobileNumber: parsed.data.mobileNumber,
            altMobile: parsed.data.altMobile || null,
            fullAddress: parsed.data.fullAddress,
            city: parsed.data.city,
            pincode: parsed.data.pincode,
            serviceType: parsed.data.serviceType,
            acType: parsed.data.acType,
            acBrand: parsed.data.acBrand,
            problemDescription: parsed.data.problemDescription || null,
            preferredDateTime: new Date(parsed.data.preferredDateTime || Date.now()),
            status: "PENDING",
            amount,
          },
        });

        // Trigger real-time FCM notification & DB record for all Admins
        sendFcmNotificationToRole("ADMIN", {
          title: "New Booking Received",
          body: `Customer ${parsed.data.fullName} requested ${parsed.data.serviceType}. Booking ID: ${createdBooking.bookingCode}`,
          url: "/admin/bookings",
          bookingId: createdBooking.id,
          type: "BOOKING_CREATED",
        }).catch((err) => console.error("[POST /api/bookings] Admin FCM notification error:", err));

        return NextResponse.json({
          success: true,
          bookingCode: createdBooking.bookingCode,
          booking: createdBooking,
        });
      } catch (dbError) {
        console.error("[POST /api/bookings] DB create error:", dbError);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json({ success: false, message: "Failed to save booking to database." }, { status: 500 });
        }
      }
    }

    // Development / Demo in-memory fallback
    const newBookingObj = {
      id: `booking-${Date.now()}`,
      customerId: user.id,
      bookingCode,
      fullName: parsed.data.fullName,
      email: parsed.data.email || "",
      mobileNumber: parsed.data.mobileNumber,
      altMobile: parsed.data.altMobile || "",
      fullAddress: parsed.data.fullAddress,
      city: parsed.data.city,
      pincode: parsed.data.pincode,
      serviceType: parsed.data.serviceType,
      acType: parsed.data.acType,
      acBrand: parsed.data.acBrand,
      problemDescription: parsed.data.problemDescription || "",
      preferredDateTime: parsed.data.preferredDateTime,
      status: "PENDING",
      amount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryBookings.unshift(newBookingObj);

    // Trigger real-time FCM notification to all Admins (in-memory mode)
    sendFcmNotificationToRole("ADMIN", {
      title: "New Booking Received",
      body: `Customer ${parsed.data.fullName} requested ${parsed.data.serviceType}. Booking ID: ${bookingCode}`,
      url: "/admin/bookings",
      bookingId: newBookingObj.id,
      type: "BOOKING_CREATED",
    }).catch((err) => console.error("[POST /api/bookings] Admin FCM notification error:", err));

    return NextResponse.json({
      success: true,
      bookingCode,
      booking: newBookingObj,
    });
  } catch (error) {
    return handleServerError("POST /api/bookings", error, "Unable to process booking. Please try again.");
  }
}
