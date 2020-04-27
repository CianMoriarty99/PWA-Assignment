const allLoaded = async () => {
    loadAllStories().then(res => {
        displayStories(res);
    });
    fetch('/stories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            deleteAllStories()
            displayStories(await Promise.all(allStories.map( element => getImages(element).then(s => {
                saveStory(s)
                return s
            }))))
        }).catch(console.log())


}




window.addEventListener('load', allLoaded, false)