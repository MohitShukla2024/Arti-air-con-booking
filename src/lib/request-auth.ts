import { NextResponse } from "next/server";
import { getSessionCookieName, verifySessionToken, type SessionUser } from "@/lib/auth";

export async function getRequestUser(request: Request): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${getSessionCookieName()}=`));
  return await verifySessionToken(cookie?.slice(getSessionCookieName().length + 1));
}

export function unauthorizedResponse() {
  return NextResponse.json({ success: false, message: "Authentication is required." }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ success: false, message: "You are not authorized to perform this action." }, { status: 403 });
}
