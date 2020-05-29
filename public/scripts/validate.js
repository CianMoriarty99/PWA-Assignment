/*
 * Checks the username is between 5 and 64 characters long
 * @param username - The username to check
 */
const validUsername = (username) => {
    return !!/^\w{5,64}$/.exec(username);
};

/*
 * Checks the password is between 8 and 64 characters long
 * @param password - The password to check
 */
const validPassword = (password) => {
    return !!/^\S{8,64}$/.exec(password);
};

/*
 * Checks the stories do not contain any line terminators and is between 1 and 150 characters
 * @param story - The story to check
 */
const validStory = (story) => {
    return !!/^(?:.|\s){1,150}$/.exec(story);
}
