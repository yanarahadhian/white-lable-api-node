var express = require('express');
var billerRouter = express.Router();
var biller = require('../controllers/biller');

billerRouter.get('/', function(req, res) {
    biller.search(req, res);
})

billerRouter.post('/', function(req, res) {
    biller.add(req, res);
})

billerRouter.put('/', function(req, res) {
	biller.edit(req, res);
})

billerRouter.delete('/', function(req, res) {
	biller.remove(req, res);
})

billerRouter.post('/bulkDelete', function(req, res) {
    biller.bulkRemove(req, res)
})

module.exports = billerRouter;