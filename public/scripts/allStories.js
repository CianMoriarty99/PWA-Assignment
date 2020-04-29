const allLoaded = async () => {
    loadAllStories().then(displayStories);
    getAllStories();
};

const getAllStories = () => {
    return fetch('/stories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            deleteAllStories();
            displayStories(await Promise.all(allStories.map(element => getImages(element).then(saveStory))));
        }).catch(console.log())
}

const socket = io();

socket.on("NewStoryPost", () => {
    getAllStories();
});

window.addEventListener('load', allLoaded, false);