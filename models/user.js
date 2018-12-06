var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Register = mongoose.model('Register', new Schema({
  Name: {type: String, required: true},
  Email: {type: String, required: true},
  City: {type: String, required: true},
  User: {type: String, required: true},
  Password: {type: String, required: true},
  Scores: {type: Object, default: []},
  DailyScore: {type: Number, default: 0.0},
  WeeklyScore: {type: Number, default: 0.0},
  CurrentScore: {type: Number, default: 0.0},
  JoinedAT: {type: Date, default: Date.now}
}, {collection:'usuarios'}));

var Login = mongoose.model('Login', new Schema({
  User: {type: String, required: true}
}, {collection:'usuarios'}));

module.exports = {
  Login: Login,
  Register, Register
};