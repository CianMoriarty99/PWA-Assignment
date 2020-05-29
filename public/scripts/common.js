const storiesDiv = document.getElementById('stories');
const navbar = document.getElementById('navbar');
let sortMode = "date";

/*
 * Returns the Promise.resolve or Promise.reject depending on the status code
 * @param response - The response to check
 */
const status = async (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(await response.text());
    }
}

/*
 * Generates HTML elements needed to display a story
 * @param story - The story object to display
 */
const generateStoryElement = (story) => {
    const result = document.createElement("div");
    result.classList.add('story');

    const author = document.createElement("p");
    author.innerText = story.author;

    const title = document.createElement("p");
    title.innerText = story.storyTitle;

    const message = document.createElement("p");
    message.innerText = story.storyText;

    const images = document.createElement("span");

    // Creates img elements for the stories images
    for (let image of story.storyImages) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(image);
        images.appendChild(img);
    }

    const date = document.createElement("p");
    date.innerText = story.date;

    const time = document.createElement("p");
    time.innerText = story.time;

    // Calculates the average score for a stories votes
    const score = document.createElement("p");
    const scoreNumber = '' + (story.voteSum / (story.voteCount || 1));
    score.innerText = `Score: ${scoreNumber.slice(0, 4)}/5, ${story.voteCount} votes total`;

    const voteButtons = document.createElement("span");

    // Creates a button for each score a user can give
    for (i = 1; i <= 5; i++){
        const button = document.createElement("button");
        button.innerText = i;
        const j = i;

        // Event listener for a vote button, creates a POST request when button is pressed
        button.addEventListener('click', () => {
            const vote = { vote: j , storyId: story.id };
            const url = "/stories/vote/"
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vote)
            }
            
            fetch(url, options)
                .then(console.log)
                .catch(e => uploadVoteLater(vote))
        });

        voteButtons.appendChild(button);
    }


    result.appendChild(author);
    result.appendChild(title);
    result.appendChild(message);
    result.appendChild(images);
    result.appendChild(date);
    result.appendChild(time);
    result.appendChild(score);
    result.appendChild(voteButtons);

    // Creates delete button if the story belongs to the signed in user
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
                .catch(r => console.log(r.text()));
        });
        result.appendChild(deleteButton);
    }
    return result;
}

/*
 * Displays given stories on the page
 * @param stories - Array of stories to display
 */
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

/*
 * Sorts an array of stories by either date or recommendedScore depending on the
 * selected sort method
 * @param stories - Array of stories to sort
 */
const sortStories = stories => {
    if (sortMode == "date"){
        stories.sort((a, b) => {
            if (a.date === b.date) {
                return a.time > b.time ? -1 : 1
            }
            return a.date > b.date ? -1 : 1;
        });
    } else {
        stories.sort((a, b) => {
            if (a.recommendScore !== b.recommendScore){
                return a.recommendScore > b.recommendScore ? -1 : 1;
            }

            return a.date > b.date ? -1 : 1;
        });
    }
}

/*
 * Adds event listener for a "load" event on the window.
 */
window.addEventListener('load', async () => {
    initDb();

    // Queries server to see whether user is currently logged in
    const li = fetch('li')
        .then(status)
        .then(res => res.text())
        .then(putUsername)
        .catch(() => {});
    const lo = fetch('lo')
        .then(status)
        .then(() => putUsername(undefined))
        .catch(() => {});

    await Promise.all([li, lo]);

    // Attempts to upload any stories which have been queued for upload
    (async () => {
        await initDbPromise();
        const toUpload = await getToUploadStories();
        Promise.allSettled(
            toUpload.map(story => {
                const formdata = new FormData();
                formdata.append('author', story.author);
                formdata.append('storyText', story.storyText);
                for (let image of story.storyImages) {
                    formdata.append('images', image);
                }
    
                return fetch('/stories', {
                    method: 'POST',
                    body: formdata,
                }).then(status)
                    .then(response => response.json())
                    .then(response => {
                        response.storyImages = story.storyImages;
                        saveStory(response);
                        successfullyUploadedStory(story.id);
                    }).catch(err => {
                        console.log(err);
                    });
            })
        );
    })();

    // Attempts to upload story votes which have been queued to upload
    (async () => {
        await initDbPromise();
        const toUpload = await getToUploadVotes();
        Promise.allSettled(
            toUpload.map(vote => {
                const url = "/stories/vote/"
                const options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vote)
                }
    
                return fetch(url, options)
                    .then(status)
                    .then(response => response.json())
                    .then(response => {
                        successfullyUploadedVote(vote.storyId);
                    }).catch(err => {
                        console.log(err);
                    });
            })
        );
    })();

    // Checks whether user is logged in and modifies top navbar appropriately
    getUsername()
        .then(username => {
            if (username) {
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
                
            }
            else {
                const loginOption = document.createElement('a');
                loginOption.href = '/login';
                loginOption.innerHTML = 'Login';
                const registerOption = document.createElement('a');
                registerOption.href = '/register';
                registerOption.innerHTML = 'Register';
    
                navbar.appendChild(loginOption);
                navbar.appendChild(registerOption);
            }
        });
}, false);