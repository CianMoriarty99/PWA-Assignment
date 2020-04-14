let dbPromise;

const DB_NAME = 'stories_db';
const STORIES_STORE = 'stories';
const TO_UPLOAD_STORE = 'toUpload'

const initDbPromise = (resolve) => {
    Promise.all([initDb])
        .then(resolve);
}

const initDb = () => {
    dbPromise = idb.openDb(DB_NAME, 1, (upgradeDb) => {
        if (!upgradeDb.objectStoreNames.contains(STORIES_STORE)) {
            const storiesDb = upgradeDb.createObjectStore(STORIES_STORE, {keyPath: 'id', autoIncrement: true});
            storiesDb.createIndex('author', 'author', {unique: false, multiEntry: true});
        }
        if (!upgradeDb.objectStoreNames.contains(TO_UPLOAD_STORE)) {
            const storiesDb = upgradeDb.createObjectStore(TO_UPLOAD_STORE, { keyPath: 'id', autoIncrement: true });
            storiesDb.createIndex('author', 'author', { unique: false, multiEntry: true });
        }
    })
}

const loadStories = async () => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(STORIES_STORE, 'readonly');
        const store = trans.objectStore(STORIES_STORE);
        return store.getAll();
    });
}

const saveStory = async (story) => {
    return dbPromise.then(async db => {
        const trans = db.transaction(STORIES_STORE, 'readwrite');
        const store = trans.objectStore(STORIES_STORE);
        await store.add(story);
        return trans.complete;
    });
}

const deleteStory = async (id) => {
    return dbPromise.then(async db => {
        const trans = db.transaction(STORIES_STORE, 'readwrite');
        const store = trans.objectStore(STORIES_STORE);
        await store.delete(id);
        return trans.complete;
    });
}

const deleteAllStories = () => {
    dbPromise.then(async db => {
        const trans = db.transaction(STORIES_STORE, 'readwrite');
        const store = trans.objectStore(STORIES_STORE);
        await store.delete();
        return trans.complete;
    });
}



const addToUploadList = (story) => {
    let currentCache = localStorage.getItem('toUpload') || [];
    currentCache.push(story);
    localStorage.setItem('toUpload', currentCache);
}

const uploadLater = (story) => {
    dbPromise.then(async db => {
        const trans = db.transaction(TO_UPLOAD_STORE, 'readwrite');
        const store = trans.objectStore(TO_UPLOAD_STORE);
        await store.add(story);
        return trans.complete;
    });
}

const getToUploadStories = async () => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(TO_UPLOAD_STORE, 'readonly');
        const store = trans.objectStore(TO_UPLOAD_STORE);
        return store.getAll();
    });
}

const successfullyUploaded = async (id) => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(TO_UPLOAD_STORE, 'readwrite');
        const store = trans.objectStore(TO_UPLOAD_STORE);
        await store.delete(id);
        return trans.complete;
    });
}