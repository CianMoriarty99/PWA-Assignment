const storiesDiv = document.getElementById('stories');
const navbar = document.getElementById('navbar');

const status = async (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(await response.text());
    }
}


const generateStoryElement = (story) => {
    const result = document.createElement("div");
    result.classList.add('story');

    const author = document.createElement("p");
    author.innerText = story.author;

    const message = document.createElement("p");
    message.innerText = story.storyText;

    const images = document.createElement("span");
    for (let image of story.storyImages) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(image);
        images.appendChild(img);
    }
    const date = document.createElement("p");
    date.innerText = story.date;

    const time = document.createElement("p");
    time.innerText = story.time;

    result.appendChild(author);
    result.appendChild(message);
    result.appendChild(images);
    result.appendChild(date);
    result.appendChild(time);

    if(story.deletable){
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener('click', () => {
            const url = '/stories'
            const options = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: story.id })
            }
            fetch(url, options)
                .then(console.log)
                .catch(console.log);
        });
        result.appendChild(deleteButton);
    }
    return result;
}

const displayStories = (stories) => {
    storiesDiv.style.visibility = 'hidden';
    storiesDiv.innerHTML = '';
    sortStories(stories);
    for (let story  of stories) {
        const ele = generateStoryElement(story);
        storiesDiv.appendChild(ele);
        storiesDiv.appendChild(document.createElement("br"));
    }

    storiesDiv.style.visibility = 'visible';
}

const sortStories = stories => {
    stories.sort((a, b) => {
        if (a.date === b.date) {
            return a.time > b.time ? -1 : 1
        }
        return a.date > b.date ? -1 : 1;
    });
}



const commonAllLoaded = () => {
    initDb();

    (async () => {
        await initDbPromise();
        const toUpload = await getToUploadStories();
        Promise.allSettled(
            toUpload.map(e => {
                const formdata = new FormData();
                formdata.append('author', e.author);
                formdata.append('storyText', e.storyText);
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

    fetch('/li')
        .then(status)
        .then(res => res.text())
        .then(username => {
            const myStories = document.createElement('a');
            myStories.href = '/me';
            myStories.innerHTML = 'My Stories';

            const usernameField = document.createElement('span');
            usernameField.innerHTML = username;

            const logoutOption = document.createElement('a');
            logoutOption.href = '/logout';
            logoutOption.innerHTML = 'Logout';

            navbar.appendChild(myStories);
            navbar.appendChild(usernameField);
            navbar.appendChild(logoutOption);
        }).catch(() => {
            const loginOption = document.createElement('a');
            loginOption.href = '/login';
            loginOption.innerHTML = 'Login';
            const registerOption = document.createElement('a');
            registerOption.href = '/register';
            registerOption.innerHTML = 'Register';

            navbar.appendChild(loginOption);
            navbar.appendChild(registerOption);
        });
}


window.addEventListener('load', commonAllLoaded, false);