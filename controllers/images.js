var express = require('express');
var imagesRoutes = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var Images = require('../models/images');
var mongoose = require('mongoose');


imagesRoutes.use(function (req, res, next) {
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

imagesRoutes.get('/', function(req, res) {
    //1 stands for the modality general
    Images.find({$or:[{Mode: 1},{Mode:3}]},function(err, rs){
      if(err){
        const errorMsg = 'No se pudo obtener información de la base de datos';
        return res.render('images', {title: "Imágenes - Donde", success: false, msg: errorMsg});
      }
      else{
        res.render('images', {title: "Imágenes - Donde", cities: rs});
      }
    })
  })

imagesRoutes.get('/:city', function(req, res) {
    Images.findById(
          req.params.city
        ,function(err, rs){
        if(err){
          const errorMsg = 'No se pudo obtener información de la base de datos';
          //return res.render('images', {title: "Imágenes - Donde", success: false, msg: errorMsg});
        }
        else{
          res.render('images', {title: "Imágenes - Donde", cities: rs});
        }
    })
})

imagesRoutes.get('/getCitiesByModality/:mode',function(req, res){  
  Images.find({$or:[{Mode:req.params.mode},{Mode: 3}]},function(err,rs){
    if(err){
      res.json({success:false, msg: "No se pudo obtener información de la base de datos"})
    }
    else{
      res.json({success: true, cities: rs});
    }
  })
})
/**
 * Añade una ciudad pero primero verifica que no haya una ciudad con ese mismo nombre ya existiendo.
 */
imagesRoutes.post('/addCity', function(req, res){
  Images.find({$and:[{City:req.body.City, State:req.body.State, Country:req.body.Country}]},function(err,rs){
    //Error code is used to identificate the error in the client side
    if(err){
      return res.json({success:false, msg: "No se pudo obtener información de la base de datos", errorCode: 100})
    }
    else{
      if(typeof rs !== undefined && rs.length > 0){
        res.json({success: false, msg: "Ya existe esta ciudad ¿Desea que la información sobre la modalidad sea sobreescrita?",errorCode: 101, city: rs} );
      }
      else{
        let newCity = new Images ({
          City: req.body.City,
          State: req.body.State,
          Country: req.body.Country,
          Mode: req.body.Mode
        });
        newCity.save(function(err, response){
            if(err){
              res.json({success: false, msg: "No se pudo agregar la ciudad.", err:err})
            }
            else{
              res.json({success: true, msg: "Se ha agregado la ciudad correctamente."})
              console.log(response);
            }
        })
      }
    }
  })
})

imagesRoutes.put('/updateCityMode', function(req, res){
  Images.findByIdAndUpdate(req.body._id,{ $set: { Mode: req.body.Mode }}, function(err,result){
    if(err)
      return res.json({success: false, msg: "Algo ha fallado en el servidor, intente de nuevo", err: err})
    
    res.json({success:true, msg: "La ciudad se ha actualizado correctamente"})
  })
})
module.exports = imagesRoutes;