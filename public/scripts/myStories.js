const getMyStories = async () => {
    fetch('/stories/myStories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            await storeMyStories(allStories);
            loadMyStories().then(displayStories);
        }).catch(console.log());
}

const allLoaded = async () => {
    loadMyStories().then(displayStories);
    getMyStories();
}

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