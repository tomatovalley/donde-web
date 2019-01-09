var express = require('express');
var usersRoutes = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var Images = require('../models/images');
var mongoose = require('mongoose');


usersRoutes.use(function (req, res, next) {
    //console.log(req.headers);
    var token = req.cookies.access_token;
    if (token) {
      jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
          res.json({
            success: false,
            message: 'Failed to authenticate token.'
          });
          res.render('<h1>Acceso denegado</h1>')
        } else {
          if(decoded.userType==1 || decoded.userType==2){
            next();
          }
          else{
            res.render('<h1>Acceso denegado</h1>')
          }
          // if everything is good, save to request for use in other router
        }
      });
  
    } else {
  
      // if there is no token
      // return an error

      return res.redirect('/');
    }
});

usersRoutes.get('/', function(req, res) {
    res.render('users')
    
})

module.exports = usersRoutes;