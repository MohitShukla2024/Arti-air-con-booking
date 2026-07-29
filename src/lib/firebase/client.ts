import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from "firebase/messaging";

// SECURITY (C-03): All Firebase client credentials MUST come from environment variables.
// Hardcoded fallback values have been removed. A missing env var will produce a
// clear error at initialization time rather than silently using exposed credentials.
const REQUIRED_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseConfig() {
  const missing = Object.entries(REQUIRED_CONFIG)
    .filter(([, v]) => !v)
    .map(([k]) => `NEXT_PUBLIC_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`);

  if (missing.length > 0) {
    console.error("[FCM Client] Missing required Firebase config env vars:", missing.join(", "));
    return null;
  }
  return REQUIRED_CONFIG as Required<typeof REQUIRED_CONFIG>;
}

// SECURITY (H-07): Cache FCM token in localStorage to avoid re-generating a
// new token during logout (which would inadvertently register a new token while
// trying to unregister the old one).
const FCM_TOKEN_CACHE_KEY = "arti_fcm_token";

function getCachedFcmToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(FCM_TOKEN_CACHE_KEY);
  } catch {
    return null;
  }
}

function setCachedFcmToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(FCM_TOKEN_CACHE_KEY, token);
    } else {
      localStorage.removeItem(FCM_TOKEN_CACHE_KEY);
    }
  } catch {
    // localStorage may be unavailable in private mode or strict CSP environments
  }
}

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  if (!firebaseApp) {
    const config = getFirebaseConfig();
    if (!config) return null;
    try {
      firebaseApp = getApps().length ? getApp() : initializeApp(config);
    } catch (err) {
      console.warn("[FCM Client] Failed to initialize Firebase App:", err);
      return null;
    }
  }
  return firebaseApp;
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    return null;
  }

  const app = getFirebaseApp();
  if (!app) return null;

  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(app);
    } catch (err) {
      console.warn("[FCM Client] Failed to initialize Messaging instance:", err);
      return null;
    }
  }
  return messagingInstance;
}

/**
 * Request notification permission from browser
 */
export async function requestBrowserPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("[FCM Client] Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Register Service Worker and retrieve FCM Token.
 * Caches the token in localStorage for safe retrieval at logout time (H-07).
 */
export async function getFcmToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    await navigator.serviceWorker.ready;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    let currentToken: string | null = null;

    try {
      currentToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        ...(vapidKey ? { vapidKey } : {}),
      });
    } catch (err) {
      console.error("[FCM Client] getToken failed:", err);
    }

    if (currentToken) {
      // SECURITY (H-07): Cache the token so logout can use it without re-generating
      setCachedFcmToken(currentToken);
      return currentToken;
    } else {
      console.warn("[FCM Client] No registration token available.");
      return null;
    }
  } catch (error) {
    console.error("[FCM Client] Error retrieving FCM Token:", error);
    return null;
  }
}

/**
 * Unregister FCM Token from backend on logout.
 * SECURITY (H-07): Uses the cached token from localStorage instead of calling
 * getToken() which would inadvertently register a fresh token while trying to
 * remove the old one.
 */
export async function unregisterFcmToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    // Use the cached token — do NOT call getFcmToken() here as it re-generates a new one
    const token = getCachedFcmToken();
    if (token) {
      await fetch("/api/notifications/unregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken: token }),
      });
      // Clear the cache after successful unregistration
      setCachedFcmToken(null);
      return true;
    }
  } catch (err) {
    console.error("[FCM Client] Error unregistering token:", err);
  }
  return false;
}

/**
 * Listen for foreground FCM push notifications while active in browser tab
 */
export async function onForegroundMessage(callback: (payload: MessagePayload) => void): Promise<(() => void) | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log("[FCM Client] Foreground message received:", payload);
    callback(payload);
  });
}
