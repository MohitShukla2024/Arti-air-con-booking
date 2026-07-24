import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getRequestUser, unauthorizedResponse } from "@/lib/request-auth";
import { handleServerError } from "@/lib/error-handler";

export async function PUT(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { fullName, email } = body;

    const prisma = getPrisma();
    if (prisma && user.id) {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            fullName: fullName || user.fullName,
            email: email !== undefined ? (email || null) : user.email,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Profile updated successfully.",
          user: {
            id: updatedUser.id,
            fullName: updatedUser.fullName,
            mobileNumber: updatedUser.mobileNumber,
            email: updatedUser.email || undefined,
            role: updatedUser.role,
            languagePref: updatedUser.languagePref as "en" | "hi",
          },
        });
      } catch (dbError) {
        return handleServerError("PUT /api/auth/profile", dbError, "Failed to update profile in database.");
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        ...user,
        fullName: fullName || user.fullName,
        email: email || user.email,
      },
    });
  } catch (error) {
    return handleServerError("PUT /api/auth/profile", error, "Failed to update profile details.");
  }
}
