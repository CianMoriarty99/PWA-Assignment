const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema;


const User = new Schema(
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




User.methods.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

User.statics.verify = async (username, password) => {
    try {
        console.log(username,password)
        const user = await userModel.findOne({ user_name : username });
        if (!user) {
            console.log("failed")
            return false;
        } 
        const verified = await user.verifyPassword(password);
        return verified ? user : false;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}




User.set('toObject', {getters: true, virtuals: true});


const userModel = mongoose.model('User', User );

module.exports = userModel;