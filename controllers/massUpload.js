const fs = require('fs');
const bcrypt = require('bcryptjs');

const Story = require('../models/stories');
const Vote = require('../models/votes');
const User = require('../models/users');

const saltRounds = 10;

exports.massUpload = async (req, res) => {
    const file = req.file;
    if (!file) {
        res.redirect('/massUpload');
    }
    const text = fs.readFileSync(file.path);
    const uploadData = JSON.parse(text);
    const users = uploadData.users;
    const stories = uploadData.stories;

    // delete all existing records from tables

    await User.deleteMany({});
    await Vote.deleteMany({});
    await Story.deleteMany({});

    // repopulate

    const userPromises = [];
    const hashed = await bcrypt.hash('password', saltRounds);

    for (const user of users){
        userPromises.push(User.create({ 
            username: user.userId,
            password: hashed 
        }));
    }

    await Promise.all(userPromises);

    const storyPromises = [];

    for (const story of stories) {
        storyPromises.push(Story.create({
            author: story.userId,
            date: "hello",
            time: "hello",
            storyTitle: story.storyId,
            storyText: story.text,
            storyImages: [],
            voteCount: 0,
            voteSum: 0
        }));
    }
    
    await Promise.all(storyPromises);

    const votePromises = [];
    const storyToId = {};
    const idToUpdateVals = {};

    for (const user of users) {
        for (const rating of user.ratings) {
            const storyName = rating.storyId;
            let storyId = storyToId[storyName];
            if (!storyId) {
                const story = await Story.findOne({ storyTitle: storyName });
                storyToId[storyName] = story._id;
                storyId = story._id;
            }
            votePromises.push(Vote.create({
                author: user.userId,
                storyId: storyId,
                value: rating.rating
            }));

            const story = idToUpdateVals[storyId] || { total: 0, count: 0};
            story.total += rating.rating;
            story.count++;
            idToUpdateVals[storyId] = story;
        }
    }

    await Promise.all(votePromises);

    const storyUpdates = [];

    for (const storyId of Object.keys(idToUpdateVals)) {
        const vals = idToUpdateVals[storyId];
        console.log(storyId, vals);
        storyUpdates.push(Story.findByIdAndUpdate(
            storyId,
            { $inc: { voteSum: vals.total, voteCount: vals.count }}
        ));
    }

    await Promise.all(storyUpdates);
    
    res.cookie('token', '', { httpOnly: true })
        .redirect("/");
}