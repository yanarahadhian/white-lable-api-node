var express = require('express');
var senderRouter = express.Router();
var sender = require('../controllers/senders');

senderRouter.get('/', function(req, res) {
    sender.search(req, res);
})

senderRouter.post('/', function(req, res) {
    sender.add(req, res);
})

senderRouter.put('/', function(req, res) {
	sender.edit(req, res);
})

senderRouter.delete('/', function(req, res) {
	sender.delete(req, res);
})

module.exports = senderRouter;