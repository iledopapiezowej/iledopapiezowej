const CACHE_NAME = 'papiezowycache-v1.3',
    ALLOWED_CACHE = [CACHE_NAME]

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll([
                '/',
                '/media/barka.mp3',
                '/media/cursor.png',
                '/media/cursor1.png',
                '/media/icon_192.png',
                '/media/icon_256.png',
                '/media/icon_64.png',
                '/index.js',
                '/main.css',
                '/main.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            return fetch(event.request).then(
                function(response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (ALLOWED_CACHE.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});