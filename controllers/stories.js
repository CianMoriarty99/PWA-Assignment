const fs = require('fs')

const Story = require('../models/stories');
const Vote = require('../models/votes');
const socket = require("../socket.io/socket-io");
const Ranking = require('../CollectiveIntelligence/Ranking');

exports.getStories = async (req, res) => {
    try {
        const stories = await Story.find({});
        const votes = await Vote.find({});

        const uniqueAuthors = await Vote.distinct('author');
        const votePrefs = {};

        if (req.username) {
            uniqueAuthors.forEach(auth => {
                let votesForAuthor = votes.filter(obj => obj.author == auth);
                let authorVotes = votesForAuthor.map(row => ({[row.storyId]: row.value}));
                votePrefs[auth] = authorVotes;
            });
        }

        const recommendedScores = {};
        if (req.username) {
            new Ranking()
            .getRecommendScores(votePrefs, req.username, 'sim_pearson')
            .forEach(row => recommendedScores[row.story] = row.score);
        }

        const fixedStories = stories.map(story => {
            const result = story.clean();
            result.recommendScore = req.username ? (recommendedScores[story.id] || 0) : 1;
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
    console.log("VOTINGGGGGGGGGGGGGGG")
    const vote = req.vote;
    const id = req.id;
    const story = req.story;
    const username = req.username;

    const voteRecord = await Vote.findOne({ author: username, storyId: id });
    if (!!voteRecord) {
        const difference = vote - voteRecord.value;
        if (difference !== 0) {
            await Promise.all([
                Story.findByIdAndUpdate(
                    id,
                    { voteSum: story.voteSum + difference },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                ),
                Vote.findOneAndUpdate(
                    { author: username, storyId: id },
                    { value: vote },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                )    
            ]);
        };
        res.status(200)
            .json({ message: `voted ${voteRecord.value}`});
    }
    else {
        await Promise.all([
            new Vote({ author: username, storyId: id, value: vote }).save(),
            Story.findByIdAndUpdate(
                id,
                { voteSum: story.voteSum + vote, voteCount: story.voteCount + 1 },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
        ]);
        res.status(200)
            .json({ message: `voted ${vote}`});
        console.log("How long I have awaited this moment")
    }

    try {
        socket.sendNewPostAlert();
    } catch (e){
        console.log("Socket trouble: " + e.message);
    }
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
            storyTitle: userStory.storyTitle,
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
