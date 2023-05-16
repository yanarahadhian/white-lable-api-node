var express = require('express');
var recentProductRouter = express.Router();
var recentProducts = require('../controllers/recent_products');

recentProductRouter.get('/', function(req, res) {
    recentProducts.search(req, res);
})

recentProductRouter.post('/', function(req, res) {
    recentProducts.add(req, res);
})

recentProductRouter.put('/', function(req, res) {
	recentProducts.edit(req, res);
})

recentProductRouter.delete('/', function(req, res) {
	recentProducts.remove(req, res);
})

recentProductRouter.post('/:id', function(req, res) {
    recentProducts.updateStatus(req, res);
})

recentProductRouter.get('/listProductType', function(req, res) {
    recentProducts.listProductType(req, res);
})

module.exports = recentProductRouter;