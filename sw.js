const CACHE_NAME = 'twofold-v4';
const ASSETS = [
  './',
  './index.html',
  './preview.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/logo.png',
  './assets/avatars/zeynep.png',
  './assets/avatars/bartu.png',
  './assets/avatars/together.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
