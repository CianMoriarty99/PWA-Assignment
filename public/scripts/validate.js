const validUsername = (username) => {
    return !!/^\w{8,64}$/.exec(username);
};

const validPassword = (password) => {
    return !!/^\S{8,64}$/.exec(password);
};

const validStory = (story) => {
    return !!/^(?:.|\s){1,150}$/.exec(story);
}
