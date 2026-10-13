// v2: stopped intercepting cross-origin images (see fetch handler) — bumping the names
// makes activate() delete the v1 caches on every visitor's browser.
const CACHE_NAME = "evradar-v2";
const STATIC_CACHE = "evradar-static-v2";

// Static assets to cache on install
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon.ico",
  "/images/logo.png",
];

// ── Install: precache static shell ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: caching strategy per request type ────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin requests, API calls, admin routes, Next.js internals.
  // Cross-origin (ImageKit, ads, fonts) is left to the browser: <img> requests to other
  // origins are opaque, so they could never be cached here anyway, and re-fetching them
  // from the worker failed intermittently — which we then turned into a fake 408 and
  // every article card fell back to the logo.
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/admin")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Next.js static assets (_next/static) → cache-first, long-lived
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // Same-origin images → stale-while-revalidate
  if (url.pathname.match(/\.(png|jpe?g|webp|avif|gif|svg|ico)$/i)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        if (cached) {
          fetchPromise.catch(() => {}); // background refresh; failure is fine, we have a copy
          return cached;
        }
        // No copy: return the real network result (or real network error) so <img onError>
        // and fallbacks behave normally — never a synthetic status
        return fetchPromise;
      })
    );
    return;
  }

  // HTML pages → network-first with offline fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fall back to offline page
          return caches.match("/offline") || new Response(
            "<h1>You are offline</h1><p>Please check your connection and try again.</p>",
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }
});

// ── Push notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || "EV News India";
  const options = {
    body: data.body || "New update from EV News India",
    icon: data.icon || "/images/logo.png",
    badge: "/images/logo.png",
    image: data.image || undefined,
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
