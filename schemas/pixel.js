var mongoose = require('mongoose');

var pixelSchema = new mongoose.Schema({
	board: {type: String, required: true},
    hex: {type: String, required: true},
    creator: {type: String, required: true},
    created_at: {type: Number, required: true},
    x: {type: Number, required: true},
    y: {type: Number, required: true}
});

var Pixel = mongoose.model('Pixel', pixelSchema);

module.exports = Pixel;
