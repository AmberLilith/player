const CACHE_NAME = 'player-v3';
// Só arquivos com nome fixo (sem hash de build) entram aqui.
// Os bundles com hash (assets/index-XXXX.js/css) NÃO são fixados na mão:
// eles mudam a cada build e são cacheados dinamicamente pelo listener de 'fetch'.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/body-bg.png'
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

  if (event.request.method !== 'GET') return;

  const ehNavegacao = event.request.mode === 'navigate';
  const ehCodigoOuMarkup =
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    ehNavegacao;

  if (ehCodigoOuMarkup) {
    // Network-first: sempre tenta pegar a versão nova do servidor.
    // Só usa o cache se estiver offline. Isso evita o app ficar preso
    // servindo um bundle antigo depois de um novo deploy.
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() =>
          caches.match(event.request).then(cached => cached || caches.match('/index.html'))
        )
    );
    return;
  }

  // Demais recursos (imagens, fontes, etc): cache-first, com atualização em segundo plano.
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (event.request.destination === 'image') {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      });
    }).catch(() => caches.match('/index.html'))
  );
});