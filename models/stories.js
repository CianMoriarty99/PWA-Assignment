var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Story = new Schema(
    {
        author: {type: String, required: true, max: 100},
        date: {type: String, required: true, max: 100},
        time: {type: String, required: true, max: 100},
        story: {
            text: {type: String, required: true, max: 100},
            images: {type: Array, required: true}
        }

    }
);


Story.set('toObject', {getters: true, virtuals: true});


var storyModel = mongoose.model('Story', Story );

module.exports = storyModel;