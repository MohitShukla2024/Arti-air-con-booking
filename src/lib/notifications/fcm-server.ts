import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getMessaging, MulticastMessage, SendResponse } from "firebase-admin/messaging";
import { getPrisma } from "@/lib/prisma";
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
 * Send FCM push notification to all active devices of a specific User ID
 */
export async function sendFcmNotificationToUser(userId: string, payload: NotificationPayload): Promise<{ successCount: number; failureCount: number }> {
  const tokensSet = new Set<string>();

  // 1. Fetch tokens from database
  const prisma = getPrisma();
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

  // 2. Fetch tokens from in-memory fallback
  const inMemTokens = getInMemoryFcmTokensForUser(userId);
  inMemTokens.forEach((t) => tokensSet.add(t));

  const targetTokens = Array.from(tokensSet);

  if (targetTokens.length === 0) {
    console.log(`[FCM Server] No FCM tokens registered for user ${userId}. Skipping push.`);
    return { successCount: 0, failureCount: 0 };
  }

  const app = initFirebaseAdmin();

  // Mock send mode if Firebase Admin is not configured
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

  const message: MulticastMessage = {
    tokens: targetTokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/hero-technician.png",
      url: payload.url || (payload.role === "ADMIN" ? "/admin/bookings" : "/dashboard"),
      bookingId: payload.bookingId || "",
      timestamp: new Date().toISOString(),
      ...(payload.data || {}),
    },
    webpush: {
      fcmOptions: {
        link: payload.url || (payload.role === "ADMIN" ? "/admin/bookings" : "/dashboard"),
      },
      notification: {
        icon: payload.icon || "/hero-technician.png",
        badge: "/hero-technician.png",
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
 * Send FCM push notification to all users with a specified Role ("ADMIN" or "CUSTOMER")
 */
export async function sendFcmNotificationToRole(role: "ADMIN" | "CUSTOMER", payload: NotificationPayload): Promise<{ successCount: number; failureCount: number }> {
  const tokensSet = new Set<string>();

  const prisma = getPrisma();
  if (prisma) {
    try {
      const dbTokens = await prisma.fcmToken.findMany({
        where: { user: { role } },
        select: { token: true },
      });
      dbTokens.forEach((t) => tokensSet.add(t.token));
    } catch (err) {
      console.error(`[FCM Server] Error fetching tokens for role ${role} from DB:`, err);
    }
  }

  // Also check in-memory tokens
  const inMemTokens = getInMemoryFcmTokensForRole(role);
  inMemTokens.forEach((t) => tokensSet.add(t));

  // If in-memory tokens don't explicitly have role set, check if token owner has ADMIN role in mock users
  if (role === "ADMIN") {
    inMemoryFcmTokens.forEach((t) => {
      if (t.userRole === "ADMIN") tokensSet.add(t.token);
    });
  }

  const targetTokens = Array.from(tokensSet);

  if (targetTokens.length === 0) {
    console.log(`[FCM Server] No FCM tokens registered for role ${role}. Skipping push.`);
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

  const message: MulticastMessage = {
    tokens: targetTokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/hero-technician.png",
      url: payload.url || (role === "ADMIN" ? "/admin/bookings" : "/dashboard"),
      bookingId: payload.bookingId || "",
      timestamp: new Date().toISOString(),
      ...(payload.data || {}),
    },
    webpush: {
      fcmOptions: {
        link: payload.url || (role === "ADMIN" ? "/admin/bookings" : "/dashboard"),
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
