const CACHE_NAME = 'att-fayetteville-v3'; // Incremented version to force update
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/main.js',
  '/js/game.js',
  '/js/leaderboard.js',
  '/media/AT&T_Globe.png',
  '/media/att.png',
  '/media/attlogo.png',
  '/media/attlogo-Dark-Mode.png',
  '/media/Store-Pic.jpeg',
  '/media/discount.png',
  '/media/GoogleMapsPin.png',
  '/media/share-icon.png',
  '/media/lastfm-icon.png',
  '/media/phone.png',
  '/media/bolt.png',
  '/media/ice-border.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); 
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
