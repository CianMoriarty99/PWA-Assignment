const express = require('express');
const multer = require('multer');

const storyController = require('../controllers/stories');
const { loggedIn: loggedIn, optionalLoggedIn, ownsStory, storyExists, validVote } = require('../utils')


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images/");
    },
    filename: (req, file, callback) => {
        const time = new Buffer(new Date().toISOString()).toString('base64')
        const [name, type] = file.originalname.split('.');
        const filename = `${name}_${time}.${type}`;
        console.log(filename);
        callback(null, filename);
    }
});

const upload = multer({
    storage: storage
});


const router = express.Router();

router.get('/', optionalLoggedIn, storyController.getStories);
router.delete('/', loggedIn, ownsStory, storyController.delete)

router.get('/myStories', loggedIn, storyController.myStories);

router.post('/', loggedIn, upload.array('images', 3), storyController.upload);

router.post('/vote', loggedIn, storyExists, validVote, storyController.vote);


module.exports = router;