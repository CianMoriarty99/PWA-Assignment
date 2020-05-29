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

    const user_promises = [];
    const hashed = await bcrypt.hash('password', saltRounds);

    for (const user of users){
        user_promises.push(User.create({ 
            user_name: user.userId,
            password: hashed 
        }));
    }

    await Promise.all(user_promises);

    const story_promises = [];

    for (const story of stories) {
        story_promises.push(Story.create({
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
    
    await Promise.all(story_promises);

    const vote_promises = [];
    const story_to_id = {};
    const id_to_update_vals = {};

    for (const user of users) {
        for (const rating of user.ratings) {
            const story_name = rating.storyId;
            let story_id = story_to_id[story_name];
            if (!story_id) {
                const story = await Story.findOne({ storyTitle: story_name });
                story_to_id[story_name] = story._id;
                story_id = story._id;
            }
            vote_promises.push(Vote.create({
                author: user.userId,
                storyId: story_id,
                value: rating.rating
            }));


            const story = id_to_update_vals[story_id] || { total: 0, count: 0};
            story.total += rating.rating;
            story.count++;
            id_to_update_vals[story_id] = story;
        }
    }

    await Promise.all(vote_promises);

    const story_updates = [];

    for (const story_id of Object.keys(id_to_update_vals)) {
        const vals = id_to_update_vals[story_id];
        console.log(story_id, vals);
        story_updates.push(Story.findByIdAndUpdate(
            story_id,
            { $inc: { voteSum: vals.total, voteCount: vals.count }}
        ));
    }

    await Promise.all(story_updates);
    
    res.cookie('token', '', { httpOnly: true })
        .redirect("/");
}