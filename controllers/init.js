let mongoose = require('mongoose');
let User = require('../models/users');
let Story = require('../models/stories');
let Vote = require('../models/votes');


exports.init = async () => {
    // uncomment if you need to drop the database
    //
    
    // await Story.deleteMany({})
    // await User.deleteMany({})
    // await Vote.deleteMany({})


    // let user = new User({
    //     username: 'Yeet',
    // });

    // user.save(function (err, results) {
    //     console.log(results._id);
    // });
}