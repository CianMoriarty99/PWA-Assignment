const fs = require('fs')

const Story = require('../models/stories');
const Vote = require('../models/votes');
const socket = require("../socket.io/socket-io");


exports.getStories = async (req, res) => {
    try {
        const stories = await Story.find({});
        const fixedStories = stories.map(s => {
            const result = s.clean();
            result.deletable = (req.username && s.author == req.username);
            return result;
        });
        res.json(fixedStories);
    } catch (e) {
        console.log(e);
        res.status(500).send('error ' + e);
    }
}

exports.myStories = async (req, res) => {
    console.log(`called my stories with username ${req.username}`);
    try{
        const stories = await Story.find({ author : req.username });
        console.log(stories);
        res.json(stories.map(s => {
            const result = s.clean();
            result.deletable = true;
            return result;
        }));
    } catch (e){
        console.log(e);
        res.status(500).send('error ' + e);
    }
}

exports.delete = async (req, res) => {
    const story = req.story;
    story.storyImages.forEach(imageName => {
        const filepath = `./public/images/${imageName}`;
        try {
            fs.unlinkSync(filepath);
        } catch (e) {}
    });
    await Story.deleteOne({ _id : story._id });
    res.json({message : 'success'});

    try {
        socket.sendNewPostAlert();
    } catch (e){
        console.log("Socket trouble: " + e.message);
    }
}

exports.vote = async (req, res) => {
    const vote = req.vote;
    const id = req.body.id;
    const story = req.story;
    const username = req.body.username;


    const voteRecord = await Vote.findOneAndUpdate(
        { author: username, storyId: id },
        { value: vote },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200)
        .json({ message: `voted ${voteRecord.value}`});
}

exports.upload = async (req, res) => {
    const userStory = req.body;
    if (userStory == null) {
        res.status(403)
            .send('No data sent!');
    }
    try {
        const rawDate = new Date();
        const date = rawDate.toISOString().slice(0, 10);	
        const time = rawDate.toLocaleTimeString();	

        const newStory = new Story({
            author: req.username,
            date: date,
            time: time,
            storyText: userStory.storyText,
            storyImages: req.files.map(file => file.filename),
            voteCount: 0,
            voteSum: 0
        });
        await newStory.save();

        try {
            socket.sendNewPostAlert();
        } catch (e){
            console.log("Socket trouble: " + e.message);
        }
        console.log(`returning: ${JSON.stringify(newStory.clean())}`);
        res.json(newStory.clean());
    } catch (e) {
        console.log(e);
        res.status(500)
            .send('error ' + e);
    }
}
