const username = document.getElementById('username');
const password = document.getElementById('password');
const errors = document.getElementById('loginErrors');

/*
 * Adds an onClick event listener to the loginButton html element
 */
document.getElementById('loginButton').addEventListener('click', e => {
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
        errorMessage.textContent = "Username can only contain letters, numbers, and underscores. Must also be between 8 and 64 characters.";
        errors.appendChild(errorMessage);
        validationErrors = true;
    }

    // Checks that the password is of a valid format, displays error if not
    if (!validPassword(data.password)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Password cannot contain spaces. Must also be between 8 and 64 characters.";
        errors.appendChild(errorMessage);
        validationErrors = true;
    } 

    if (validationErrors) return

    // Creates a login post request to the server with the entered username and password
    return fetch('/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(status)
    .then(res => document.location.href = '/')
    .catch(err => {
        // If the username or password is incorrect, an error is shown
        const errorMessage = document.createElement('p');
        errorMessage.textContent = err;
        errors.appendChild(errorMessage);
    })
});