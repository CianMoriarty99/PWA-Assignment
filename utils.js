const jwt = require('jsonwebtoken');

const { secret } = require('./private');

const logged_in = async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const verify = jwt.verify(token, secret);
            const username = verify.username;
            req.username = username;
            next();
        }
        catch(err) {
            console.log('Token is invalid or expired');
            res.status(403).send('Token is invalid or expired');
        }
    }
    else {
        console.log('user must be logged in to access this');
        res.status(403).send('Must be logged in');
    }
}

const logged_out = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, secret);
            console.log('user must be logged out to access this');
            res.status(403).send('Must be logged out');
        }
        catch(err) {
            next();
        }
    }
    else {
        next();
    }
}

exports.logged_in = logged_in;
exports.logged_out = logged_out