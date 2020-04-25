const storiesDiv = document.getElementById('stories');
const storyTextBox = document.getElementById('storyText');
const storyAuthor = document.getElementById('storyAuthor');
const storyImageUpload = document.getElementById('storyImage');
const storyImageNameDisplay = document.getElementById('storyImagesToUpload');
const addButton = document.getElementById('addButton');
const warning = document.getElementById('warningMessage');
warning.style.visibility = 'hidden';

const successes = document.getElementById('successes');
const errors = document.getElementById('errors');
const onlineStories = document.getElementById('onlineStories');

let stories = [];

(async () => {
    await initDbPromise();
    const toUpload = await getToUploadStories();
    Promise.allSettled(
        toUpload.map(e => {
            console.log(e);
            const formdata = new FormData();
            formdata.append('author', e.author);
            formdata.append('storyText', e.story.text);
            formdata.append('time', e.time);
            formdata.append('date', e.date);
            for (let image of e.story.images) {
                formdata.append('images', image);
            }

            return fetch('/uploadStory', {
                method: 'POST',
                body: formdata,
            }).then(status)
                .then(response => response.json())
                .then(response => {
                    console.log('uploaded stored!');
                    response.story.images = e.story.images;
                    saveStory(response);
                    successfullyUploaded(e.id);
                }).catch(err => {
                    console.log(err);
                });
        })
    );
})();

const status = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.text()))
    }
}

function generateStoryElement(story) {
    const result = document.createElement("div");
    result.classList.add('story');

    const author = document.createElement("p");
    author.innerText = story.author;

    const message = document.createElement("p");
    message.innerText = story.story.text;

    const images = document.createElement("span");
    for (let i = 0; i < story.story.images.length; i++) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(story.story.images[i]);
        images.appendChild(img);
    }
    const date = document.createElement("p");
    date.innerText = story.date;

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.addEventListener('click', () => {
        stories = stories.filter(s => s !== story);

        saveStories(stories);
        displayStories();
    });

    result.appendChild(author);
    result.appendChild(message);
    result.appendChild(images);
    result.appendChild(date);
    result.appendChild(deleteButton);

    return result;
}

function displayStories() {
    storiesDiv.style.visibility = 'hidden';
    storiesDiv.innerHTML = '';

    for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        const ele = generateStoryElement(story);

        storiesDiv.appendChild(ele);
        storiesDiv.appendChild(document.createElement("br"));

    }
    storiesDiv.style.visibility = 'visible';
}

function addElement() {
    const author = storyAuthor.value;
    const storyText = storyTextBox.value;

    if (/^\s*$/.test(author) || /^\s*$/.test(storyText)) return;

    const images = Array.from(storyImageUpload.files);
    const date = new Date().toISOString().slice(0, 10);
    const time = (new Date()).toLocaleTimeString();

    const newStory = {
        'author': author,
        'date': date,
        'time': time,
        'story': {
            'text': storyText,
            'images': images
        }
    };

    stories.push(newStory);
    displayStories();
    
    storyTextBox.value = '';
    storyAuthor.value = '';
    storyImageUpload.value = '';
    storyImageNameDisplay.innerHTML = '';

    const formdata = new FormData();
    formdata.append('author', author);
    formdata.append('storyText', storyText);
    formdata.append('time', time);
    formdata.append('date', date);
    for (let image of images) {
        formdata.append('images', image);
    }

    fetch('/uploadStory', {
        method: 'POST',
        body: formdata,
    }).then(status)
    .then(response => response.json())
    .then(response => {
        response.story.images = images;
        saveStory(response);
        errors.innerHTML = '';
        successes.innerHTML = 'success!';
    }).catch(err => {
        console.log(err);
        uploadLater(newStory);
        errors.innerHTML = 'error!!!';
        successes.innerHTML = '';
    });
}

storyTextBox.addEventListener('keyup', event => {
    if (event.key === "Enter") addElement();
});

document.getElementById('storyImage').addEventListener('change', event => {
    if (event.target.files.length > 3) {
        addButton.style.visibility = 'hidden';
        warning.style.visibility = 'visible';
    }
    else {
        addButton.style.visibility = 'visible';
        warning.style.visibility = 'hidden';
    }
});

document.getElementById('addButton').addEventListener('click', () => addElement());
document.getElementById('deleteAllStories').addEventListener('click', () => deleteAllStories());

document.getElementById('loadOnline').addEventListener('click', () => {
    fetch('stories')
        .then(status)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            onlineStories.innerHTML = JSON.stringify(response);
        }).catch(err => {
            console.log(err);
            onlineStories.innerHTML = 'oh no!';
        });
});

function sortStories(){
    stories.sort((a, b) => {
        if (a.date === b.date) {
            return a.time > b.time ? 1 : -1
        }
        return a.date > b.date ? 1 : -1;
    });
}

initDb();
loadStories().then(res => {
    stories = res;
    displayStories();
});



/*
indexedDB:
- allStories
- myStories
- toUpload
 fetch(`/stories?count=${xyz}`
*/