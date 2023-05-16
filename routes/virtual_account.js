var express = require('express');
var vaRouter = express.Router();
var va = require('../controllers/virtual_account');

vaRouter.get('/', function(req, res) {
    va.search(req, res);
})

vaRouter.post('/', function (req, res) {
    va.add(req, res);
})

vaRouter.put('/', function (req, res, next) {
    va.edit(req, res);
});

vaRouter.get('/:id', function (req, res) {
    va.getLogs(req, res);
})

module.exports = vaRouter;