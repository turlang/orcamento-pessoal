const CACHE_NAME = 'financas-pro-v1';
// Lista de arquivos locais que o app vai guardar na memória do dispositivo
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './bi-engine.js',
  './manifest.json'
];

// Instala o Service Worker e guarda os arquivos no cache interno
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativa o SW e remove caches antigos se houverem atualizações
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Estratégia de Cache: Busca primeiro no dispositivo, se não achar busca na rede
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
