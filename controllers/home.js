var express = require('express');
var homeRoutes = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');

homeRoutes.use(function (req, res, next) {
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
          // if everything is good, save to request for use in other routes
          req.user = decoded;
          next();
        }
      });
  
    } else {
  
      // if there is no token
      // return an error

      return res.redirect('/');
    }
});

homeRoutes.get('/', function(req, res) {
  res.render('home', {title: "Inicio - Donde"});
})


module.exports = homeRoutes;