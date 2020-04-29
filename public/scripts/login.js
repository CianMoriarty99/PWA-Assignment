const username = document.getElementById('username');
const password = document.getElementById('password');
const errors = document.getElementById('loginErrors');

const status = async (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(await response.text());
    }
}

document.getElementById('loginButton').addEventListener('click', e => {
    errors.innerHTML = '';
    e.preventDefault();
    const data = {
        username: username.value,
        password: password.value
    }

    if (!validUsername(data.username)) {
        const errorMessage = document.createElement('p');
        //const node = document.createTextNode(
        errorMessage.textContent = "Username can only contain letters, numbers, and underscores. Must also be between 8 and 64 characters."
        errors.appendChild(errorMessage);
        return;
    } 
    
    console.log(data);

    return fetch('/login', {
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