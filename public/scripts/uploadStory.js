const storyImageUpload = document.getElementById("images");
const storyTextBox = document.getElementById("storyText");

const errors = document.getElementById("storyErrors");

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

    fetch('/stories/upload', {	
        method: 'POST',	
        body: formdata,	
    }).then(status)	
    .then(response => response.json())
    .then(response => {	
        response.storyImages = images;	
        saveStory(response);	
        document.location.href = '/';
    }).catch(err => {
        uploadResult.innerHTML = err;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = err;
        errors.appendChild(errorMessage);
        uploadLater(newStory);	
    });	
});