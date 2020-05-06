const cache_name = 'pwa_stories';

const cache_urls = new Set([
    '/stylesheets/style.css',
    '/scripts/idb.js',
    '/scripts/database.js',
    '/scripts/common.js',
    '/scripts/allStories.js',
    '/scripts/myStories.js',
]);

const cache_first = {
    '/': '/pages/allStories.html',
    '/me': '/pages/myStories.html',
};

self.addEventListener('install', event => {
    console.log('installing service worker');
    event.waitUntil(
        caches.open(cache_name).then(cache => {
            const toCache = Array.from(cache_urls);
            Object.values(cache_first).forEach(v => toCache.push(v));
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
               if (cache_urls.index(cacheName) === -1) {
                return caches.delete(cacheName);
               }
           })
       )
    });
    //createDB();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const dest = new URL(event.request.url).pathname;
    if (dest in cache_first) {
        event.respondWith(
            caches.match(cache_first[dest]).then(response => {
                    console.log(`couldnt find ${dest} in cache, calling network...`);
                    return response || fetch(cache_first[dest]);
            })
        )
    }
    
    else if (cache_urls.has(dest)) {
        event.respondWith(
            caches.match(dest)
                .catch(() => {
                    console.log(`couldnt find ${dest} in cache, calling network...`);
                    return fetch(event.request);
                })
        );
    }
});


