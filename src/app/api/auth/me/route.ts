import { NextResponse } from "next/server";
import { getRequestUser, unauthorizedResponse } from "@/lib/request-auth";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return unauthorizedResponse();
  return NextResponse.json({ success: true, user: { ...user, languagePref: "en" } });
}
