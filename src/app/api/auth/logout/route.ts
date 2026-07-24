import { NextResponse } from "next/server";
import { getSessionCookieName, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(getSessionCookieName(), "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
