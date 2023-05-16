var express = require('express');
var vaRouter = express.Router();
var va_logs = require('../controllers/virtual_account_logs');

vaRouter.get('/', function(req, res) {
    va_logs.search(req, res);
})

module.exports = vaRouter;