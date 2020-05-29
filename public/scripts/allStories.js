const storyImageUpload = document.getElementById("images");
const storyTextBox = document.getElementById("storyText");
const storyTitle = document.getElementById("storyTitle");

const errors = document.getElementById("storyErrors");
const sortModeSelector = document.getElementById("sortmode");

const allLoaded = async () => {
    loadAllStories().then(displayStories);
    getAllStories();
};

const getAllStories = () => {
    return fetch('/stories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            await Promise.all(allStories.map(saveStory));
            loadAllStories().then(displayStories);
        }).catch(console.log())
}

try {
    const socket = io();
    socket.on("NewStoryPost", () => {
        getAllStories();
    });
}
catch (err) {
    console.log(err);
}

document.getElementById('uploadStory').addEventListener('click', () => {
    const storyTitleText = storyTitle.value.trim()
    const storyText = storyTextBox.value.trim();
    const images = Array.from(storyImageUpload.files);		

    let validationErrors = false;

    if (!validStory(storyTitleText)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Title must be between 1 and 100 characters";
        errors.appendChild(errorMessage);
        validationErrors = true;
    }

    if (!validStory(storyText)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Story must be between 1 and 150 characters";
        errors.appendChild(errorMessage);
        validationErrors = true;
    }

    if (validationErrors) return;

    const newStory = {		
        'storyImages': images,	
        'storyTitleText': storyTitleText,
        'storyText': storyText	
    };	

    const formdata = new FormData();	
    formdata.append('storyTitle', storyTitleText);	
    formdata.append('storyText', storyText);	
    for (let image of images) {	
        formdata.append('images', image);	
    }	

    fetch('/stories', {	
        method: 'POST',	
        body: formdata,	
    }).then(status)	
    .then(response => response.json())
    .then(response => {	
        saveStory(response);	
    }).catch(err => {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = err;
        errors.appendChild(errorMessage);
        uploadStoryLater(newStory);	
    });	
});

sortModeSelector.onchange = () => {
    sortMode = sortModeSelector.options[sortModeSelector.selectedIndex].value;
    loadAllStories().then(displayStories);
    console.log(sortMode);
}

window.addEventListener('load', allLoaded, false);