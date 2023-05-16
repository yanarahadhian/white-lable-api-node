var express = require('express');
var menuRouter = express.Router();
var menu = require('../controllers/menu');

menuRouter.get('/', function(req, res) {
    menu.list(req, res);
})

menuRouter.get('/page_list', function(req, res) {
    menu.pageList(req, res);
})

menuRouter.post('/page', function(req, res) {
    menu.addMenuPage(req, res);
})

menuRouter.put('/page', function(req, res) {
    menu.editMenuPage(req, res);
})

menuRouter.delete('/page', function(req, res) {
    menu.deleteMenuPage(req, res);
})

module.exports = menuRouter;