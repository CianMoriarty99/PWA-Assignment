const cache_name = 'pwa_stories';

const to_cache = [
    '/scripts/offline.js',
    '/scripts/database.js',
    '/pages/offline.html',
];

const catch_urls = {
    '/': '/pages/offline.html'
};

self.addEventListener('install', e => {
    console.log('installing service worker');
    e.waitUntil(
        caches.open(cache_name).then(cache => {
            console.log('building cache');
            return cache.addAll(to_cache);
        })
    );
});

self.addEventListener('activate', e => {
   console.log('service worker activated');
});

self.addEventListener('fetch', event => {
    const dest = new URL(event.request.url);
    if (!(dest.pathname in catch_urls)) return;
    event.respondWith(
        caches.match('/pages/offline.html')
            .then(response => {
                return response;
            })
    );
});

