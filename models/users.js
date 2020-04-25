var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var User = new Schema(
    {
        user_name: {type: String, required: true, max: 100},
        password: {type: String, required: true, max: 100},
    }
);

User.virtual('username')
    .get(function () {
        const result= this.user_name;
        return result;
    });

User.set('toObject', {getters: true, virtuals: true});


var userModel = mongoose.model('User', User );

module.exports = userModel;