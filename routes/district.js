var express = require('express');
var districtRouter = express.Router();
var district = require('../controllers/district');

districtRouter.get('/', function(req, res) {
    district.search(req, res);
})

districtRouter.post('/', function(req, res) {
    district.add(req, res);
})

districtRouter.put('/', function(req, res) {
	district.edit(req, res);
})

districtRouter.delete('/', function(req, res) {
	district.remove(req, res);
})

districtRouter.get('/mobile', function(req, res) {
    district.searchMobile(req, res);
})

districtRouter.post('/bulk', function(req, res) {
    district.bulkAdd(req, res);
})

// districtRouter.get('/mobile/area/:idProvince', function(req, res) {
//     district.getAreaByIdProvinsi(req, res)
// })

// districtRouter.get('/mobile/district/:idArea', function(req, res) {
//     district.getDistrictByIdArea(req, res)
// })

module.exports = districtRouter;