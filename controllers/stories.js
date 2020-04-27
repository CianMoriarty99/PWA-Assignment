const fs = require('fs')

const Story = require('../models/stories');


exports.getStories = async (req, res) => {
    try {
        const stories = await Story.find({});
        const fixedStories = stories.map(s => {
            const result = s.clean();
            result.deletable = (req.username && s.author == req.username)
            return result
        })
        res.json(fixedStories);
    } catch (e) {
        console.log(e);
        res.status(500).send('error ' + e);
    }
}

exports.myStories = async (req, res) => {
    try{
        const stories = await Story.find({author : req.username})
        res.json(stories.map(s => {
            const result = s.clean()
            result.deletable = true
            return result
        }));
    } catch (e){
        console.log(e);
        res.status(500).send('error ' + e);
    }
}

exports.delete = async (req, res) => {
    const story = req.story
    story.storyImages.forEach(imageName => {
        const filepath = `./public/images/${imageName}`
        try {
            fs.unlinkSync(filepath)
        } catch (e) {}
        
    });
    await Story.deleteOne({_id : req.body.id})
    res.json({message : 'success'})
}

exports.upload = function (req, res) {
    const userStory = req.body;
    if (userStory == null) {
        res.status(403).send('No data sent!')
    }
    try {
        const newStory = new Story({
            author: req.username,
            date: userStory.date,
            time: userStory.time,
            storyText: userStory.storyText,
            storyImages: req.files.map(file => file.filename)
        })
        newStory.save(function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).send('Invalid data!');
                return;
            }
            res.json(newStory);
        });
    } catch (e) {
        console.log(e);
        res.status(500).send('error ' + e);
    }
}
