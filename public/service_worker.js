const cacheName = 'pwa_stories';

const cacheUrls = new Set([
    '/stylesheets/style.css',
    '/scripts/idb.js',
    '/scripts/database.js',
    '/scripts/common.js',
    '/scripts/allStories.js',
    '/scripts/validate.js',
    '/scripts/myStories.js',
]);

const cacheFirst = {
    '/': '/pages/allStories.html',
    '/me': '/pages/myStories.html',
};

self.addEventListener('install', event => {
    console.log('installing service worker');
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            const toCache = Array.from(cacheUrls);
            Object.values(cacheFirst).forEach(v => toCache.push(v));
            console.log('building cache');
            return cache.addAll(toCache);

        })
    );
});

self.addEventListener('activate', event => {
    console.log('removing old cache...');
    event.waitUntil(cacheNames => {
       return Promise.all(
           cacheNames.map(cacheName => {
               if (cacheUrls.index(cacheName) === -1) {
                return caches.delete(cacheName);
               }
           })
       )
    });
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const dest = new URL(event.request.url).pathname;
    if (dest in cacheFirst) {
        event.respondWith(
            caches.match(cacheFirst[dest]).then(response => {
                    return response || fetch(cacheFirst[dest]);
            })
        )
    }
    
    else if (cacheUrls.has(dest)) {
        event.respondWith(
            caches.match(dest)
                .catch(() => {
                    console.log(`couldnt find ${dest} in cache, calling network...`);
                    return fetch(event.request);
                })
        );
    }

    // fetch by default
});


