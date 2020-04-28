const jwt = require('jsonwebtoken');

const { secret } = require('./private');

const Story = require('./models/stories')

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

const optional_logged_in = async (req,res,next) => {
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
            next();
        }
    }
    else {
        console.log('user not logged in');
        next();
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

const owns_story = async (req, res, next) => {
    console.log("owns_story")
    const id = req.body.id
    if (!id) {
        res.status(403).send("No ID")
        return
    } 
    try {
        const story = await Story.exists(id)
        if (story && story.author == req.username) {
            req.story = story
            next();
        } else {
            console.log("No Story")
            res.status(403).send("Story doesn't exist")
        }  
    }
    catch(e) {
        console.log(e)
        res.status(403).send("BAD")
    }
}


exports.logged_in = logged_in;
exports.logged_out = logged_out
exports.optional_logged_in = optional_logged_in
exports.owns_story = owns_story