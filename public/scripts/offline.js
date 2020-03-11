let stories = [];

const storiesDiv = document.getElementById('stories');
const textBox = document.getElementById('storyText');

function displayStories() {
    storiesDiv.style.visibility = 'hidden';
    storiesDiv.innerHTML = '';

    for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        const container = document.createElement("span");
        const textContainer = document.createElement("span");
        textContainer.textContent = story;
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener('click', () => {
            stories = stories.filter((ele, ind) => ind !== i);
            saveStories(stories);
            displayStories();
        });

        container.appendChild(textContainer);
        container.appendChild(deleteButton);

        storiesDiv.appendChild(container);
        storiesDiv.appendChild(document.createElement("br"));

    }
    storiesDiv.style.visibility = 'visible';
}

function addElement() {
    const storyText = textBox.value;
    textBox.value = '';
    stories.push(storyText);
    displayStories();
    saveStories(stories);
    console.log(storyText);
}

textBox.addEventListener('keyup', event => {
    if (event.key === "Enter") addElement();
});

document.getElementById('addButton').addEventListener('click', () => addElement());

stories = loadStories();
displayStories();

