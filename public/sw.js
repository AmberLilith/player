const CACHE_NAME = 'player-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js', // Ajuste os nomes conforme seu build
  '/static/js/0.chunk.js',
  '/static/js/bundle.js'
];

// Instalação: Cacheia os arquivos estáticos do App (UI)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Estratégia: Tenta rede, se falhar, usa o Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});