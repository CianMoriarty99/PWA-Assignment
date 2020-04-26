const Story = require('../models/stories');

exports.getStories = async (req, res) => {
    try {
        const stories = await Story.find({});
        const fixedStories = stories.map(s => {
            const result = s.clean();
            result.deletable = (req.username && s.author == req.username)
            return result
        })
        console.log(fixedStories)
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


exports.upload = function (req, res) {
    console.log("Inserting")
    const userStory = req.body;
    console.log(req.body)
    if (userStory == null) {
        res.status(403).send('No data sent!')
    }
    try {
        console.log("HI")
        const newStory = new Story({
            author: req.username,
            date: userStory.date,
            time: userStory.time,
            storyText: userStory.storyText,
            storyImages: req.files.map(file => file.filename)
        })
        
        console.log("HO")
        console.log('received: ' + newStory);

        newStory.save(function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).send('Invalid data!');
                return;
            }
            
            console.log(results._id);

            res.json(newStory);
        });
    } catch (e) {
        console.log(e);
        res.status(500).send('error ' + e);
    }
}
