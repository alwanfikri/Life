const CACHE_NAME = 'shared-life-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/css/base.css',
        '/css/layout.css',
        '/js/app.js',
        '/js/db.js',
        '/js/users.js',
        '/js/journal.js',
        '/js/schedule.js',
        '/js/finance.js',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});