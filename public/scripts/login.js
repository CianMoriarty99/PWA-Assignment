const username = document.getElementById('username');
const password = document.getElementById('password');
const result = document.getElementById('loginResult');

const status = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.text()))
    }
}

document.getElementById('loginButton').addEventListener('click', e => {
    console.log('i am added!');
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
    .then(res => res.json())
    .then(res => result.innerHTML = JSON.stringify(res))
    .catch(err => result.innerHTML = 'no log in');
});