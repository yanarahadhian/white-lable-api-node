var express = require('express');
var komisariatRouter = express.Router();
var komisariat = require('../controllers/komisariat');

komisariatRouter.get('/mobile', function(req, res) {
    komisariat.searchMobile(req, res);
})

module.exports = komisariatRouter;