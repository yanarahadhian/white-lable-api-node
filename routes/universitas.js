var express = require('express');
var universitasRouter = express.Router();
var universitas = require('../controllers/universitas');


universitasRouter.get('/', function(req, res) {
    universitas.search(req, res);
})

module.exports = universitasRouter;