const storyImageUpload = document.getElementById("images");
const storyTextBox = document.getElementById("storyText");

const result = document.getElementById("uploadResult");

document.getElementById('uploadStory').addEventListener('click', () => {
    console.log('trying to upload');
    const storyText = storyTextBox.value.trim();
    const images = Array.from(storyImageUpload.files);	
    const date = new Date().toISOString().slice(0, 10);	
    const time = new Date().toLocaleTimeString();	

    const newStory = {	
        'date': date,	
        'time': time,	
        'storyImages': images,	
        'storyText': storyText	
    };	

    const formdata = new FormData();	

    formdata.append('storyText', storyText);	
    formdata.append('time', time);	
    formdata.append('date', date);	
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
        uploadResult.innerHTML = 'success';
        saveStory(response);	
    }).catch(err => {
        uploadResult.innerHTML = err;
        
        uploadLater(newStory);	
    });	
});