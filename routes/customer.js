var express = require('express');
var customerRoutes = express.Router();
var customer = require('../controllers/customer');

customerRoutes.get('/', function (req, res, next) {
    customer.search(req, res);
});

customerRoutes.put('/', function (req, res, next) {
    customer.edit(req, res);
});

customerRoutes.delete('/', function (req, res) {
    customer.remove(req, res);
})

module.exports = customerRoutes;
