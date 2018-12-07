var express = require('express');
var apiRoutes = express.Router();
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var config = require('../config');

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
        Password: bcrypt.hashSync(req.body.Password,bcrypt.genSaltSync(10)),
        UserType: req.body.UserType
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
    },['_id', 'User', 'Password','UserType'], function(err, usuario){
        if(err){   
            res.json({success: false, msg: "Algo malo sucedió en la consulta."})
        }
        else if(usuario){
            usuario = usuario.toObject();
            bcrypt.compare(req.body.Password, usuario.Password, function(error, response){
                if(error){
                   res.json({success: false, msg: "Algo mal ha sucedido"});
                }
                else if(response){
                    var userdata = {
                        id: usuario._id,
                        user: usuario.User,
                        userType: usuario.UserType 
                        //should i return the userType?!?!?
                        //should i return it in the token data?!?!
                    }   
                    var token = jwt.sign(userdata, config.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    userdata.token = token;
                    userdata.success = true;
                    res.redirect('/admin');
                }
                else{
                    res.json({success: false, msg: "Usuario o contraseña invalido"});
                }
            })
        }
        else{
            res.json({success: false, msg: "Usuario o contraseña invalido"});
        }
    })
})

module.exports = apiRoutes;