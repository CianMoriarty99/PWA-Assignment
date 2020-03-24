let dbPromise;

const DB_NAME = 'stories_db';
const STORE_NAME = 'stories';

function initDbPromise(resolve) {
    Promise.all([initDb]).then(resolve);
}

function initDb() {
    dbPromise = idb.openDb(DB_NAME, 1, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
            const storiesDb = upgradeDb.createObjectStore(STORE_NAME);
            storiesDb.createIndex('author', 'author', {unique: false, multiEntry: true});
        }
    })
}

async function loadStories() {
    return await dbPromise.then(async db => {
        const trans = db.transaction(STORE_NAME, 'readonly');
        const store = trans.objectStore(STORE_NAME);
        return store.getAll();
    });
}

function saveStory(story) {
    dbPromise.then(async db => {
        const trans = db.transaction(STORE_NAME, 'readwrite');
        const store = trans.objectStore(STORE_NAME);
        await store.add(story);
        return trans.complete;
    });
}

function saveStories(stories) {
    localStorage.setItem('stories', JSON.stringify(stories));
}

function addToUploadList(story) {
    let currentCache = localStorage.getItem('toUpload') || [];
    currentCache.push(story);
    localStorage.setItem('toUpload', currentCache);
}
