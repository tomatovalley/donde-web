var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var apiRoutes = require('./controllers/api');
var config = require('./config');

app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
mongoose.connect(config.database); // connect to database

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use('/api', apiRoutes);

app.get('/', function(req, res) {
    res.render('login');
})

var server = app.listen(3001, function() {
    console.log('Server started on http://localhost:' + server.address().port)
})

  
