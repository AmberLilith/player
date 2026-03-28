import { salvarNoDB } from './db';
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

// public/sw.js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Se for o POST do compartilhamento definido no manifest.json
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const mediaFile = formData.get('media'); // 'media' deve ser o nome no manifest.json
        
        // Redireciona de volta para a home com um parâmetro para o React saber que chegou algo
        return Response.redirect('/music?shared=true', 303);
      })()
    );
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const file = formData.get('media'); // 'media' é o nome que demos no manifest

      if (file) {
        // Salva no IndexedDB que o seu App.tsx já lê no useEffect de carga
        await salvarNoDB(file.name, file);
      }

      // Redireciona para a página de música com um aviso na URL
      return Response.redirect('/music?refresh=true', 303);
    })());
  }
});