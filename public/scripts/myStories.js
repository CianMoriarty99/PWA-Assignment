/*
 * Fetches all stories owned by the logged in user from the server.
 */
const getMyStories = async () => {
    fetch('/stories/myStories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            // Updates local storage and refreshes display
            await storeMyStories(allStories);
            loadMyStories().then(displayStories);
        }).catch(console.log());
}

/*
 * Get all stories from idb and waits for result before displaying them, then attempts to fetch from server
 */
const allLoaded = async () => {
    loadMyStories().then(displayStories);
    getMyStories();
}

// Attempts to create socket connection, registers event handler for a new story post
try {
    const socket = io();
    socket.on("NewStoryPost", () => {
        getMyStories();
    });
}
catch (err) {
    console.log(err);
}

window.addEventListener('load', allLoaded, false);