// Firebase Cloud Messaging Service Worker for Arti Air Con
/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Initialize Firebase App in Service Worker (Default / Fallback config)
// The service worker will receive push payloads sent via FCM Server
const firebaseConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  const title = payload.notification?.title || payload.data?.title || "Arti Air Con Update";
  const body = payload.notification?.body || payload.data?.body || "You have a new update regarding your service.";
  const icon = payload.notification?.icon || payload.data?.icon || "/hero-technician.png";
  const clickActionUrl = payload.data?.url || (payload.data?.role === "ADMIN" ? "/admin/bookings" : "/dashboard");

  const notificationOptions = {
    body,
    icon,
    badge: "/hero-technician.png",
    timestamp: Date.now(),
    data: {
      url: clickActionUrl,
      bookingId: payload.data?.bookingId || null,
    },
    vibrate: [200, 100, 200],
    tag: payload.data?.bookingId || "arti-ac-notification",
    renotify: true,
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Direct Web Push fallback event listener
self.addEventListener("push", (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      console.log("[firebase-messaging-sw.js] Web Push event payload:", data);
      
      // If notification property exists, onBackgroundMessage might handle it, but fallback ensures display
      const title = data.notification?.title || data.data?.title || "Arti Air Con Notification";
      const body = data.notification?.body || data.data?.body || "Click to view details.";
      const icon = data.notification?.icon || data.data?.icon || "/hero-technician.png";
      const clickActionUrl = data.data?.url || "/dashboard";

      const options = {
        body,
        icon,
        badge: "/hero-technician.png",
        data: { url: clickActionUrl, ...data.data },
        tag: data.data?.bookingId || "arti-push-tag",
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      console.error("[firebase-messaging-sw.js] Failed to parse push event payload:", e);
    }
  }
});

// Handle Notification Click action
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received:", event.notification);
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it and navigate to the target URL
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return;
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
