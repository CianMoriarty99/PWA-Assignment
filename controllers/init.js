var mongoose = require('mongoose');
var User = require('../models/users');
var Story = require('../models/stories');


exports.init = async () => {
    // uncomment if you need to drop the database
    //
    
    await Story.deleteMany({})


    // var user = new User({
    //     username: 'Yeet',
    // });

    // user.save(function (err, results) {
    //     console.log(results._id);
    // });
}