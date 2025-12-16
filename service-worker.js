const CACHE_NAME = 'att-fayetteville-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/AT&T_Globe.png',
  '/att.png',
  '/attlogo.png',
  '/Store-Pic.jpeg',
  '/manifest.json',
  '/discount.png',
  '/GoogleMapsPin.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Forces this new version to become active immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
