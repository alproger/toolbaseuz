/* toolbase.uz Service Worker v2.2-dictionary */
const CACHE = 'toolbase-v2.2-dict';
const PRE = ['/', '/assets/css/styles.css', '/assets/img/favicon.svg', '/offline.html'];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(PRE)).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.status === 200) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
      return r;
    }).catch(() => caches.match(e.request).then(c => c || caches.match('/offline.html')))
  );
});
