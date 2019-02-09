var mongoose = require('mongoose');
var Schema = mongoose.Schema
module.exports = mongoose.model('ciudades',new Schema({
    _id: {type: mongoose.Types.ObjectId, default: null},
    City: {type: String, required: true},
    State: {type: String, required: true},
    Country: {type: String, required: true},
    ImagesM1: []
}));