var express = require('express');
var mosqueRouter = express.Router();
var mosque = require('../controllers/mosque');

mosqueRouter.get('/', function(req, res) {
    mosque.getMosqueByDistrict(req, res);
})

mosqueRouter.get('/beta', function(req, res) {
    mosque.getMosqueTestBeta(req, res);
})

mosqueRouter.post('/', function(req, res) {
    mosque.add(req, res);
})

mosqueRouter.post('/verify', function(req, res) {
    mosque.verifyMasjidOnly(req, res);
})

mosqueRouter.get('/search', function(req, res) {
    mosque.search(req, res);
})

mosqueRouter.post('/verify_as_agent', function(req, res) {
    mosque.verifyMasjidAsAgent(req, res);
})

mosqueRouter.post('/bulk', function(req, res) {
    mosque.bulkAdd(req, res)
})

module.exports = mosqueRouter;