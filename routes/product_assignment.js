var express = require('express');
var productAssignmentRouter = express.Router();
var productAssignment = require('../controllers/product_assignment');

productAssignmentRouter.get('/', function(req, res) {
    productAssignment.search(req, res);
})

productAssignmentRouter.post('/', function(req, res) {
    productAssignment.add(req, res);
})

productAssignmentRouter.put('/', function(req, res) {
	productAssignment.edit(req, res);
})

productAssignmentRouter.delete('/', function(req, res) {
	productAssignment.remove(req, res);
})

module.exports = productAssignmentRouter;