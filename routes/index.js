const express = require('express');
const multer = require('multer');
const fs = require('fs');
// const upload = multer({ storage: memory });

var bodyParser= require("body-parser");


//var user = require('../controllers/users');
var storyController = require('../controllers/stories');
var initDB= require('../controllers/init');

initDB.init();

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


router.get('/', function(req, res, next) {
    res.render('index', { title: 'My Form' });
  });
  


/* GET home page. */
router.get('/stories', function(req, res) {
    res.render('stories', { title: 'hello' });
});



/* POST single story. */

router.post('/uploadStory', storyController.insert);




router.post('/stories', storyController.getStories);


module.exports = router;