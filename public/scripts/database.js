function loadStories() {
    const stories = localStorage.getItem('stories');
    return stories ? JSON.parse(stories) : [];
}

function saveStories(stories) {
    localStorage.setItem('stories', JSON.stringify(stories));
}