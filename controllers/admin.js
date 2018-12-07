var express = require('express');
var adminRoutes = express.Router();

adminRoutes.get('/', function(req, res) {
    res.render('admin');
})

module.exports = adminRoutes;