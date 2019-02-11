var express = require('express');
var imagesRoutes = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var Images = require('../models/images');
var ImagesM2 = require('../models/imagesM2');
var multer  = require('multer')
var fs  = require('fs')
var upload = multer({dest: 'upload/'})
var cloudinary = require('cloudinary');
cloudinary.config(config.cloudinary)
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
          res.end('<h1>Acceso denegado</h1>')
        } else {
          if(decoded.userType==1 || decoded.userType==2){
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

imagesRoutes.get('/', function(req, res) {
    Images.find({},function(err, rs){
      if(err){
        const errorMsg = 'No se pudo obtener información de la base de datos';
        return res.render('images', {title: "Imágenes - Donde", success: false, msg: errorMsg});
      }
      else{
        console.log(rs)
        res.render('images/images', {title: "Imágenes - Donde", cities: rs});
      }
    })
  })

imagesRoutes.get('/cities/:city', function(req, res) {
    Images.findById(
          req.params.city
        ,function(err, rs){
        if(err){
          res.json({success:false, msg:"No se pudo obtener información de la base de datos.",err: err})
        }
        else{
          res.render('images/cityImages', {title: "Imágenes - Donde", city: rs});
        }
    })
})

imagesRoutes.get('/getCities',function(req, res){  
  console.log('simon')
  //Images.find({$or:[{Mode:req.params.mode},{Mode: 3}]},function(err,rs){
    Images.find({},function(err,rs){
    if(err){
      res.json({success:false, msg: "No se pudo obtener información de la base de datos"})
    }
    else{
      res.json({success: true, cities: rs});
    }
  })
})
/**
 * Obtiene las imagenes del modo global "ImagesM2"
 */
imagesRoutes.get('/getImagesGlobal',function(req, res){  
    ImagesM2.find({},function(err,rs){
    if(err){
      res.json({success:false, msg: "No se pudo obtener información de la base de datos"})
    }
    else{
      console.log(rs)
      res.json({success: true, images: rs});
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
        res.json({success: false, msg: "Ya existe esta ciudad.",errorCode: 101, city: rs} );
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

/**
 * Edita una ciudad pero primero verifica que no haya una ciudad con ese mismo nombre ya existiendo.
 */
imagesRoutes.put('/editCity', function(req, res){
  Images.find({$and:[{_id: {$ne: req.body._id},City:req.body.City, State:req.body.State, Country:req.body.Country}]},function(err,rs){
    //Error code is used to identificate the error in the client side
    if(err){
      return res.json({success:false, msg: "No se pudo obtener información de la base de datos", errorCode: 100})
    }
    else{
      if(typeof rs !== undefined && rs.length > 0){
        res.json({success: false, msg: "Ciudad ya existente",errorCode: 101, city: rs} );
      }
      else{
        let city = {
          City: req.body.City,
          State: req.body.State,
          Country: req.body.Country
        };
        Images.update({_id: req.body._id}, {$set: city},function(err, rs){
          if(err){
            res.json({success: false, msg: "No se pudo modificar la ciudad.", err:err})
          }
          else{
            res.json({success: true, msg: "Se ha modificado la ciudad correctamente.", response: rs})
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
/**
 * Le agrega una imágen a la ciudad
 */
imagesRoutes.put('/addImageInCity',upload.single('imagen'), function(req, res){
  const filepath = req.file.destination+req.file.filename
  cloudinary.v2.uploader.upload(filepath, {timeout:60000, folder: 'Por_region/'+req.body.city},function(error, result) {
    if(error){
      console.log("No se ha podido cargar el archivo")
      console.log(error)
    }
    else{
      //Removes the last ';'
      let respuestas = (req.body.respuestas).slice(0, -1);
      respuestas = respuestas.split(';')
      let id = (result.public_id).split('/')
      id = id[id.length-1]
      values = {
        id: id,
        URL: result.url,
        Answered: false,
        Tags: respuestas,
        Active: req.body.Active,
        Value: req.body.puntuacion
      }
      Images.update({_id: req.body.city}, {$push: {ImagesM1: values} },function(err, resp){
        if(err){
          res.json({success:false, msg: "No se pudo actualizar la ciudad", err: err})
        }
        else{
          res.json({success:true, msg: "La imagen se ha guardado con éxito"})
        }
      }) 
      fs.unlink(filepath, (err) => {
        if (err){
          console.log("No se pudo eliminar el archivo.")
          console.log(err)
        }
      });
    }
  });
})

imagesRoutes.get('/:city/getImagesInCity', function(req, res){
  Images.findById(
    req.params.city
    ,{ImagesM1: 1},function(err, rs){
    if(err){
      res.json({success: false, city: 'No se pudo obtener información de la base de datos'});
    }
    else{
      res.json({success: true, city: rs.ImagesM1});
    }
  })
})

imagesRoutes.put('/:city/deleteImagesM1', function(req, res){
  city = req.params.city
  ids = req.body.ids
  Images.update({_id: city}, {$pull: {ImagesM1 : { id: {$in: ids }}}},function(err, resp){
    if(err){
      res.json({success:false, msg: "No se han podido eliminar las imagenes.", err: err})
    }
    else{
      res.json({success:true, msg: "Las imagenes se han eliminado con éxito"})
    }
  }) 
  ids.forEach(function(element,index){
    ids[index] = 'Por_region/'+city+'/'+element
  });
  console.log(ids)
  cloudinary.api.delete_resources(ids,function(error, result){console.log(result, error)});
  //Images.update()
})

imagesRoutes.delete('/deleteImagesM2', function(req, res){
  city = req.params.city
  ids = req.body.ids
  ImagesM2.deleteMany({_id: {$in: ids }},function(err, resp){
    if(err){
      res.json({success:false, msg: "No se han podido eliminar las imagenes.", err: err})
    }
    else{
      console.log(resp)
      res.json({success:true, msg: "Las imagenes se han eliminado con éxito"})
    }
  }) 
  ids.forEach(function(element,index){
    ids[index] = 'Global/'+element
  });
  console.log(ids)
  cloudinary.api.delete_resources(ids,function(error, result){console.log(result, error)});
  //Images.update()
})

imagesRoutes.delete('/deleteCity', function(req, res){
  Images.deleteOne({_id: req.body.city_id}, function(err){
    if(err){
      res.json({success: false, msg: "No se pudo eliminar la ciudad", err: err})
    }    
    else{
      res.json({success: true, msg: "La ciudad se ha eliminado correctamente"})
    }
  })
  cloudinary.api.delete_resources_by_prefix('Por_region/'+req.body.city_id+'/', function(result){console.log(result)});
})

/**
 * Le agrega una imágen a la modalidad 2 (global)
 */
imagesRoutes.put('/addImageM2',upload.single('imagen'), function(req, res){
  const filepath = req.file.destination+req.file.filename
  cloudinary.v2.uploader.upload(filepath, {timeout:60000, folder: 'Global/'},function(error, result) {
    if(error){
      console.log("No se ha podido cargar el archivo")
      console.log(error)
    }
    else{
      //Removes the last ';'
      let respuestas = (req.body.respuestas).slice(0, -1);
      respuestas = respuestas.split(';')
      let id = (result.public_id).split('/')
      id = id[id.length-1]
      let imageM2 = new ImagesM2({
        _id: id,
        URL: result.url,
        Answers: respuestas,
        Value: req.body.puntuacion
      })
      imageM2.save(function(err, resp){
        if(err){
          res.json({success:false, msg: "No se pudo añadir la ciudad", err: err})
        }
        else{
          res.json({success:true, msg: "La imagen se ha guardado con éxito"})
        } 
      })
      fs.unlink(filepath, (err) => {
        if (err){
          console.log("No se pudo eliminar el archivo.")
          console.log(err)
        }
      });
    }
  });
})
module.exports = imagesRoutes