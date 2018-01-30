var mongoose = require('mongoose');

var boardSchema = new mongoose.Schema({
    name:                   {type: String, required: true},
    latitude:               {type: Number, required: true},
    longitude:              {type: Number, required: true},
    radius:                 {type: Number, required: true},
    unique_contributors:    {type: Number, required: true},
    last_pixel_at:          {type: Number}
});

var Board = mongoose.model('Board', boardSchema);

module.exports = Board;
