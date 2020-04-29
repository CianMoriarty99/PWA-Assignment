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
            res.status(403)
                .send('Token is invalid or expired');
        }
    }
    else {
        res.status(403)
            .send('User must be logged in');
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
            next();
        }
    }
    else {
        next();
    }
}

const logged_out = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, secret);
            console.log('User must be logged out to access this');
            res.status(403)
                .send('User must be logged out to access this');
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
    const id = req.body.id;
    if (!id) {
        res.status(403)
            .send("Missing ID field");
        return;
    } 
    try {
        const story = await Story.exists(id);
        if (story && story.author == req.username) {
            req.story = story;
            next();
        } else {
            res.status(403)
                .send("Story doesn't exist");
        }  
    }
    catch(e) {
        res.status(403)
            .send("????????");
    }
}


exports.logged_in = logged_in;
exports.logged_out = logged_out
exports.optional_logged_in = optional_logged_in
exports.owns_story = owns_story