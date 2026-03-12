// LevelUp Service Worker — v1.0
const CACHE_NAME = 'levelup-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap'
];

// Install: pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache what we can; ignore failures for external resources
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http(s)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // For navigation requests: network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For everything else: cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Only cache valid responses from our origin or trusted CDNs
        if (
          response.ok &&
          (url.origin === self.location.origin ||
            url.hostname.includes('fonts.googleapis.com') ||
            url.hostname.includes('fonts.gstatic.com'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
