var express = require('express');
var adminRoutes = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');


adminRoutes.use(function (req, res, next) {
    //console.log(req.headers);
    console.log(req.cookies);
    var token = req.cookies.access_token;
    if (token) {
      jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
          return res.json({
            success: false,
            message: 'Failed to authenticate token.'
          });
        } else {
          // if everything is good, save to request for use in other routes
          req.user = decoded;
          next();
        }
      });
  
    } else {
  
      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
  
    }
  
  });

adminRoutes.get('/', function(req, res) {
    res.render('admin', {title: "Inicio - Donde"});
})



module.exports = adminRoutes;