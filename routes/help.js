var express = require('express');
var helpRouter = express.Router();
var help = require('../controllers/help');

helpRouter.get('/', function(req, res) {
    help.search(req, res);
})

helpRouter.post('/', function(req, res) {
    help.add(req, res);
})

helpRouter.put('/', function(req, res) {
	help.edit(req, res);
})

helpRouter.delete('/', function(req, res) {
	help.remove(req, res);
})

helpRouter.get('/:id', function(req, res) {
	help.details(req, res);
})

module.exports = helpRouter;