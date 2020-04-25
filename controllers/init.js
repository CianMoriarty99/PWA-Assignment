var mongoose = require('mongoose');
var User = require('../models/users');
var Story = require('../models/stories');


exports.init= function() {
    // uncomment if you need to drop the database
    //
    // User.deleteMany({}, function(err) {
    //    console.log('collection removed')
    // });

    // var user = new User({
    //     username: 'Yeet',
    // });

    // user.save(function (err, results) {
    //     console.log(results._id);
    // });
}