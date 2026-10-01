const CACHE_NAME = 'mission-lokal-offline-library-v1';
const OFFLINE_LIBRARY_URL = '/offline-library.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_LIBRARY_URL)),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key.startsWith('mission-lokal-offline-library-') && key !== CACHE_NAME)
                .map((key) => caches.delete(key)),
        )),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    const isLibraryRequest = requestUrl.pathname === '/library';
    const isPageNavigation = event.request.mode === 'navigate';
    if (
        event.request.method !== 'GET' ||
        requestUrl.origin !== self.location.origin ||
        (!isLibraryRequest && !isPageNavigation)
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(async () => {
            if (event.request.headers.get('X-Inertia') === 'true') {
                return new Response(null, {
                    status: 409,
                    headers: { 'X-Inertia-Location': '/library' },
                });
            }

            const cache = await caches.open(CACHE_NAME);
            return (await cache.match(OFFLINE_LIBRARY_URL)) || Response.error();
        }),
    );
});