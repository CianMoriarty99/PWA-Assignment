const express = require('express');
const multer = require('multer');

const storyController = require('../controllers/stories');
const { logged_in, optional_logged_in, owns_story, story_exists, valid_vote } = require('../utils')


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

router.get('/', optional_logged_in, storyController.getStories);
router.delete('/', logged_in, owns_story, storyController.delete)

router.get('/myStories', logged_in, storyController.myStories);

router.post('/', logged_in, upload.array('images', 3), storyController.upload);

router.get('/vote/:id/:vote', logged_in, story_exists, valid_vote, storyController.vote);


module.exports = router;