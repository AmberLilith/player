const CACHE_NAME = 'player-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index-BuH8UAAr.js', 
  '/assets/index-y4iYIl_9.css', 
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Limpa caches antigos
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith((async () => {
      return Response.redirect('/music?refresh=true', 303);
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (event.request.destination === 'script' ||
            event.request.destination === 'style' ||
            event.request.destination === 'image') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    }).catch(() => caches.match('/index.html'))
  );
});