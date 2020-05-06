const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Vote = new Schema({
    author: { type: String, required: true, max: 100 },
    storyId: { type: String, required: true, max: 100 },
    value: { type: Number, required: true, min: 1, max: 5 }
});

Vote.set('toObject', { getters: true, virtuals: true });


const voteModel = mongoose.model('Vote', Vote);

module.exports = voteModel;