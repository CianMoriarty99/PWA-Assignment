var Story = require('../models/stories');
exports.getStories = function (req, res) {
    var data = req.body;
    if (data == null) {
        res.status(403).send('No data sent!')
    }
    try {
        Story.find(
            function (err, stories) {
                if (err)
                    res.status(500).send('Invalid data!');
                var story = null;
                if (stories.length > 0) {
                var lastElem = stories[stories.length-1];
                story = {
                    author: lastElem.author,
                    date: lastElem.date,
                    time: lastElem.time,
                };
            }
                    
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(story));
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}


exports.insert = function (req, res) {
    console.log("Inserting")
    var userStory = req.body;
    console.log(req.body)
    if (userStory == null) {
        res.status(403).send('No data sent!')
    }
    var image = req.files;
    try {
        console.log("HI")
        const newStory = new Story({
            
            //author: userStory.author,
            //date: userStory.date,
            //time: userStory.time,
        })
        console.log("HO")
        console.log('received: ' + newStory);

        newStory.save(function (err, results) {
            console.log(results._id);
            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(newStory));
        });
    } catch (e) {
        console.log(e);
        res.status(500).send('error ' + e);
    }
}
