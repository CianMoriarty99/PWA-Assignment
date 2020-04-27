const storiesDiv = document.getElementById('stories');

(async () => {
    await initDbPromise();
    const toUpload = await getToUploadStories();
    Promise.allSettled(
        toUpload.map(e => {
            console.log(e);
            const formdata = new FormData();
            formdata.append('author', e.author);
            formdata.append('storyText', e.storyText);
            formdata.append('time', e.time);
            formdata.append('date', e.date);
            for (let image of e.storyImages) {
                formdata.append('images', image);
            }

            return fetch('/stories/upload', {
                method: 'POST',
                body: formdata,
            }).then(status)
                .then(response => response.json())
                .then(response => {
                    console.log('uploaded stored!');
                    console.log(response);
                    response.storyImages = e.storyImages;
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

const getImages = async (story) => {
    story.storyImages = story.storyImages.map(async s => {    
        const url = `/images/${s}`
        return await fetch(url)
            .then(r => r.blob())
    })
    story.storyImages = await Promise.all(story.storyImages)
    return story
}


const generateStoryElement = (story) => {
    const result = document.createElement("div");
    result.classList.add('story');

    const author = document.createElement("p");
    author.innerText = story.author;

    const message = document.createElement("p");
    message.innerText = story.storyText;
    //if (story.storyImages.length) console.log(story.storyImages)

    const images = document.createElement("span");
    for (let i = 0; i < story.storyImages.length; i++) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(story.storyImages[i]);
        images.appendChild(img);
    }
    const date = document.createElement("p");
    date.innerText = story.date;

    result.appendChild(author);
    result.appendChild(message);
    result.appendChild(images);
    result.appendChild(date);

    if(story.deletable){
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener('click', () => {
            const url = '/stories'
            const options = {
                method: 'DELETE',
                headers: 
                {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: story.id})
            }
            fetch(url, options)
                .then(console.log).catch(console.log)
        });
        result.appendChild(deleteButton);
    }




    return result;
}

function displayStories(stories) {
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

const sortStories = () => {
    stories.sort((a, b) => {
        if (a.date === b.date) {
            return a.time > b.time ? 1 : -1
        }
        return a.date > b.date ? 1 : -1;
    });
}

initDb();