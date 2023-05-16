var express = require('express');
var logsRouter = express.Router();
var logs = require('../controllers/transaction_logs');

logsRouter.get('/', function(req, res) {
    logs.search(req, res);
})

module.exports = logsRouter;