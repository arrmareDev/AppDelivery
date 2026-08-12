/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// ── Precache — inyectado automáticamente por vite-plugin-pwa en el build ──
precacheAndRoute(self.__WB_MANIFEST);

// ── Mismo caché que tenía antes (tiles de OpenStreetMap) ──────────────
registerRoute(
  ({ url }) => /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i.test(url.href),
  new CacheFirst({
    cacheName: "osm-tiles",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  }),
);

// ── Mismo caché que tenía antes (respuestas de la API) ─────────────────
registerRoute(
  ({ url }) => /^http:\/\/localhost:8001\/api\/.*/i.test(url.href),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 5 })],
  }),
);

// ── Notificaciones push — nuevo ─────────────────────────────────────────
// Corre aparte de la pestaña, por eso puede mostrar notificaciones aunque
// la app esté cerrada o la pantalla del celular apagada.
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload: any;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Nuevo pedido disponible", body: event.data.text() };
  }

  const title = payload.title || "Nuevo pedido disponible";
  // Sin anotación de tipo estricta acá a propósito: renotify y vibrate
  // son propiedades reales y válidas del navegador, pero esta versión
  // de las definiciones de TypeScript para NotificationOptions no las
  // incluye todavía.
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/manifest-icon-192.maskable.png",
    badge: payload.badge || "/manifest-icon-192.maskable.png",
    data: payload.data || {},
    tag: "pedido-disponible",
    renotify: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocar la notificación, abre (o enfoca) la pantalla principal
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsList) => {
        for (const client of clientsList) {
          if ("focus" in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
      }),
  );
});

self.skipWaiting();
