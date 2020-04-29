let mongoose = require('mongoose');
let User = require('../models/users');
let Story = require('../models/stories');


exports.init = async () => {
    // uncomment if you need to drop the database
    //
    
    // await Story.deleteMany({})


    // let user = new User({
    //     username: 'Yeet',
    // });

    // user.save(function (err, results) {
    //     console.log(results._id);
    // });
}