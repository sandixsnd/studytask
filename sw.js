const CACHE_NAME = 'studytask-v5'; 
const urlsToCache = ['./', './index.html'];

self.addEventListener('install', event => {
  self.skipWaiting(); // FUERZA LA ACTUALIZACIÓN INMEDIATA
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // TOMA EL CONTROL DE INMEDIATO
  );
});

self.addEventListener('fetch', event => {
  event.request.url.includes('index.html') || event.request.url.endsWith('/') 
    ? event.respondWith(
        fetch(event.request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => caches.match(event.request))
      )
    : event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
