var express = require('express');
var areaRouter = express.Router();
var area = require('../controllers/area');

areaRouter.get('/', function(req, res) {
    area.search(req, res);
})

areaRouter.post('/', function(req, res) {
    area.add(req, res);
})

areaRouter.put('/', function(req, res) {
	area.edit(req, res);
})

areaRouter.delete('/', function(req, res) {
	area.remove(req, res);
})

areaRouter.post('/bulk', function(req, res) {
    area.bulkAdd(req, res);
})

module.exports = areaRouter;