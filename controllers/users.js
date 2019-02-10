var express = require('express');
var usersRoutes = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../models/user.js');
var bcrypt = require('bcrypt-nodejs');

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
          res.end('<h1>Acceso denegado</h1>')
        } else {
          if(decoded.userType==1 || decoded.userType==2){
            req.userType = decoded.userType 
            next();
          }
          else{
            res.end('<h1>Acceso denegado</h1>')
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
  User.aggregate([{'$addFields': { 'Score': {'$sum': '$Scores.score'}}}], function(err, rs){
    if(err){
      res.json({success:false, msg: "Algo pasó al hacer la consulta"})
    }
    else{
      let admins = []
      let users = []
      rs.forEach(user => {
        
        if(user.UserType == 1 || user.UserType == 2){
          admins.push(user);
        }
        else{
          users.push(user)
        }
      });
      res.render('users', {success:true, users: users, admins: admins, userType: req.userType})
    }
  })
})

usersRoutes.put('/changeUserStatus', function(req, res) {
  User.updateOne({_id: req.body.user_id}, { $set: { Status: req.body.status }}, function(err, response){
    if(err){
      res.json({sucess:false, msg:"No se pudo actualizar el estatus del usuario."})
    }
    else{
      res.json({success:true, msg:"El estatus del usuario se ha actualizado correctamente."})
    }
  })
})

usersRoutes.get('/usersData', function(req, res){
  User.aggregate([{'$addFields': { 'Score': {'$sum': '$Scores.score'}}}], function(err, rs){
    if(err){
      res.json({success:false, msg: "Algo pasó al hacer la consulta"})
    }
    else{
      let admins = []
      let users = []
      rs.forEach(user => {
        
        if(user.UserType == 1 || user.UserType == 2){
          admins.push(user);
        }
        else{
          users.push(user)
        }
      });
      if(req.userType == 1){
        res.json({success:true, users: users, admins: admins, userType: req.userType})
      }
      else{
        res.json({success:true, users: users, userType: req.userType})
      }
    }
  })
})

usersRoutes.delete('/deleteUser', function(req, res){
  User.deleteOne({_id: req.body.user_id}, function(err){
    if(err){
      res.json({success:false, msg: "No se ha podido eliminar el usuario"})
    }
    else{
      res.json({success:true, msg: "El usuario se ha eliminado correctamente"})
    }
  })
})

usersRoutes.post('/addAdmin', function(req, res){
  req.body.UserType = 2
  req.body.Password = bcrypt.hashSync(req.body.Password,bcrypt.genSaltSync(10))
  let admin = new User(req.body)
  admin.save(function(err, response){
    if(err){
      if(err.code == 11000)
          res.json({success: false, msg: "El usuario ya esta en uso."});
      else
          res.json({success: false, msg: "Los datos ingresados no son correctos."});
    }
    else{
      res.json({success: true, msg:"El usuario se ha agregado éxitosamente"})
    }
  })
})

module.exports = usersRoutes;