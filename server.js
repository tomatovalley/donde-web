var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var apiRoutes = require('./controllers/api');
var homeRoutes = require('./controllers/home');
var imagesRoutes = require('./controllers/images');
var config = require('./config');
var cookieParser = require('cookie-parser');

mongoose.connect(config.database,function(err){
    if(err){
        console.log("Error en la conexión con la base de datos");
    }
    else{
        console.log("Conectado a mongo");
    }
}); 

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(bodyParser.json());
// use morgan to log requests to the console
app.use(morgan('dev'));
app.use('/api', apiRoutes);
app.use('/home', homeRoutes);
app.use('/images', imagesRoutes);

//check if the user has cookie to redirect to admin panel
app.use(function (req, res, next) {
    if('access_token' in req.cookies){
        res.redirect('/home');
    }
    else{
        next();
    }
})

app.get('/', function(req, res) {
    res.render('login');
})


var server = app.listen(3001, function() {
    console.log('Server started on http://localhost:' + server.address().port)
})

  
