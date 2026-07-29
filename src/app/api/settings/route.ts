import { NextResponse } from "next/server";
import { getRequestUser, forbiddenResponse, unauthorizedResponse } from "@/lib/request-auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings, SITE_SETTINGS_ID, type SiteSettings } from "@/lib/site-settings";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit-config";
import { handleServerError } from "@/lib/error-handler";
import { hashPassword } from "@/lib/password";

async function getSettingsRecord() {
  const settings = await prisma.siteSetting.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {},
    create: {
      id: SITE_SETTINGS_ID,
      ...DEFAULT_SITE_SETTINGS,
    },
  });

  const normalized = normalizeSiteSettings(settings);
  // Do not expose raw hashed passcode in site settings output
  return { ...normalized, adminPasscode: "" };
}

export async function GET(request: Request) {
  try {
    // SECURITY (H-05): Settings data includes technician phone/name and pricing.
    // Require authentication — only authenticated users (any role) can read settings.
    const user = await getRequestUser(request);
    if (!user) return unauthorizedResponse();

    const settings = await getSettingsRecord();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return handleServerError("GET /api/settings", error, "Unable to load settings. Please try again.");
  }
}

export async function PUT(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== "ADMIN") return forbiddenResponse();

  const rateLimit = checkRateLimit(request, RATE_LIMIT_CONFIGS.CONTACT_SETTINGS, user.id);
  if (!rateLimit.allowed) return rateLimit.response!;

  try {
    const body = (await request.json()) as Partial<SiteSettings>;
    const settings = normalizeSiteSettings(body);

    if (body.adminPasscode && body.adminPasscode.trim().length > 0) {
      settings.adminPasscode = await hashPassword(body.adminPasscode);
    }

    const updated = await prisma.siteSetting.upsert({
      where: { id: SITE_SETTINGS_ID },
      update: settings,
      create: {
        id: SITE_SETTINGS_ID,
        ...settings,
      },
    });

    const sanitized = normalizeSiteSettings(updated);
    return NextResponse.json({ success: true, settings: { ...sanitized, adminPasscode: "" } });
  } catch (error) {
    return handleServerError("PUT /api/settings", error, "Unable to save settings. Please try again.");
  }
}