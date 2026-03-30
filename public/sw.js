const CACHE_NAME = 'player-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Share target
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith((async () => {
      return Response.redirect('/music?refresh=true', 303);
    })());
    return;
  }

  // Cache offline
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // Cacheia dinamicamente os assets do Vite
        if (event.request.destination === 'script' || 
            event.request.destination === 'style' ||
            event.request.destination === 'image') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    }).catch(() => caches.match('/index.html')) // fallback
  );
});