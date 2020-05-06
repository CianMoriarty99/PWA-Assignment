const storyImageUpload = document.getElementById("images");
const storyTextBox = document.getElementById("storyText");

const errors = document.getElementById("storyErrors");

const allLoaded = async () => {
    loadAllStories().then(displayStories);
    getAllStories();
};

const getAllStories = () => {
    return fetch('/stories')
        .then(status)
        .then(r => r.json())
        .then(async allStories => {
            // await deleteAllStories();
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
    const storyText = storyTextBox.value.trim();
    const images = Array.from(storyImageUpload.files);		

    let validationErrors = false;

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

    const formdata = new FormData();	
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
        uploadLater(newStory);	
    });	
});

window.addEventListener('load', allLoaded, false);