const express = require('express');
const multer = require('multer');
const socket = require("../socket.io/socket-io");
const fs = require('fs');

// const upload = multer({ storage: memory });


const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./public/images/");
    },
    filename: function(req, file, callback) {
        const storyNumber = allStories.length;
        const filename = `s${storyNumber}_${file.originalname}`;
        console.log(filename);
        callback(null, filename);
    }
});

const upload = multer({
    storage: storage
});

const router = express.Router();

var allStories = [];

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'hello' });
});

router.get('/stories', (req, res) => {
    //let userLocalStories = req.query.localStoriesCount;
    
    res.json(allStories);
});

/* POST single story. */
router.post('/uploadStory', upload.array('images', 3), (req, res) => {
    const userStory = req.body;
    const images = req.files;
    const newStory = {
        'author': userStory.author,
        'date': userStory.date,
        'time': userStory.time,
        'story': {
            'text': userStory.storyText,
            'images': images.map(file => file.filename)
        }
    };
    allStories.push(newStory);

    try {
        socket.sendNewPostAlert();
    } catch (e){
        console.log("Socket trouble: " + e.message);
    }

    res.json({id: allStories.length, ...newStory});

});

module.exports = router;