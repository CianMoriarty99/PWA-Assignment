const username = document.getElementById('username');
const password = document.getElementById('password');
const result = document.getElementById('registerResult');

const status = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.text()))
    }
}

document.getElementById('registerButton').addEventListener('click', e => {
    console.log('i am added!');
    e.preventDefault();
    const data = {
        username: username.value.trim(),
        password: password.value.trim()
    }

    
    console.log(data);
    
    return fetch('/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(status)
    .then(res => document.location.href = '/login')
    .catch(err => result.innerHTML = 'Username taken');
});