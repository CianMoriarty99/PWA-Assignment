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
            console.log('Token is invalid or expired')
            res.status(403)
                .send('Token is invalid or expired');
        }
    }
    else {
        console.log('User must be logged in')
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

const story_exists = async (req, res, next) => {
    const id = req.body.storyId;
    console.log(`id = ${id}`);
    if (!id) {
        res.status(403)
            .send("Missing ID field");
        return;
    } 
    try {
        const story = await Story.exists(id);
        if (story) {
            req.id = id;
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

const valid_vote = (req, res, next) => {
    const vote = req.body.vote;
    console.log(`id = ${vote}`);
    if (!vote || !/[1-5]/.exec(vote)) {
        res.status(400).send('Votes must be numeric and 1-5');
    }
    req.vote = parseInt(vote);
    next();
}


exports.logged_in = logged_in;
exports.logged_out = logged_out
exports.optional_logged_in = optional_logged_in
exports.owns_story = owns_story
exports.story_exists = story_exists
exports.valid_vote = valid_vote
