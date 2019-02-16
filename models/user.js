var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('usuarios', new Schema({
  Name: {type: String, required: true},
  Email: {
    type: String, 
    required: true, 
    validate: {
      validator: function(v){
        return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(v)
      }
    }},
  User: {type: String, required: true},
  Password: {type: String, required: true},
  UserType: {type: String, required: true},
  Scores: {
      score: {type: Number},
      mode: {type: Number},
      date: {type: Date}  
  },
  M2Progress: {type: String, default: ""},
  JoinedAT: {type: Date, default: Date.now},
  Status: {type: Boolean, default: true}
}))
