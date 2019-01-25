var express = require('express');
var apiRoutes = express.Router();
var User = require('../models/user');
var Images = require('../models/images');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var config = require('../config');
var nodeGeocoder = require('node-geocoder');
var ObjectID = require("mongodb").ObjectID;
var mongodb = require("mongodb");

apiRoutes.get('/', function(req, res) {
    res.json({
        message: 'Welcome to the coolest API on earth!'
      });
})


apiRoutes.post('/doRegister', function(req, res){
    var newUser = new User({
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
    User.findOne({
        User: req.body.User 
    },['_id', 'User', 'Password','UserType'], function(err, usuario){
        if(err){   
            res.json({success: false, msg: "Algo malo sucedió en la consulta."})
        }
        else if(usuario){
            usuario = usuario.toObject();
            bcrypt.compare(req.body.Password, usuario.Password, function(error, response){
                if(error){
                   res.json({success: false, msg: "Algo ha salido mal."});
                }
                else if(response){
                    var userdata = {
                        id: usuario._id,
                        user: usuario.User,
                        userType: usuario.UserType 
                    }   
                    var token = jwt.sign(userdata, config.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    userdata.token = token;
                    userdata.success = true;
                    res.cookie('access_token',token,{
                        httpOnly:true
                    })
                    res.json(userdata);
                    //res.json(userdata);
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
/**
 * Devuelve la imagen que este activa para la modalidad general
 * Recibe lo siguientes parametros
 * {
 *  latitud: Latitud del usuario
 *  longitud: Longitud del usuario
 * }
 */
apiRoutes.get('/getActiveImage', function(req, res){
    const latitud = req.body.latitud
    const longitud = req.body.longitud
    getAddress(latitud, longitud, function(response){
        if(response.success == false){
            return res.json(response)
        }
        if(response.length == 0){
            return res.json({success:"true", msg: "El juego no esta disponible en tu región"})
        }
        response = response[0];
        let matchData = {
            "City": response.city,
            "State": response.state,
            "Country": response.country
        }
        let keyMode
        let fieldName
        keyMode = "ImagesM1.Active"    
        fieldName = "ImagesM1"    
        matchData[keyMode] = true
        let projection = {}
        projection["ImagesM1.URL"] = 1
        Images.aggregate([
        { 
            $unwind: {path: "$"+fieldName} 
        },
        {
            $match: matchData
        },{
            $project: projection
        }], function(error, result){
            if(error)
                return res.json({success:false, msg: "Algo ha sucedido en nuestro back.", err: error})
            else if(result.length > 0){
                res.json(result)
            }
            else{
                res.json({success:true, msg: "Esperando por imagen."})
            }
        })
    })
})
/**
 * 
 * @param {Number} latitud Latitud de donde se quiere obtener la ciudad
 * @param {Number} longitud Longitud de donde se quiere obtener la ciudad
 * @param {function} callback Callback
 */
function getAddress(latitud, longitud, callback){
    let options = {
        provider: 'here',
        appId: config.here.appId,
        appCode: config.here.appCode,
    }
    let geocoder = nodeGeocoder(options);
    geocoder.reverse({lat: latitud, lon: longitud}, function(err, response) {
        if(err){
            callback({success:false, msg: "Ups. Algo ha sucedido", err: err})
        }
        else{
            callback(response)
        }
    });
}
/**
 * Checa la respuesta de la modalidad general
 * Recibe 
 * {
 *  ciudad_id: El object id de la ciudad
 *  user_id: Id del usuario
 *  answer: Respuesta del jugador
 * }
 */
apiRoutes.get('/checkAnswer', function(req, res){
    let answer = req.body.answer.normalize('NFD').replace(/[\u0300-\u036f-,]/g, "")
    const ciudad_id = req.body.ciudad_id

    Images.aggregate([
        { 
            $unwind: {path: "$ImagesM1"} 
        },
        {
            $match: {'_id': ObjectID(ciudad_id), 'ImagesM1.Active': true}
        },{
            $project: {'ImagesM1.Tags': 1, 'ImagesM1.Value':1}
        }], function(err, result){
        if(err){
            res.json({success: false, msg: "Algo ha sucedido", err: err})
        }
        else{
            if(result.length > 0){
                let isAnswerCorrect = false
                let tags = result[0].ImagesM1.Tags
                answer = answer.toLowerCase()
                tags.forEach(tag => {
                    tag = tag.normalize('NFD').replace(/[\u0300-\u036f-,]/g, "")
                    tag = tag.toLowerCase()
                    if(tag == answer){
                        isAnswerCorrect = true
                    }
                });
                if(isAnswerCorrect){
                    addScore(req.body.user_id, result[0].ImagesM1.Value, 1, function(success){
                        if(success){
                            res.json({success: true, isAnswerCorrect: true, msg: "Felicidades has contestado correctamente."})
                        }
                        else{
                            res.json({success: false, isAnswerCorrect: true, msg: "Se ha contestado correctamente pero no se ha podido actualizar el perfil."}) 
                        }
                    })
                }
                else{
                    res.json({success: true, isAnswerCorrect: false, msg: "Respuesta incorrecta."})
                }
            }
            else{
                res.json({success: false, msg: "No se pudo encontrar la ciudad."})
            }
        }
    })
})
/**
 * Hace un update de los scores del usuario
 * @param {Number} user_id Id del usuario al que se le hará el update
 * @param {Number} score Puntaje que se añadirá al usuario
 * @param {function} callback Callback
 * @param {Number} mode Modalidad en la que se hará el update
 */
function addScore(user_id, score, mode, callback){
    mode = mode == 1 ? "ScoresM1" : "ScoresM2"
    let push = {}
    push[mode] = {
        score: score,
        date: new Date()
    }
    User.update(
        {
            "_id": user_id
        },{
            $push: push
        }, function(err){
            if(err){
                console.log(err)
                callback(false)
            }
            else{
                callback(true)
            }
        })
}

module.exports = apiRoutes;

