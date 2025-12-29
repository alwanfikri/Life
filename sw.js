self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('beta-cache').then(cache =>
      cache.addAll([
        '/',
        '/index.html',
        '/css/base.css',
        '/js/app.js'
      ])
    )
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})
