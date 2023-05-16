var express = require('express');
var userStatisticRouter = express.Router();
var userStatistic = require('../controllers/user_statistics');

userStatisticRouter.get('/', function(req, res) {
    userStatistic.search(req, res);
})

userStatisticRouter.get('/active_users', function(req, res) {
    userStatistic.activeUsers(req, res);
})

userStatisticRouter.get('/growth_users', function(req, res) {
    userStatistic.growthUsers(req, res);
})

module.exports = userStatisticRouter;