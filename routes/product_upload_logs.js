var express = require('express');
var productUploadLogRouter = express.Router();
var productUploadLog = require('../controllers/product_upload_logs');

productUploadLogRouter.get('/:file_id', function(req, res) {
	productUploadLog.list(req, res)
})

productUploadLogRouter.delete('/:file_id', function(req, res) {
	productUploadLog.remove(req, res)
})

productUploadLogRouter.post('/', function(req, res) {
    productUploadLog.add(req, res);
})

module.exports = productUploadLogRouter;