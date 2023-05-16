var express = require('express');
var provinceRouter = express.Router();
var province = require('../controllers/province');

provinceRouter.get('/', function(req, res) {
    province.search(req, res);
})

provinceRouter.get('/mobile', function(req, res) {
    province.searchMobile(req, res);
})

module.exports = provinceRouter;