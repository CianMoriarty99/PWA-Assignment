const allLoaded = async () => {
    loadMyStories().then(displayStories);
    fetch('/stories/myStories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            await storeMyStories(allStories);
            // const loadedStories = await Promise.all(allStories.map( element => getImages(element).then(saveMyStory)));
            loadMyStories().then(displayStories);
        }).catch(console.log());
}

window.addEventListener('load', allLoaded, false);