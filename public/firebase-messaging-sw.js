// Firebase Cloud Messaging & Web Push Service Worker for Arti Air Con
/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const CACHE_NAME = "arti-air-con-cache-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_ASSETS = [
  "/offline",
  "/hero-technician.png",
  "/favicon.ico",
];

// Service Worker Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Cache prefetch warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Service Worker Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Offline Fetch Handler (Navigation fallback)
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL).then((response) => {
          return response || new Response("You are offline.", { headers: { "Content-Type": "text/html" } });
        });
      })
    );
  }
});

// Initialize Firebase App with User's Project Config
const firebaseConfig = {
  projectId: "artiaircon-96905",
  authDomain: "artiaircon-96905.firebaseapp.com",
  storageBucket: "artiaircon-96905.appspot.com",
  messagingSenderId: "103829534695513028182",
  appId: "1:103829534695513028182:web:artiaircon96905app",
};

if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (err) {
    console.warn("Firebase SW init warning:", err);
  }
}

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (e) {
  console.warn("Firebase messaging SW unavailable:", e);
}

// Background FCM Message Handler (Triggers when site is closed, minimized, or screen locked)
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || "Arti Air Con Update 🔔";
    const body = payload.notification?.body || payload.data?.body || "You have a new update regarding your booking.";
    const icon = payload.notification?.icon || payload.data?.icon || "/hero-technician.png";
    const targetUrl = payload.data?.url || (payload.data?.role === "ADMIN" ? "/admin/bookings" : "/dashboard");

    const options = {
      body,
      icon,
      badge: icon,
      data: { url: targetUrl, bookingId: payload.data?.bookingId },
      vibrate: [200, 100, 200, 100, 200],
      tag: payload.data?.bookingId || `arti-ac-push-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
    };

    return self.registration.showNotification(title, options);
  });
}

// Native Web Push Fallback Event Listener
self.addEventListener("push", (event) => {
  let title = "Arti Air Con Update 🔔";
  let body = "Click to view your booking update.";
  let targetUrl = "/dashboard";
  let icon = "/hero-technician.png";

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.notification?.title || data.data?.title || title;
      body = data.notification?.body || data.data?.body || body;
      icon = data.notification?.icon || data.data?.icon || icon;
      targetUrl = data.data?.url || targetUrl;
    } catch {
      try {
        body = event.data.text() || body;
      } catch {}
    }
  }

  const options = {
    body,
    icon,
    badge: icon,
    data: { url: targetUrl },
    vibrate: [200, 100, 200, 100, 200],
    tag: "arti-push-bg-" + Date.now(),
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Handler (Opens website when phone notification banner is tapped)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          if ("navigate" in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
