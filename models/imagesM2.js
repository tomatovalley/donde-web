var mongoose = require('mongoose');
var Schema = mongoose.Schema

module.exports = mongoose.model('imagesM2',new Schema({
    _id: {type: String},
    URL: {type: String, required: true},
    Answers: {type: Array, required: true},
    Value: {type: Number, required: true},
}));
