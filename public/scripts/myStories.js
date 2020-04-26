loadMyStories().then(res => {
    stories = res;
    displayStories();
});