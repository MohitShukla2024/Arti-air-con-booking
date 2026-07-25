import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCkejax3n4jg1MToXieMp2mQwVLjRshGbQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "artiaircon-96905.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "artiaircon-96905",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "artiaircon-96905.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "538851500118",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:538851500118:web:ef2a44578c2edc63cc9bf7",
};

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

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

    const vapidKey =
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
      "BGr3824FDoaD0v2VJ8x8QuVVJvsdfZBveBGjTUQhES4ZWe3dt95Cq7m8BILK-QcLF7N84a_-cS0MutvAbNuLNE4";

    let currentToken: string | null = null;

    try {
      currentToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: vapidKey || undefined,
      });
    } catch (vapidErr) {
      console.warn("[FCM Client] getToken with VAPID key failed, attempting without VAPID key:", vapidErr);
      try {
        currentToken = await getToken(messaging, {
          serviceWorkerRegistration: registration,
        });
      } catch (err2) {
        console.error("[FCM Client] getToken fallback without VAPID key also failed:", err2);
      }
    }

    if (currentToken) {
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
 * Unregister FCM Token from backend on logout
 */
export async function unregisterFcmToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const token = await getFcmToken();
    if (token) {
      await fetch("/api/notifications/unregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken: token }),
      });
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
