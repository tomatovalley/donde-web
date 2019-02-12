var express = require('express');
var apiRoutes = express.Router();
var User = require('../models/user');
var Images = require('../models/images');
var ImagesM2 = require('../models/imagesM2');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var config = require('../config');
var nodeGeocoder = require('node-geocoder');
var ObjectID = require("mongodb").ObjectID;

apiRoutes.get('/', function(req, res) {
    res.json({
        message: 'Welcome to the coolest API on earth!'
      });
})


apiRoutes.post('/doRegister', function(req, res){
    var newUser = new User({
        Name: req.body.Name,
        Email: req.body.Email,
        User: req.body.User,
        Password: bcrypt.hashSync(req.body.Password,bcrypt.genSaltSync(10)),
        UserType: 3
    });
    newUser.save(function(err, usuario){
        if(err){
            if(err.code == 11000)
                res.json({success: false, msg: "El usuario ya esta en uso."});
            else
                res.json({success: false, msg: "Los datos ingresados no son correctos."});
        }
        else{
            let userdata = {
                id: usuario._id,
                user: usuario.User,
                userType: usuario.UserType 
            }   
            let token = jwt.sign(userdata, config.secret);
            userdata.token = token;
            res.cookie('access_token',token,{
                httpOnly:true
            })
            res.json({success: true, msg: "El usuario se ha registrado exitosamente.", userdata: userdata})
        }
    });   
})

apiRoutes.post('/doLogin', function(req, res){
    User.findOne({
        User: req.body.User 
    },['_id', 'User', 'Password','UserType','Status'], function(err, usuario){
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
                    if(!usuario.Status){
                        return res.json({success: false, msg: "El usuario ha sido desactivado."})
                    }
                    var userdata = {
                        id: usuario._id,
                        user: usuario.User,
                        userType: usuario.UserType 
                    }   
                    var token = jwt.sign(userdata, config.secret);
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

apiRoutes.get('/doLogout', function(req, res){
    res.clearCookie("access_token")
    res.json({success:true, msg:"Se ha cerrado la sesión exitosamente"})
})
/**
 * Devuelve la información del usuario a partir de su id
 * Recibe
 * {
 *   id: Id del usuario
 * }
 */
apiRoutes.get('/getUserData', function(req, res){
    User.findById(req.query.id,{Password: 0}, function(err, userdata){
        if(err){
            res.json({success:false, msg: "No se pudo obtener los datos del usuario", err: err})
        }
        else{ 
            res.json({success: true, msg:"Se han obtenido los datos del usuario correctamente", userdata})
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
    const latitud = req.query.latitud
    const longitud = req.query.longitud
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
                res.json({sucess: true, tieneImagen: true, img: result})
            }
            else{
                res.json({sucess: true, tieneImagen: false, msg: "Aun no se ha subido una imagen."})
            }
        })
    })
})
/**
 * Retorna la dirección de la persona
 * @param {Number} latitud Latitud de donde se quiere obtener la ciudad
 * @param {Number} longitud Longitud de donde se quiere obtener la ciudad
 * @param {function} callback Callback
 */
function getAddress(latitud, longitud, callback){
    console.log(latitud)
    console.log(longitud)
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
    let answer = req.query.answer.normalize('NFD').replace(/[\u0300-\u036f-,]/g, "")
    const ciudad_id = req.query.ciudad_id

    Images.aggregate([
        { 
            $unwind: {path: "$ImagesM1"} 
        },
        {
            $match: {'_id': ObjectID(ciudad_id), 'ImagesM1.Active': true}
        },{
            $project: {'ImagesM1.id': 1,'ImagesM1.Tags': 1, 'ImagesM1.Value':1}
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
                    setImageAsAnswered(result[0].ImagesM1.id,function(correcto){
                        if(correcto){
                            selextNextImage(function(resp){
                                if(resp){
                                    addScore(req.query.user_id, result[0].ImagesM1.Value, 1, function(success){
                                        if(success){
                                            res.json({success: true, isAnswerCorrect: true, msg: "Felicidades has contestado correctamente.", value: result[0].ImagesM1.Value})
                                        }
                                        else{
                                            res.json({success: false, isAnswerCorrect: true, msg: "Se ha contestado correctamente pero no se ha podido actualizar el perfil."}) 
                                        }
                                    })
                                }
                            })
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
 * Devuelve la imagen que debe contestar el usuario.
 * Recibe
 * {
 *  _id: El id del usuario
 * }
 */
apiRoutes.get('/getImageGlobal', function(req, res){
    User.findById(req.query._id,'M2Progress', function(err, result){
        if(err){
            res.json({success: false, msg:"Algo ha sucedido."})
        }
        else if(result){
            ImagesM2.find({}, function(err, rs){
                if(err)
                    res.json({success: false, msg:"Algo ha sucedido."})
                else{
                    let rslt = result.toObject()
                    if(rslt.M2Progress == "" || rslt.M2Progress == undefined){
                        rs[0].Answers = shuffle(rs[0].Answers)
                        res.json({success: true, rs: rs[0]})
                    }
                    else{
                        for (let x = 0; x < rs.length; x++) {
                            const element = rs[x];
                            if(element._id == rslt.M2Progress){
                                if(rs[x+1] != undefined){
                                    rs[x+1].Answers = shuffle(rs[x+1].Answers)
                                    return res.json({success: true, rs: rs[x+1]})        
                                }
                                else{
                                    return res.json({success: true, rs: null, msg:"Esperando por más imagenes"})        
                                }
                            }   
                        }
                    }
                }
            })
            //res.json({success: true, user: result.M})
        }
        else{
            res.json({success: false, msg:"No se encontró el usuario"})
        }
    })
})

/**
 * Checa que la respuesta ingresada sea correcta
 * Recibe:
 * {
 *  _id: El id de la imagen respondida
 *  user_id: El id del usuario
 *  respuesta: La respuesta del usuario.
 * }
 */
apiRoutes.get('/checkAnswerGlobal', function(req, res){
    let respuesta = req.query.respuesta
    if(req.query.user_id == undefined)
        return res.json({success:false, msg: "No se mandaron los datos necesarios."})
    ImagesM2.findById(req.query._id, function(err, result){
        if(err){
            console.log(err)
            res.json({success: false, msg:"Algo ha sucedido"})
        }
        else{
            if(result.Answers[0] == respuesta){
                addScore(req.query.user_id, result.Value, 2, function(rs){
                    if(rs){
                        res.json({success:true, correcto: true, msg:"La respuesta es correcta.", puntos: result.Value})
                    }
                    else{
                        res.json({success:true, correcto: true, msg:"La respuesta es correcta.", puntos: result.Value})
                    }
                })
            }
            else{
                res.json({success:true, correcto: false, msg:"Respuesta incorrecta.", puntos: 0})
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
    User.updateOne(
        {
            "_id": user_id
        },{
            $push: {
                Scores:{
                    score: score,
                    mode: mode,
                    date: new Date()
            }}
        }, function(err, raw){
            if(err){
                callback(false)
            }
            else{
                callback(true)
            }
        })
}
/**
 * Marca la imagen como respondidad en la la
 * @param {Number} imageId El id de la imagen que se quiere marcar como respondida
 * @param {Function} fn Callback
 */
function setImageAsAnswered(imageId, fn){
    Images.update(
        {"ImagesM1.id": imageId},
        {$set : { "ImagesM1.$.Answered" : true, "ImagesM1.$.Active": false}},
        function(err, res){
            if(err)
                fn(false)
            else
                fn(true)
        })
}

function selextNextImage(fn){
    Images.findOneAndUpdate(
        {"ImagesM1.Answered": false},
        {$set : { "ImagesM1.$.Active" : true }}, 
        function(err, res){
            if(err)
                fn(false)
            else{
                fn(true)
            }
        }
    )
}
/**
 * La utilizo para cambiar el orden de las opciones de resuesta.
 * @param {Array} array Array de datos a sortear
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }



module.exports = apiRoutes;

