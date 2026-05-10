// Nexus Pro service worker
const CACHE_NAME = 'nexus-pro-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never cache API or chunk-hash assets — let them stream fresh
  if (request.method !== 'GET') return;
  if (request.url.includes('/api/')) return;
  if (request.url.includes('/socket.io/')) return;

  // App shell: cache-first for static assets
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((res) =>
        res || fetch(request).then((r) => {
          const copy = r.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => {});
          return r;
        }).catch(() => res)
      )
    );
    return;
  }

  // HTML: network-first, fall back to cached shell
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
  }
});
