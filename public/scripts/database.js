let dbPromise;

const DB_NAME = 'stories_db';
const ALL_STORIES_STORE = 'allStories';
const MY_STORIES_STORE = 'myStories';
const TO_UPLOAD_STORE = 'toUpload'

const initDbPromise = (resolve) => {
    Promise.all([initDb])
        .then(resolve);
}

const initDb = () => {
    dbPromise = idb.openDb(DB_NAME, 1, (upgradeDb) => {
        if (!upgradeDb.objectStoreNames.contains(ALL_STORIES_STORE)) {
            const storiesDb = upgradeDb.createObjectStore(ALL_STORIES_STORE, {keyPath: 'id', autoIncrement: true});
            storiesDb.createIndex('author', 'author', {unique: false, multiEntry: true});
        }
        if (!upgradeDb.objectStoreNames.contains(MY_STORIES_STORE)) {
            const storiesDb = upgradeDb.createObjectStore(MY_STORIES_STORE, { keyPath: 'id', autoIncrement: true });
            storiesDb.createIndex('author', 'author', { unique: false, multiEntry: true });
        }
        if (!upgradeDb.objectStoreNames.contains(TO_UPLOAD_STORE)) {
            const storiesDb = upgradeDb.createObjectStore(TO_UPLOAD_STORE, { keyPath: 'id', autoIncrement: true });
            storiesDb.createIndex('author', 'author', { unique: false, multiEntry: true });
        }
    })
}

const loadAllStories = async () => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(ALL_STORIES_STORE, 'readonly');
        const store = trans.objectStore(ALL_STORIES_STORE);
        return store.getAll();
    });
}

const loadMyStories = async () => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(MY_STORIES_STORE, 'readonly');
        const store = trans.objectStore(MY_STORIES_STORE);
        return store.getAll();
    });
}

const saveStory = async (story) => {
    await dbPromise.then(async db => {
        const trans = db.transaction(ALL_STORIES_STORE, 'readwrite');
        const store = trans.objectStore(ALL_STORIES_STORE);
        await store.add(story);
        return trans.complete;
    });
    return story;
}

const deleteStory = async (id) => {
    return dbPromise.then(async db => {
        const trans = db.transaction(ALL_STORIES_STORE, 'readwrite');
        const store = trans.objectStore(ALL_STORIES_STORE);
        await store.delete(id);
        return trans.complete;
    });
}

const deleteAllStories = () => {
    dbPromise.then(async db => {
        const trans = db.transaction(ALL_STORIES_STORE, 'readwrite');
        const store = trans.objectStore(ALL_STORIES_STORE);
        await store.clear()
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