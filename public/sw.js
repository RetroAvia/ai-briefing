const CACHE_VERSION = 'v3';
const STATIC_CACHE = `ai-briefing-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ai-briefing-dynamic-${CACHE_VERSION}`;

// Asset critici per la shell dell'applicazione
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-96x96.png',
];

// Install: pre-cache sicura e resiliente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            fetch(url)
              .then((res) => {
                if (res.ok) return cache.put(url, res);
              })
              .catch(() => {
                // Silently skip if asset not available at install time
              })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: pulizia immediata vecchie versioni di cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Ascolto messaggi per aggiornamento forzato
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: strategie mirate e crash-proof per tipo di risorsa
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora richieste non GET
  if (event.request.method !== 'GET') return;

  // Ignora richieste non http/https
  if (!url.protocol.startsWith('http')) return;

  // 1. API interne Next.js: Network-only con fallback JSON offline elegante
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            error: 'Dispositivo offline: impossibile contattare il server remoto.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // 2. Navigazione pagine (HTML): Network-first con fallback su cache o offline.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          const fallback = await caches.match('/offline.html');
          return (
            fallback ||
            new Response(
              '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline</title><style>body{background:#000;color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;}button{background:#0071e3;color:#fff;border:none;padding:10px 20px;border-radius:20px;font-weight:bold;margin-top:15px;cursor:pointer;}</style></head><body><div><h2>Modalità Offline</h2><p>Impossibile stabilire una connessione di rete.</p><button onclick="location.reload()">Riprova</button></div></body></html>',
              { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            )
          );
        })
    );
    return;
  }

  // 3. Asset Next.js immutable (_next/static/...) e icone: Cache-first con fallback network
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((networkRes) => {
            if (networkRes.ok) {
              const clone = networkRes.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
            }
            return networkRes;
          })
          .catch(() => {
            // Se fallisce il fetch di un chunk (es. offline improvviso), restituisci 504 invece di rompere il SW
            return new Response('', { status: 504, statusText: 'Gateway Timeout' });
          });
      })
    );
    return;
  }

  // 4. Tutte le altre risorse stesso origin: Stale-While-Revalidate sicuro
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((networkRes) => {
            if (networkRes.ok) {
              const clone = networkRes.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
            }
            return networkRes;
          })
          .catch(() => cached || new Response('', { status: 503 }));

        return cached || fetchPromise;
      })
    );
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  let data = {
    title: '☀️ Il tuo Briefing di Oggi è pronto',
    body: 'Scopri le 10 notizie fondamentali selezionate dall\'AI.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    url: '/',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-96x96.png',
    tag: 'daily-briefing',
    renotify: true,
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '📰 Leggi ora' },
      { action: 'dismiss', title: 'Dopo' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Click sulla notifica
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
