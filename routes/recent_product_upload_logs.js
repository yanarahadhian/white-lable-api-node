var express = require('express');
var recentPuLogRoutes = express.Router();
var recentPuLog = require('../controllers/recent_product_upload_logs');

recentPuLogRoutes.get('/:upload_id', function(req, res) {
	recentPuLog.list(req, res)
})

recentPuLogRoutes.post('/', function(req, res) {
    recentPuLog.add(req, res);
})

recentPuLogRoutes.delete('/', function(req, res) {
    recentPuLog.remove(req, res);
})

module.exports = recentPuLogRoutes;