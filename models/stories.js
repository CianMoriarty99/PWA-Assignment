const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Story = new Schema({
    author: { type: String, required: true, max: 100 },
    date: { type: String, required: true, max: 100 },
    time: { type: String, required: true, max: 100 },
    storyText: { type: String, required: true, min: 1, max: 150 },
    storyImages: { type: Array, required: true }
});

Story.methods.clean = function() {
    return {
        id: this.id,
        author: this.author,
        time: this.time,
        date: this.date,
        storyText: this.storyText,
        storyImages: this.storyImages
    }
};



Story.statics.exists = async id => {
    try {
        console.log(id);
        const story = await storyModel.findOne({ _id : id });
        return story || false;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}



Story.set('toObject', {getters: true, virtuals: true});


const storyModel = mongoose.model('Story', Story );

module.exports = storyModel;