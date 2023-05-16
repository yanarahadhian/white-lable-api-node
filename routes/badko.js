var express = require('express');
var badkoRouter = express.Router();
var badko = require('../controllers/badko');

badkoRouter.get('/mobile', function(req, res) {
    badko.searchMobile(req, res);
})

module.exports = badkoRouter;