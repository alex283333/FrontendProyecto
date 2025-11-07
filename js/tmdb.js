const TMDB_BACKEND_BASE = 'https://api.ultrafilm.online/tmdb';

if (typeof TMDB_BACKEND_BASE === 'undefined' || !TMDB_BACKEND_BASE.includes('api.ultrafilm.online')) {
  console.error('[tmdb.min.js] ERROR CRÍTICO: TMDB_BACKEND_BASE debe apuntar a api.ultrafilm.online');
  console.error('[tmdb.min.js] TMDB_BACKEND_BASE actual:', TMDB_BACKEND_BASE);
  throw new Error('TMDB_BACKEND_BASE no está correctamente configurado');
}

if (TMDB_BACKEND_BASE.includes('ultrafilm.online') && !TMDB_BACKEND_BASE.includes('api.ultrafilm.online')) {
  console.error('[tmdb.min.js] ERROR CRÍTICO: TMDB_BACKEND_BASE apunta a ultrafilm.online en lugar de api.ultrafilm.online');
  throw new Error('TMDB_BACKEND_BASE usa el dominio incorrecto. Debe ser api.ultrafilm.online');
}

console.log('SCRIPT CARGADO Y EJECUTADO');

async function tmdbFetch(endpoint, params = {}) {
  try {

    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${TMDB_BACKEND_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;

    if (!url.includes('api.ultrafilm.online')) {
      console.error('[tmdbFetch] ❌ ERROR CRÍTICO: URL construida incorrectamente:', url);
      console.error('[tmdbFetch] TMDB_BACKEND_BASE:', TMDB_BACKEND_BASE);
      console.error('[tmdbFetch] endpoint:', endpoint);
      throw new Error('URL de TMDB incorrecta. Debe usar api.ultrafilm.online');
    }

    if (url.includes('ultrafilm.online/tmdb') && !url.includes('api.ultrafilm.online')) {
      console.error('[tmdbFetch] ❌ ERROR CRÍTICO: URL usa ultrafilm.online en lugar de api.ultrafilm.online');
      console.error('[tmdbFetch] URL incorrecta:', url);
      throw new Error('URL usa dominio incorrecto. Debe ser api.ultrafilm.online');
    }

    const token = localStorage.getItem('jwt');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const realFetch = window._tmdbOriginalFetch || window.fetch;
    const response = await realFetch(url, { headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `Error ${response.status}` }));
      throw new Error(error.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[tmdbFetch] Error:', error);
    throw error;
  }
}

(function() {
  'use strict';

  const originalFetch = window.fetch;

  window._tmdbOriginalFetch = originalFetch;

  try {
    Object.defineProperty(window, 'fetch', {
      value: function(...args) {
        const url = args[0];

        let urlString = '';
        if (typeof url === 'string') {
          urlString = url;
        } else if (url && typeof url === 'object' && url.url) {
          urlString = url.url;
        } else if (url && typeof url === 'object' && url.toString) {
          urlString = url.toString();
        }

        if (urlString.includes('api.themoviedb.org') || urlString.includes('api_key=') || urlString.includes('api_key')) {
          console.error('❌ BLOQUEADO: Intento de fetch directo a api.themoviedb.org');
          console.error('URL bloqueada:', urlString);
          console.trace('Stack trace del código que intentó hacer la llamada directa:');
          throw new Error('Las llamadas directas a api.themoviedb.org están bloqueadas. Usa window.tmdbFetch() en su lugar.');
        }

        if (urlString.includes('ultrafilm.online/tmdb') && !urlString.includes('api.ultrafilm.online')) {
          console.error('❌ BLOQUEADO: URL incorrecta para TMDB proxy');
          console.error('URL bloqueada:', urlString);
          console.error('⚠️ DEBE usar: https://api.ultrafilm.online/tmdb/...');
          console.trace('Stack trace del código que intentó usar la URL incorrecta:');
          throw new Error('URL incorrecta para TMDB. Debe usar https://api.ultrafilm.online/tmdb/... en lugar de ultrafilm.online/tmdb/...');
        }

        return originalFetch.apply(this, args);
      },
      writable: false,
      configurable: false,
      enumerable: true
    });

    console.log('interceptado y protegido');
  } catch (e) {
    console.error('[tmdb.min.js] ❌ Error al interceptar fetch con defineProperty:', e);

    window.fetch = function(...args) {
      const url = args[0];
      let urlString = '';
      if (typeof url === 'string') {
        urlString = url;
      } else if (url && typeof url === 'object' && url.url) {
        urlString = url.url;
      } else if (url && typeof url === 'object' && url.toString) {
        urlString = url.toString();
      }

      if (urlString.includes('api.themoviedb.org') || urlString.includes('api_key=') || urlString.includes('api_key')) {
        console.error('❌ BLOQUEADO: Intento de fetch directo a api.themoviedb.org');
        throw new Error('Las llamadas directas a api.themoviedb.org están bloqueadas.');
      }

      return originalFetch.apply(this, args);
    };
  }
})();

Object.defineProperty(window, 'tmdbFetch', {
  value: tmdbFetch,
  writable: false,
  configurable: false,
  enumerable: true
});

(function() {
  'use strict';

  Object.defineProperty(window, '_tmdbLoaded', {
    value: true,
    writable: false,
    configurable: false,
    enumerable: true
  });

  const tmdbReadyEvent = new CustomEvent('tmdbReady', {
    detail: { 
      version: 'v4-interceptor-agresivo',
      timestamp: Date.now(),
      tmdbFetchAvailable: typeof window.tmdbFetch === 'function'
    }
  });

  window.dispatchEvent(tmdbReadyEvent);

  setTimeout(() => {
    if (window._tmdbLoaded && typeof window.tmdbFetch === 'function') {
      const retryEvent = new CustomEvent('tmdbReadyRetry', {
        detail: { retry: true, timestamp: Date.now() }
      });
      window.dispatchEvent(retryEvent);
    }
  }, 100);

  console.log('✅ tmdb.js completamente cargado y listo');
  console.log('📊 Estado:', {
    _tmdbLoaded: window._tmdbLoaded,
    tmdbFetch: typeof window.tmdbFetch,
    timestamp: new Date().toISOString()
  });
})();