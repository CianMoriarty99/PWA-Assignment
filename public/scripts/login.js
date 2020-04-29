const username = document.getElementById('username');
const password = document.getElementById('password');
const result = document.getElementById('loginResult');

const status = async (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(await response.text());
    }
}

document.getElementById('loginButton').addEventListener('click', e => {

    e.preventDefault();
    const data = {
        username: username.value,
        password: password.value
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
    .catch(err => result.innerHTML = 'no log in');
});