var express = require('express');
var walletRoutes = express.Router();
var wallet = require('../controllers/wallet');

walletRoutes.get('/', function (req, res, next) {
    wallet.search(req, res);
});

walletRoutes.put('/', function (req, res, next) {
    wallet.edit(req, res);
});

module.exports = walletRoutes;
