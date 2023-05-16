var express = require('express');
var rightsRouter = express.Router();
var rights = require('../controllers/rights');

rightsRouter.put('/', function(req, res) {
	rights.edit(req, res);
})

module.exports = rightsRouter;