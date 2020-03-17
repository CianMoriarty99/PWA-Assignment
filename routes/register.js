const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

const initializePassport = require('./../passport-config');
const users = [];

initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)

);


router.get('/', (req,res) => {
    res.render('register.ejs')
});

router.post('/', async (req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            username: req.body.username,
            password: hashedPassword
        });
        res.redirect('/login');
    }catch {
        res.redirect('/register');
    }
    console.log(users);
});

module.exports = router;