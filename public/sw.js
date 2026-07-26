// MonÉcole+ Service Worker — PWA Offline + Cache intelligent
const CACHE_NAME = "monecole-plus-v1"
const OFFLINE_URL = "/login"

// Resources to pre-cache on install
const PRECACHE_URLS = [
  "/",
  "/login",
  "/dashboard",
  "/icon.svg",
  "/apple-icon.png",
  "/manifest.json",
]

// Install: pre-cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch: network-first with cache fallback
self.addEventListener("fetch", (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== "GET") return
  if (event.request.url.includes("/api/")) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Offline fallback: serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          // For navigation requests, show the offline page
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL)
          }
          return new Response("Hors connexion", { status: 503 })
        })
      })
  )
})

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "MonÉcole+"
  const options = {
    body: data.body || "Vous avez une nouvelle notification",
    icon: "/apple-icon.png",
    badge: "/icon-light-32x32.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
    },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/dashboard"
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
