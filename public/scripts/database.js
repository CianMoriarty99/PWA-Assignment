let dbPromise;

const DB_NAME = 'stories_db';
// const ALL_STORIES_STORE = 'allStories';
// const MY_STORIES_STORE = 'myStories';
const STORY_TO_UPLOAD_STORE = 'storyToUpload';
const VOTE_TO_UPLOAD_STORE = 'voteToUpload';

const STORIES_STORE  = 'stories';
const IMAGES_STORE = 'images';
const DATA_STORE = 'data';

const initDbPromise = (resolve) => {
    Promise.all([initDb])
        .then(resolve);
}

// let image = {
//     filename : 'xyz',
//     contents : Blob(),
// }

// let data = {
//     type: 'all' / 'mine' / 'user',
//     contents: []
// }

/*
 * Initializes the idb on users browser, adds Object stores if none are found
 */
const initDb = () => {
    dbPromise = idb.openDb(DB_NAME, 1, (upgradeDb) => {
        if (!upgradeDb.objectStoreNames.contains(STORIES_STORE)) {
            const storiesDb = upgradeDb.createObjectStore(STORIES_STORE, { keyPath: 'id' });
            storiesDb.createIndex('author', 'author', { unique: false, multiEntry: true });
        }

        if (!upgradeDb.objectStoreNames.contains(IMAGES_STORE)) {
            upgradeDb.createObjectStore(IMAGES_STORE, { keyPath: 'filename' });
        }

        if (!upgradeDb.objectStoreNames.contains(DATA_STORE)) {
            upgradeDb.createObjectStore(DATA_STORE, { keyPath: 'type' });
        }

        if (!upgradeDb.objectStoreNames.contains(STORY_TO_UPLOAD_STORE)) {
            upgradeDb.createObjectStore(STORY_TO_UPLOAD_STORE, { keyPath: 'id', autoIncrement: true });
        }

        if (!upgradeDb.objectStoreNames.contains(VOTE_TO_UPLOAD_STORE)) {
            upgradeDb.createObjectStore(VOTE_TO_UPLOAD_STORE, { keyPath: 'storyId', autoIncrement: true });
        }
    });
}

/*
 * Returns images stored in idb
 * @param filename - The filename of the image within idb
 */
const getImage = async (filename) => {
    const image = await dbPromise.then(async db => {
        const imageTrans = db.transaction(IMAGES_STORE, 'readonly');
        const store = imageTrans.objectStore(IMAGES_STORE);
        return store.get(filename);
    });
    return image.contents;
}

/*
 * Returns specified story from the the idb with any related images
 * @param storyId - The id of the story
 */
const getStory = async (storyId) => {
    const story = await dbPromise.then(async db => {
        const storyTrans = db.transaction(STORIES_STORE, 'readonly');
        const store = storyTrans.objectStore(STORIES_STORE);
        return store.get(storyId);
    });
    story.storyImages = await Promise.all(story.storyImages.map(getImage));
    return story;
}

/*
 * Returns all stories that are stored within the idb and their related images
 */
const loadAllStories = async () => {
    return await dbPromise.then(async db => {
        const dataTrans = db.transaction(STORIES_STORE, 'readonly');
        const store = dataTrans.objectStore(STORIES_STORE);
        const stories = await store.getAll();
        for (const story of stories) {
            story.storyImages = await Promise.all(story.storyImages.map(getImage));
        }
        return stories;
    });
}

/*
 * Returns all stories uploaded by the logged in user from the idb
 */
const loadMyStories = async () => {
    return await dbPromise.then(async db => {
        const dataTrans = db.transaction(DATA_STORE, 'readonly');
        const store = dataTrans.objectStore(DATA_STORE);
        const allStories = await store.get('mine') || { contents: [] };
        return Promise.all(allStories.contents.map(getStory));
    });
}

/*
 * Fetches an image from the server
 * @param im - The filename of the image
 */
const getImageFile = async (im) => {
    const url = `/images/${im}`;
    const blob = await fetch(url)
        .then(r => r.blob());

    return {
        filename: im,
        contents: blob
    }
}

/*
 * Stores all stories uploaded by the logged in user in the idb
 * @param allStories - An array of all stories available to the user
 */
const storeMyStories = async (allStories) => {
    allStories.forEach(story => {
        saveStory(story);
    });
    const storyIds = allStories.map(s => s.id);
    await dbPromise.then(async db => {
        const trans = db.transaction(DATA_STORE, 'readwrite');
        const store = trans.objectStore(DATA_STORE);
        await store.put({ 
            type: 'mine',
            contents: storyIds
        });
        return trans.complete;
    });
}

/*
 * Saves a story on the users idb
 * @param story - The story to save
 */
const saveStory = async (story) => {
    await dbPromise.then(async db => {
        const trans = db.transaction(STORIES_STORE, 'readwrite');
        const store = trans.objectStore(STORIES_STORE);
        await store.put(story);
        await Promise.all(story.storyImages.map(async im => {
            const file = await getImageFile(im);
            return saveImage(file);
        }));
        return trans.complete;
    });
    return story;
}

/*
 * Saves an image within the idb Image Store
 * @param image - The image to save
 */
const saveImage = async (image) => {
    await dbPromise.then(async db => {
        const trans = db.transaction(IMAGES_STORE, 'readwrite');
        const store = trans.objectStore(IMAGES_STORE);
        await store.put(image);
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

const deleteAllStories = async () => {
    dbPromise.then(async db => {
        const storiesTrans = db.transaction(STORIES_STORE, 'readwrite');
        const storiesStore = storiesTrans.objectStore(STORIES_STORE);
        await storiesStore.clear();
        const dataTrans = db.transaction(DATA_STORE, 'readwrite');
        const dataStore = dataTrans.objectStore(DATA_STORE);
        await dataStore.update({ type: 'mine', contents: [] });
        return storiesTrans.complete && dataTrans.complete;
    });
}

const deleteAllMyStories = async () => {
    dbPromise.then(async db => {
        const trans = db.transaction(DATA_STORE, 'readwrite');
        const store = trans.objectStore(DATA_STORE);
        await store.update({ 'type': 'mine', contents: [] });
        // await store.clear()
        return trans.complete;
    });
}

/*
 * Adds a story to idb storage to be uploaded at a later time
 * @param story - The story to be added
 */
const uploadStoryLater = (story) => {
    dbPromise.then(async db => {
        const trans = db.transaction(STORY_TO_UPLOAD_STORE, 'readwrite');
        const store = trans.objectStore(STORY_TO_UPLOAD_STORE);
        await store.add(story);
        return trans.complete;
    });
}

/*
 * Adds a vote to idb storage to be uploaded at a later time
 * @param vote - The vote to be added
 */
const uploadVoteLater = (vote) => {
    dbPromise.then(async db => {
        const trans = db.transaction(VOTE_TO_UPLOAD_STORE, 'readwrite');
        const store = trans.objectStore(VOTE_TO_UPLOAD_STORE);
        await store.put(vote);
        return trans.complete;
    });
}

/*
 * Returns all stories stored within the upload later idb store
 */
const getToUploadStories = async () => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(STORY_TO_UPLOAD_STORE, 'readonly');
        const store = trans.objectStore(STORY_TO_UPLOAD_STORE);
        return store.getAll();
    });
}

/*
 * Returns all votes stored within the upload later idb store
 */
const getToUploadVotes = async () => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(VOTE_TO_UPLOAD_STORE, 'readonly');
        const store = trans.objectStore(VOTE_TO_UPLOAD_STORE);
        return store.getAll();
    });
}

/*
 * Removes a story which has been successfully uploaded to the server from the idb upload later store
 * @param id - The id of the story to be removed
 */
const successfullyUploadedStory = async (id) => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(STORY_TO_UPLOAD_STORE, 'readwrite');
        const store = trans.objectStore(STORY_TO_UPLOAD_STORE);
        await store.delete(id);
        return trans.complete;
    });
}

/*
 * Removes a vote which has been successfully uploaded to the server from the idb upload later store
 * @param id - The id of the story to be removed
 */
const successfullyUploadedVote = async (id) => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(VOTE_TO_UPLOAD_STORE, 'readwrite');
        const store = trans.objectStore(VOTE_TO_UPLOAD_STORE);
        await store.delete(id);
        return trans.complete;
    });
}

/*
 * Adds the username of the logged in user to the idb storage
 * @param username - The username to be stored
 */
const putUsername = async (username) => {
    dbPromise.then(async db => {
        const trans = db.transaction(DATA_STORE, 'readwrite');
        const store = trans.objectStore(DATA_STORE);
        await store.put({ type: 'username', username });
        return trans.complete;
    });
}

/*
 * Retrieves the username from the idb if one is present, returns undefined if not
 */
const getUsername = async () => {
    return await dbPromise.then(async db => {
        const trans = db.transaction(DATA_STORE, 'readonly');
        const store = trans.objectStore(DATA_STORE);
        const usernameRecord = await store.get('username') || { username: undefined };
        return usernameRecord.username;
    });
}