const CACHE_NAME = 'qadam-static-v1'
const PRECACHE = ['/icons/qadam.svg', '/icons/qadam-maskable.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  const cacheable =
    request.destination !== 'document' &&
    !url.pathname.startsWith('/api/') &&
    (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/'))

  if (!cacheable) return

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (!response.ok || response.type !== 'basic') return response
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        }),
    ),
  )
})
