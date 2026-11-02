const CACHE_VERSION = 'v2';
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
        // Caching resiliente: tenta di cachare ogni asset singolarmente per evitare fallimenti totali
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

// Fetch: strategie mirate per tipo di risorsa
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora richieste non GET
  if (event.request.method !== 'GET') return;

  // Ignora richieste verso estensioni chrome o schemi non http(s)
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
          // Prova a recuperare la pagina dalla cache dinamica o statica
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          const fallback = await caches.match('/offline.html');
          return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // 3. Asset Next.js immutable (_next/static/...) e immagini: Cache-first con background update
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkRes) => {
          if (networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 4. Tutte le altre richieste dello stesso origin: Stale-While-Revalidate
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
          .catch(() => cached);

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
      // Se c'è già una finestra aperta, portala in primo piano
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Altrimenti aprine una nuova
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
