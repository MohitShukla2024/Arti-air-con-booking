import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getMessaging, MulticastMessage, SendResponse } from "firebase-admin/messaging";
import { getPrisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import {
  getInMemoryFcmTokensForUser,
  getInMemoryFcmTokensForRole,
  removeInMemoryFcmToken,
  inMemoryFcmTokens,
} from "@/lib/fcm-store";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  bookingId?: string;
  role?: "ADMIN" | "CUSTOMER";
  type?: string;
  data?: Record<string, string>;
}

let adminAppInitialized = false;

function initFirebaseAdmin(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    if (!adminAppInitialized) {
      console.warn("[FCM Server] Firebase Admin SDK credentials missing in environment variables. FCM Push will run in mock log mode.");
      adminAppInitialized = true;
    }
    return null;
  }

  // Handle escaped line breaks in private key
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error("[FCM Server] Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
}

/**
 * Remove invalid / expired FCM tokens from both Prisma DB and in-memory fallback
 */
async function removeInvalidToken(token: string) {
  removeInMemoryFcmToken(token);
  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.fcmToken.deleteMany({ where: { token } });
    } catch {
      // Ignore DB error during invalid token deletion
    }
  }
}

/**
 * Send FCM push notification & persist Notification record for a specific User ID
 */
export async function sendFcmNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  // 1. Persist Notification record in Database
  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          bookingId: payload.bookingId || null,
          role: (payload.role || "CUSTOMER") as Role,
          title: payload.title,
          body: payload.body,
          type: payload.type || "SYSTEM",
          readStatus: false,
        },
      });
    } catch (dbErr) {
      console.error("[FCM Server] DB Notification create error for user:", dbErr);
    }
  }

  // 2. Resolve FCM Device Tokens
  const tokensSet = new Set<string>();
  if (prisma) {
    try {
      const dbTokens = await prisma.fcmToken.findMany({
        where: { userId },
        select: { token: true },
      });
      dbTokens.forEach((t) => tokensSet.add(t.token));
    } catch (err) {
      console.error(`[FCM Server] Error fetching tokens for user ${userId} from DB:`, err);
    }
  }

  const inMemTokens = getInMemoryFcmTokensForUser(userId);
  inMemTokens.forEach((t) => tokensSet.add(t));

  const targetTokens = Array.from(tokensSet);

  if (targetTokens.length === 0) {
    console.log(`[FCM Server] Notification persisted to DB. No FCM tokens registered for user ${userId}. Skipping push.`);
    return { successCount: 0, failureCount: 0 };
  }

  const app = initFirebaseAdmin();
  if (!app) {
    console.log(`[FCM Server MOCK PUSH] Sent to User [${userId}] (${targetTokens.length} tokens):`, {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      bookingId: payload.bookingId,
    });
    return { successCount: targetTokens.length, failureCount: 0 };
  }

  const messaging = getMessaging(app);

  const iconUrl = payload.icon || "/icons/icon-192.png";
  const targetUrl = payload.url || (payload.role === "ADMIN" ? "/admin/bookings" : "/dashboard");

  const message: MulticastMessage = {
    tokens: targetTokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      title: payload.title,
      body: payload.body,
      icon: iconUrl,
      url: targetUrl,
      bookingId: payload.bookingId || "",
      timestamp: new Date().toISOString(),
      ...(payload.data || {}),
    },
    webpush: {
      fcmOptions: {
        link: targetUrl,
      },
      notification: {
        title: payload.title,
        body: payload.body,
        icon: iconUrl,
        badge: iconUrl,
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        renotify: true,
        tag: payload.bookingId || `arti-user-push-${Date.now()}`,
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    
    // Prune invalid / expired tokens
    response.responses.forEach((resp: SendResponse, idx: number) => {
      if (!resp.success && resp.error) {
        const errCode = resp.error.code;
        if (
          errCode === "messaging/registration-token-not-registered" ||
          errCode === "messaging/invalid-registration-token"
        ) {
          const badToken = targetTokens[idx];
          if (badToken) {
            removeInvalidToken(badToken);
          }
        }
      }
    });

    console.log(`[FCM Server] Sent push to user ${userId}: ${response.successCount} succeeded, ${response.failureCount} failed.`);
    return { successCount: response.successCount, failureCount: response.failureCount };
  } catch (error) {
    console.error(`[FCM Server] Error sending FCM multicast to user ${userId}:`, error);
    return { successCount: 0, failureCount: targetTokens.length };
  }
}

/**
 * Send FCM push notification & persist Notification record for a specified Role ("ADMIN" or "CUSTOMER")
 */
export async function sendFcmNotificationToRole(
  role: "ADMIN" | "CUSTOMER",
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  // 1. Persist Notification record in Database
  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.notification.create({
        data: {
          role: role as Role,
          bookingId: payload.bookingId || null,
          title: payload.title,
          body: payload.body,
          type: payload.type || "SYSTEM",
          readStatus: false,
        },
      });
    } catch (dbErr) {
      console.error(`[FCM Server] DB Notification create error for role ${role}:`, dbErr);
    }
  }

  // 2. Resolve FCM Device Tokens
  const tokensSet = new Set<string>();
  if (prisma) {
    try {
      const dbTokens = await prisma.fcmToken.findMany({
        where: { user: { role: role as Role } },
        select: { token: true },
      });
      dbTokens.forEach((t) => tokensSet.add(t.token));
    } catch (err) {
      console.error(`[FCM Server] Error fetching tokens for role ${role} from DB:`, err);
    }
  }

  const inMemTokens = getInMemoryFcmTokensForRole(role);
  inMemTokens.forEach((t) => tokensSet.add(t));

  if (role === "ADMIN") {
    inMemoryFcmTokens.forEach((t) => {
      if (t.userRole === "ADMIN") tokensSet.add(t.token);
    });
  }

  const targetTokens = Array.from(tokensSet);

  if (targetTokens.length === 0) {
    console.log(`[FCM Server] Notification persisted to DB. No FCM tokens registered for role ${role}. Skipping push.`);
    return { successCount: 0, failureCount: 0 };
  }

  const app = initFirebaseAdmin();
  if (!app) {
    console.log(`[FCM Server MOCK PUSH] Sent to Role [${role}] (${targetTokens.length} tokens):`, {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      bookingId: payload.bookingId,
    });
    return { successCount: targetTokens.length, failureCount: 0 };
  }

  const messaging = getMessaging(app);

  const iconUrl = payload.icon || "/icons/icon-192.png";
  const targetUrl = payload.url || (role === "ADMIN" ? "/admin/bookings" : "/dashboard");

  const message: MulticastMessage = {
    tokens: targetTokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      title: payload.title,
      body: payload.body,
      icon: iconUrl,
      url: targetUrl,
      bookingId: payload.bookingId || "",
      timestamp: new Date().toISOString(),
      ...(payload.data || {}),
    },
    webpush: {
      fcmOptions: {
        link: targetUrl,
      },
      notification: {
        title: payload.title,
        body: payload.body,
        icon: iconUrl,
        badge: iconUrl,
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        renotify: true,
        tag: payload.bookingId || `arti-role-push-${Date.now()}`,
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);

    response.responses.forEach((resp: SendResponse, idx: number) => {
      if (!resp.success && resp.error) {
        const errCode = resp.error.code;
        if (
          errCode === "messaging/registration-token-not-registered" ||
          errCode === "messaging/invalid-registration-token"
        ) {
          const badToken = targetTokens[idx];
          if (badToken) {
            removeInvalidToken(badToken);
          }
        }
      }
    });

    console.log(`[FCM Server] Sent push to role ${role}: ${response.successCount} succeeded, ${response.failureCount} failed.`);
    return { successCount: response.successCount, failureCount: response.failureCount };
  } catch (error) {
    console.error(`[FCM Server] Error sending FCM multicast to role ${role}:`, error);
    return { successCount: 0, failureCount: targetTokens.length };
  }
}
