const storiesDiv = document.getElementById('stories');
const storyTextBox = document.getElementById('storyText');
const storyAuthor = document.getElementById('storyAuthor');
const storyImageUpload = document.getElementById('storyImage');
const storyImageNameDisplay = document.getElementById('storyImagesToUpload');
const addButton = document.getElementById('addButton');
const warning = document.getElementById('warningMessage');
warning.style.visibility = 'hidden';

let stories = [];

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
        img.src = story.story.images[i];
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

    const images = Array.from(storyImageUpload.files).map(URL.createObjectURL);
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
    saveStories(stories);
    storyTextBox.value = '';
    storyAuthor.value = '';
    storyImageUpload.value = '';

    storyImageNameDisplay.innerHTML = '';
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

stories = loadStories();
displayStories();

