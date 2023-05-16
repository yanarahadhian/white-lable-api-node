var express = require('express');
var topupRoutes = express.Router();
var topup = require('../controllers/wallet_topup');

topupRoutes.get('/', function (req, res, next) {
    topup.search(req, res);
});

topupRoutes.post('/', function (req, res, next) {
    topup.add(req, res);
});

topupRoutes.put('/', function (req, res, next) {
    topup.edit(req, res);
});

topupRoutes.delete('/', function (req, res) {
    topup.remove(req, res);
})

module.exports = topupRoutes;

