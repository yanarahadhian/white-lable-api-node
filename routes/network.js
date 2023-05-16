var express = require('express');
var networkRouter = express.Router();
var network = require('../controllers/network');

networkRouter.post('/', function(req, res) {
    network.add(req, res);
})

networkRouter.get('/', function(req, res) {
    network.search(req, res);
})

networkRouter.put('/', function(req, res) {
	network.edit(req, res);
})

networkRouter.delete('/', function(req, res) {
	network.remove(req, res);
})

module.exports = networkRouter;