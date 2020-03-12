const cache_name = 'pwa_stories';

const to_cache = [
    '/scripts/offline.js',
    '/scripts/database.js',
    '/pages/offline.html',
    '/stylesheets/style.css',
];

const catch_urls = {
    '/': '/pages/offline.html',
    '/style.css': '/stylesheets/style.css',
    '/database.js': '/scripts/database.js'
};

self.addEventListener('install', event => {
    console.log('installing service worker');
    event.waitUntil(
        caches.open(cache_name).then(cache => {
            console.log('building cache');
            return cache.addAll(to_cache);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('removing old cache...');
    event.waitUntil(cacheNames => {
       return Promise.all(
           cacheNames.map(cacheName => {
               if (to_cache.index(cacheName) === -1) {
                return caches.delete(cacheName);
               }
           })
       )
    })
});

self.addEventListener('fetch', event => {
    const dest = new URL(event.request.url);
    if (!(dest.pathname in catch_urls)) return;
    event.respondWith(
        caches.match(catch_urls[dest.pathname])
            .then(response => {
                return response;
            })
    );
});

