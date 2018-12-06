var jwt = require('jsonwebtoken');
var express = require('express');
var apiRoutes = express.Router();

var config = require('../config');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

apiRoutes.get('/', function(req, res) {
    res.json({
        message: 'Welcome to the coolest API on earth!'
      });
})


apiRoutes.post('/doRegister', function(req, res){
    var newUser = new User.Register({
        Name: req.body.Name,
        Email: req.body.Email,
        City: req.body.City,
        User: req.body.User,
        Password: bcrypt.hashSync(req.body.Password,bcrypt.genSaltSync(10))
    });
    newUser.save(function(err){
        if(err){
            res.json({success: false, msg: "Los datos ingresados no son correctos."});
        }
        else{
            res.json({success: true, msg: "El usuario se ha registrado exitosamente."})
        }
    });   
})

apiRoutes.post('/doLogin', function(req, res){
    User.Login.findOne({
        User: req.body.User
    },['_id', 'User', 'Password'], function(err, usuario){
        if(err){
            //Only user is wrong but you know, security.
            res.json({success: false, msg: "Usuario o contraseña invalido."})
        }
        else if(usuario){
            console.log(req.body.Password);
            usuario = usuario.toObject();
            console.log("USER: "+usuario.User);
            console.log("PASSWORD:"+usuario.Password);
            bcrypt.compare(req.body.Password, usuario.Password, function(error, done){
                if(error){
                    res.json({success: false, msg: "Usuario o contraseña invalido."});
                }
                else{
                    res.json({success: true, done})
                }
            })
        }
    })
})

module.exports = apiRoutes;