var cacheName = 'oposicionesPWA-v1';
var filesToCache = [
  'https://boodland.github.io/PWA-POC/',
  'https://boodland.github.io/PWA-POC/index.html',
  'https://boodland.github.io/PWA-POC/scripts/app.js',
  'https://boodland.github.io/PWA-POC/scripts/localforage.min.js',
  'https://boodland.github.io/PWA-POC/styles/ud811.css',
  'https://boodland.github.io/PWA-POC/images/administrativo.png',
  'https://boodland.github.io/PWA-POC/images/funcionario-prisiones.png',
  'https://boodland.github.io/PWA-POC/images/justicia.png',
  'https://boodland.github.io/PWA-POC/images/magisterio.png',
  'https://boodland.github.io/PWA-POC/images/policia-nacional.png',
  'https://boodland.github.io/PWA-POC/images/ic_add_white_24px.svg',
  'https://boodland.github.io/PWA-POC/images/ic_refresh_white_24px.svg'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});