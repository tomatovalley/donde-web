var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('usuarios', new Schema({
  Name: {type: String, required: true},
  Email: {type: String, required: true},
  User: {type: String, required: true},
  Password: {type: String, required: true},
  UserType: {type: String, required: true},
  ScoresM1: {
      score: {type: Number},
      date: {type: Date}
  },
  ScoresM2:{

  },
  JoinedAT: {type: Date, default: Date.now}
}))