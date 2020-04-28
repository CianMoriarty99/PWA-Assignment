const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/users');
const { secret } = require('../private');

const saltRounds = 10;

exports.getUsername = (req, res) => {
    const userData = req.body;
    if (userData == null) {
        res.status(403).send('No data sent!');
    }
}

exports.login = async (req, res) => { //logged_out
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password);
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
      .json({result: 'success'})
};

exports.register = async (req, res) => {//logged_out check
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
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
}