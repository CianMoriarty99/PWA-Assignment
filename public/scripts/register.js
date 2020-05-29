const username = document.getElementById('username');
const password = document.getElementById('password');
const errors = document.getElementById('registerErrors');

/*
 * Get all stories from idb and waits for result before displaying them, then attempts to fetch from server
 */
document.getElementById('registerButton').addEventListener('click', e => {
    errors.innerHTML = '';
    e.preventDefault();

    // Create object containing username and password, trims the whitespace
    const data = {
        username: username.value.trim(),
        password: password.value.trim()
    }

    let validationErrors = false;

    // Checks that the username is of a valid format, displays error if not
    if (!validUsername(data.username)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Username can only contain letters, numbers, and underscores. Must also be between 8 and 64 characters."
        errors.appendChild(errorMessage);
        validationErrors = true
    } 

    // Checks that the password is of a valid format, displays error if not
    if (!validPassword(data.password)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Password cannot contain spaces. Must also be between 8 and 64 characters."
        errors.appendChild(errorMessage);
        validationErrors = true
    } 

    if (validationErrors) return

    // Creates a register POST request to the server with the username and password supplied by the user
    return fetch('/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(status)
    .then(res => document.location.href = '/')
    .catch(err => {
        // If the username or password is is an invalid format, an error is shown
        const errorMessage = document.createElement('p');
        errorMessage.textContent = err;
        errors.appendChild(errorMessage);
    })
});