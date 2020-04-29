const username = document.getElementById('username');
const password = document.getElementById('password');
const errors = document.getElementById('registerErrors');

document.getElementById('registerButton').addEventListener('click', e => {
    errors.innerHTML = '';
    e.preventDefault();
    const data = {
        username: username.value.trim(),
        password: password.value.trim()
    }

    let validationErrors = false;

    if (!validUsername(data.username)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Username can only contain letters, numbers, and underscores. Must also be between 8 and 64 characters."
        errors.appendChild(errorMessage);
        validationErrors = true
    } 

    
    if (!validPassword(data.password)) {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Password cannot contain spaces. Must also be between 8 and 64 characters."
        errors.appendChild(errorMessage);
        validationErrors = true
    } 

    if (validationErrors) return

    return fetch('/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(status)
    .then(res => document.location.href = '/')
    .catch(err => {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = err;
        errors.appendChild(errorMessage);
    })
});