const CACHE_NAME = 'catalogo-v6-agresivo';

const OFFLINE_URL = 'offline.html';

const urlsToCache = [

  '/',

  'index.html',

  'login.html',

  'register.html',

  'dash.html',

  'admin.html',

  'favoritos.html',

  'peliculas.html',

  'peliculass.html',

  'series.html',

  'manage.html',

  'todo.html',

  'style.css',

  'manifest.json',

];

self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => cache.addAll([...urlsToCache, OFFLINE_URL]))

  );

  self.skipWaiting();

});

self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))

    )

  );

  self.clients.claim();

});

self.addEventListener('fetch', event => {

  const url = new URL(event.request.url);

  if (url.hostname === 'api.ultrafilm.online' || url.hostname.includes('api.ultrafilm.online')) {
    return; 

  }

  if (event.request.method !== 'GET') return;

  if (url.hostname === 'api.themoviedb.org' || url.hostname.includes('api.themoviedb.org')) {
    console.error('[SW] Bloqueada petición directa a TMDB API:', url.toString());
    event.respondWith(
      new Response(
        JSON.stringify({ 
          error: 'Direct TMDB API calls are blocked. Use the backend proxy at api.ultrafilm.online/tmdb' 
        }),
        { 
          status: 403,
          statusText: 'Forbidden - Direct TMDB API calls blocked',
          headers: { 'Content-Type': 'application/json' }
        }
      )
    );
    return;
  }

  const isExternalResource = url.hostname.includes('cloudflareinsights.com') ||
                             url.hostname.includes('cloudflare.com') ||
                             url.protocol === 'chrome-extension:';

  const isImageOnly = url.hostname.includes('image.tmdb.org');

  if (isExternalResource) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {

          return new Response('', { 
            status: 408, 
            statusText: 'Network Error',
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  if (isImageOnly) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {

        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(response => {
          if (response) return response;

          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }

          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );

});

