/* Service worker del Diario di bordo: salva l'app nel telefono
   così si apre anche senza connessione. Va messo accanto a index.html. */
const CACHE = "diario-bordo-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html"])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
/* Prima la copia salvata (veloce e offline), poi aggiorna in background */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch:true }).then(salvata => {
    const rete = fetch(e.request).then(r => {
      if (r.ok){ const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => salvata);
    return salvata || rete;
  }));
});
