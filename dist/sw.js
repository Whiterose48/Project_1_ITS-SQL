/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Service Worker — Smart Caching Strategy for ITS-SQL Platform
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Strategy:
 *   1. Cache-First for heavy assets (DuckDB Wasm ~20-30MB, fonts, images)
 *   2. Network-First for app shell (HTML, JS, CSS) — always get fresh logic
 *   3. No-Store for API/data endpoints — never cache dynamic data
 *   4. Stale-While-Revalidate for SQL data files
 *
 * Cache Busting:
 *   Vite content-hashes JS/CSS filenames (main.8a7b2c.js).
 *   The SW install event cleans old caches automatically.
 */

const CACHE_VERSION = 'its-sql-v2';
const WASM_CACHE = 'its-sql-wasm-v1';
const STATIC_CACHE = `its-sql-static-${CACHE_VERSION}`;

// ── Heavy assets to pre-cache (DuckDB Wasm bundles) ──
const WASM_PATTERNS = [
  /duckdb.*\.wasm$/i,
  /duckdb.*\.js$/i,
  /duckdb.*worker/i,
];

// ── Patterns to NEVER cache (dynamic data) ──
const NO_CACHE_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /chrome-extension/,
  /hot-update/,
  /\.hot-update\./,
  /__vite/,
  /\/@vite/,
  /\/@react-refresh/,
  /sockjs-node/,
  /ws:/,
];

// ── Install: activate immediately ──
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${CACHE_VERSION}`);
  self.skipWaiting();
});

// ── Activate: clean old caches ──
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== WASM_CACHE && key !== STATIC_CACHE)
          .map((key) => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: smart routing strategy ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip dev server and HMR requests
  if (NO_CACHE_PATTERNS.some((p) => p.test(url.href))) return;

  // ── Strategy 1: Cache-First for DuckDB Wasm ──
  if (WASM_PATTERNS.some((p) => p.test(url.pathname) || p.test(url.href))) {
    event.respondWith(cacheFirst(request, WASM_CACHE));
    return;
  }

  // ── Strategy 2: Cache-First for images & fonts ──
  if (/\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── Strategy 3: Stale-While-Revalidate for SQL data ──
  if (/\.sql$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // ── Strategy 4: Network-First for app shell (HTML, JS, CSS) ──
  if (/\.(html|js|jsx|css|mjs)$/i.test(url.pathname) || url.pathname === '/') {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

// ═══════════════════════════════════════════════════════════════
// Caching Strategies
// ═══════════════════════════════════════════════════════════════

/**
 * Cache-First: check cache, fall back to network, store result.
 * Best for: large immutable assets (Wasm, images, fonts)
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    console.log(`[SW] Cache hit: ${shortUrl(request.url)}`);
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      console.log(`[SW] Cached: ${shortUrl(request.url)} (${formatSize(response)})`);
    }
    return response;
  } catch (err) {
    console.warn(`[SW] Network failed for ${shortUrl(request.url)}`);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network-First: try network, fall back to cache.
 * Best for: app shell (HTML/JS/CSS) — always fresh code.
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) {
      console.log(`[SW] Serving from cache (offline): ${shortUrl(request.url)}`);
      return cached;
    }
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Stale-While-Revalidate: serve cache immediately, update in background.
 * Best for: SQL data files that change occasionally.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || (await networkPromise) || new Response('Offline', { status: 503 });
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function shortUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname.length > 60 ? '...' + u.pathname.slice(-50) : u.pathname;
  } catch { return url; }
}

function formatSize(response) {
  const len = response.headers.get('content-length');
  if (!len) return '? bytes';
  const kb = parseInt(len) / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
}

// ── Message handler for cache management ──
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_ALL_CACHES') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
  if (event.data === 'GET_CACHE_SIZE') {
    getCacheSize().then((size) => {
      event.ports[0]?.postMessage({ type: 'CACHE_SIZE', size });
    });
  }
});

async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
      percent: ((estimate.usage / estimate.quota) * 100).toFixed(1),
    };
  }
  return { used: 0, quota: 0, percent: '0' };
}
