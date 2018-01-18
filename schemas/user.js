var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    //name: {type: String, required: true},
    email: {type: String, required: true},
    hometown: {type: String, required: true},
    pixels: {type: Number, required: true},
    boards: [String]
});

var User = mongoose.model('User', userSchema);

module.exports = User;
