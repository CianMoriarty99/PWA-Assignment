const storyImageUpload = document.getElementById("images");
const storyTextBox = document.getElementById("storyText");
const storyTitle = document.getElementById("storyTitle");

const errors = document.getElementById("storyErrors");
const sortModeSelector = document.getElementById("sortmode");

/*
 * Get all stories from idb and waits for result before displaying them, then attempts to fetch from server
 */
const allLoaded = async () => {
    loadAllStories().then(displayStories);
    getAllStories();
};

/*
 * Fetches all stories from the server and saves them to idb
 */
const getAllStories = () => {
    return fetch('/stories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            await Promise.all(allStories.map(saveStory));
            loadAllStories().then(displayStories);
        }).catch(console.log())
}

// Attempts to create socket connection, registers event handler for a new story post
try {
    const socket = io();
    socket.on("NewStoryPost", () => {
        getAllStories();
    });
}
catch (err) {
    console.log(err);
}

/*
 * Registers onClick event for the uploadStory button
 */
document.getElementById('uploadStory').addEventListener('click', () => {
    const storyTitle = storyTitle.value.trim()
    const storyText = storyTextBox.value.trim();
    const images = Array.from(storyImageUpload.files);		

    let validationErrors = false;

    // Checks the storyTitle is valid, displays an error if not
    if (!validStory(storyTitle)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Title must be between 1 and 100 characters";
        errors.appendChild(errorMessage);
        validationErrors = true;
    }

    // Checks the storyText is valid, displays an error if not
    if (!validStory(storyText)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Story must be between 1 and 150 characters";
        errors.appendChild(errorMessage);
        validationErrors = true;
    }

    if (validationErrors) return;

    const newStory = {		
        'storyImages': images,	
        'storyText': storyText	
    };	

    // Creates a FormData object for the uploaded story and appends its contents
    const formdata = new FormData();	
    formdata.append('storyText', storyText);	
    for (let image of images) {	
        formdata.append('images', image);	
    }	

    // Creates a POST request for the story FormData object
    fetch('/stories', {	
        method: 'POST',	
        body: formdata,	
    }).then(status)	
    .then(response => response.json())
    .then(response => {
        // If the user is connected, the story is saved on idb
        saveStory(response);	
    }).catch(err => {
        // If the upload fails then show error and add story to upload later queue
        const errorMessage = document.createElement('p');
        errorMessage.textContent = err;
        errors.appendChild(errorMessage);
        uploadStoryLater(newStory);	
    });	
});

/*
 * Event handler for when sortMode button is pressed
 * Updates sortmode and refreshes the stories
 */
sortModeSelector.onchange = () => {
    sortMode = sortModeSelector.options[sortModeSelector.selectedIndex].value;
    loadAllStories().then(displayStories);
    console.log(sortMode);
}

window.addEventListener('load', allLoaded, false);