var express = require('express');
var roleRouter = express.Router();
var role = require('../controllers/role');

roleRouter.get('/', function(req, res) {
    role.search(req, res);
})

roleRouter.post('/', function(req, res) {
    role.add(req, res);
})

roleRouter.put('/', function(req, res) {
	role.edit(req, res);
})

roleRouter.delete('/', function(req, res) {
	role.remove(req, res);
})

roleRouter.get('/role_rights/:id', function(req, res) {
	role.viewRights(req, res);
})

roleRouter.put('/update_rights', function(req, res) {
	role.updateRights(req, res);
})

module.exports = roleRouter;