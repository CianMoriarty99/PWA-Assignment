const cache_name = 'pwa_stories';

const cache_urls = new Set([
    "/scripts/jquery-3.4.1.min.js",
    '/scripts/idb.js',
    '/scripts/offline.js',
    '/scripts/database.js',
    '/pages/offline.html',
    '/stylesheets/style.css',
]);

const cache_first = {
    '/': '/pages/allStories.html',
    '/me': '/pages/myStories.html',
    '/upload': '/pages/uploadStory.html'
};

const createDB = () => {
    idb.open('images', 1, (upgradeDB) => {
        upgradeDB.createObjectStore('images', {
            keyPath: 'id'
        });
    });
}

self.addEventListener('install', event => {
    console.log('installing service worker');
    event.waitUntil(
        caches.open(cache_name).then(cache => {
            console.log('building cache');
            return cache.addAll(cache_urls);
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
    createDB();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const dest = new URL(event.request.url).pathname;
    console.log(dest);
    if (dest in cache_first) {
        event.respondWith(
            caches.match(cache_first[dest])
                .catch(() => {
                    console.log(`couldnt find ${dest} in cache, calling network...`);
                    return fetch(event.request);
                })
        );
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


