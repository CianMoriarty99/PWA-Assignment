const allLoaded = async () => {
    loadMyStories().then(res => {
        displayStories(res);
    });
    fetch('/stories/myStories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            deleteAllMyStories();
            const loadedStories = await Promise.all(allStories.map( element => getImages(element).then(saveMyStory)));
            displayStories(loadedStories);
        }).catch(console.log());
}

window.addEventListener('load', allLoaded, false);