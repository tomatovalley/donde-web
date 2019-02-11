var express = require('express');
var homeRoutes = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../models/user.js');

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
          res.end('<h1>Acceso denegado</h1>')
        } else {
          if(decoded.userType == 3){
            res.clearCookie('access_token')
            return res.redirect('/');
          }
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
  getUsers(function(success, rs = undefined){
    if(success){
      getRecent(function(exito, result = undefined){
        if(exito){
          console.log(result)
          res.render('home', {title: "Inicio - Donde", highestScores: rs, recents: result});
        }
        else{
          res.json({success:false, msg:"Algo sucedió"})
        }
      })
    }
    else{
      res.json({success:false, msg:"Algo sucedió"})
    }
  })
  //res.render('home', {title: "Inicio - Donde"});
})

function getUsers(fn){
  User.aggregate(
    [ 
      {'$addFields':
        { 
          'Score': {'$sum': '$Scores.score'}            
        }
      },
      {
        $sort: {'Score': -1}
      },
      {
        $limit: 5
      }
    ], 
    function(err, res){
      if(err){
        fn(false)
      }
      else{
        fn(true, res)
      } 
    })
  }

  function getRecent(fn){
    User.aggregate(
      [ 
        {
          $unwind: '$Scores',
        }
        ,{
          $sort: {'Scores.date': -1}
        },
        {
          $limit: 5
        }
      ], 
      function(err, res){
        if(err){
          fn(false)
        }
        else{
          fn(true, res)
        } 
      })
  }

module.exports = homeRoutes;