import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  // Verify that valid non-placeholder API key and App ID are present
  if (
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey.includes("your-") ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId ||
    firebaseConfig.appId.includes("your-")
  ) {
    return null;
  }

  if (!firebaseApp) {
    try {
      firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
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
 * Register Service Worker and retrieve FCM Token
 */
export async function getFcmToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    await navigator.serviceWorker.ready;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("[FCM Client] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not defined.");
    }

    const currentToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: vapidKey || undefined,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn("[FCM Client] No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("[FCM Client] Error retrieving FCM Token:", error);
    return null;
  }
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
