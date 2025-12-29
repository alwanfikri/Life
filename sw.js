self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('beta-cache').then(cache =>
      cache.addAll([
        '/',
        '/index.html',
        '/css/base.css',
        '/css/layout.css',
        '/js/app.js',
        '/js/db.js',
        '/js/users.js',
        '/js/sync.js',
        '/js/journal.js',
        '/js/schedule.js',
        '/js/finance.js'
      ])
    )
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})