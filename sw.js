self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('life-v2').then(cache =>
      cache.addAll([
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
        '/manifest.json',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
      ])
    )
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== 'life-v2') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});