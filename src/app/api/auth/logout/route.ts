import { NextResponse } from "next/server";
import { getSessionCookieName, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  const cookieName = getSessionCookieName();

  response.cookies.set(cookieName, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
