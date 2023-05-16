var express = require('express');
var productRouter = express.Router();
var product = require('../controllers/product');

productRouter.get('/', function(req, res) {
    product.search(req, res);
})

productRouter.post('/', function(req, res) {
    product.add(req, res);
})

productRouter.put('/', function(req, res) {
	product.edit(req, res);
})

productRouter.delete('/', function(req, res) {
	product.remove(req, res);
})

productRouter.post('/update_status', function(req, res) {
	product.updateStatus(req, res);
})

productRouter.post('/check_product', function(req, res) {
	product.checkExistingProduct(req, res);
})

productRouter.get('/listProductType', function(req, res) {
    product.listProductType(req, res);
})

module.exports = productRouter;