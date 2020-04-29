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

exports.login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password);
    const user = await User.verify(username, password);
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

exports.register = async (req, res) => {
    const { username, password}  = req.body;
    if (!username || !password) {
        res.status(400).send('required fields missing');
        return;
    }

    const user = await User.findOne({ user_name : username });
    if (user) {
        console.log('username taken');
        res.status(401).send('username taken');
        return;
    }
    try{
        const hashed = await bcrypt.hash(password, saltRounds);
        const user = User.create({ 
            user_name: username, 
            password: hashed 
        });
        const token = jwt.sign({ username }, secret, {
            expiresIn: '1h'
        });
        res.cookie('token', token, { httpOnly: true })
            .status(200)
            .send(user.username);
    }
    catch (err) {
        res.status(400).send('could not create user account');
    }
}