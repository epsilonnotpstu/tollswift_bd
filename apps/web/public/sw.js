self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('tollbd-v1').then((cache) => cache.addAll(['/manifest.json']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (event.request.mode === 'navigate') {
        return caches.match('/index.html').then((page) => page || Response.error());
      }

      return Response.error();
    })
  );
});
