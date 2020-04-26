const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {logged_in, logged_out} = require('../utils')

const router = express.Router();
const User = require('../models/users');
const {secret} = require('../private')
const saltRounds = 10;





router.get('/login', (req, res) => {
    res.render('login.ejs')

})



router.get('/register', (req, res) => {
    res.render('register.ejs')

})

router.post('/register', async (req, res) => {//logged_out check
    const username = req.body.username;
    const password = req.body.password;
    if (username === undefined || password === undefined) {
        res.status(400).send('required fields missing');
        return;
    }
    bcrypt.hash(password, saltRounds, (err, hashed) => {
        if (err) {
            res.status(400).send('password hash failed?');
            return;
        }
        try {
            const user = User.create({ user_name: username, password: hashed });
            const token = jwt.sign({ username }, secret, {
                expiresIn: '1h'
            });
            res.cookie('token', token, { httpOnly: true })
                .status(200)
                .send(user.username);
            return;
        }
        catch (err) {
            res.status(400).send('could not create user account');
            return;
        }
    });
});

router.get('/all', async (req,res) => {

    res.json(await User.find({}))
})

router.post('/login', async (req, res) => { //logged_out
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password)
    const user = await User.verify(username, password);//cannot read property 'verify' of undefined
    if (!user) {
        console.log('no pass match');
        res.status(401).send('no password match');
        return;
     }
    const token = jwt.sign({ username }, secret, {
         expiresIn: '1h'
    });
    res.cookie('token', token, { httpOnly: true })
    res.redirect('/')
});


router.get('/logout', (req,res) => {
    res.cookie('token', '', { httpOnly: true })
    res.redirect('/')
})


router.get('/li', logged_in , (req, res) => {
    res.send(req.username)
})

router.get('/lo', logged_out , (req, res) => {
    res.send("user logged out")
})




module.exports = router;
