// Service worker JavaScript

// Set the cache name
const cacheName = 'v1';

// Add all the files to be cached
const cacheFiles = [
    '/',
    '/index.html',
    '/css/styl.css',
    '/js/min.js',

];

// Listen for the installation event
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Installed');

    // Open the cache and add all the files
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching cacheFiles');
            return cache.addAll(cacheFiles);
        })
    );
});

// Listen for the activation event
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activated');

    // Remove previous caches
    e.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (thisCacheName) {
                    if (thisCacheName !== cacheName) {
                        console.log(
                            '[ServiceWorker] Removing Cached Files from Cache - ',
                            thisCacheName
                        );
                        return caches.delete(thisCacheName);
                    }
                })
            );
        })
    );
});

// Listen for the fetch event
self.addEventListener('fetch', function (e) {
    console.log('[ServiceWorker] Fetch', e.request.url);

    // Respond with the cached version or request the files
    e.respondWith(
        caches.match(e.request).then(function (response) {
            if (response) {
                console.log('[ServiceWorker] Found in Cache', e.request.url);
                return response;
            }

            console.log('[ServiceWorker] Network request for ', e.request.url);
            return fetch(e.request)
                .then(function (response) {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        console.log('[ServiceWorker] No response from fetch');
                        return response;
                    }

                    var responseToCache = response.clone();

                    caches.open(cacheName).then(function (cache) {
                        console.log('[ServiceWorker] Caching new data', e.request.url);
                        cache.put(e.request, responseToCache);
                    });

                    return response;
                })
                .catch(function (err) {
                    console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
                });
        })
    );
});
