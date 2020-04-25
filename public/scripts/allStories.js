loadAllStories().then(res => {
    stories = res;
    displayStories();
});