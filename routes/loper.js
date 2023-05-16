var express = require('express');
var loperRouter = express.Router();
var loper = require('../controllers/loper');

loperRouter.post('/search', function(req, res) {
    loper.search(req, res);
})

loperRouter.post('/add', function(req, res) {
    loper.add(req, res);
})

loperRouter.get('/list', function(req, res) {
    loper.list(req, res);
})

loperRouter.post('/listUpline', function(req, res) {
    loper.listUpline(req, res);
})

loperRouter.get('/view/:username', function(req, res) {
	loper.view(req, res);
})

loperRouter.post('/edit', function(req, res) {
	loper.edit(req, res);
})

loperRouter.post('/update_status', function(req, res) {
	loper.updateStatus(req, res);
})

loperRouter.post('/reset_password', function(req, res) {
	loper.resetPassword(req, res);
})

loperRouter.post('/remove', function(req, res) {
	loper.remove(req, res);
})

module.exports = loperRouter;