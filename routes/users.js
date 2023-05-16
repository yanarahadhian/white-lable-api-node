var express = require('express');
var usersRouter = express.Router();
var users = require('../controllers/users');

usersRouter.get('/', function(req, res) {
    users.search(req, res);
})

usersRouter.get('/uplines', function(req, res) {
    users.searchUplines(req, res);
})

usersRouter.post('/', function(req, res) {
    users.add(req, res);
})

usersRouter.put('/', function(req, res) {
    users.edit (req, res);
})

usersRouter.post('/change_password', function(req, res) {
	users.changePassword(req, res);
})

usersRouter.post('/reset_password', function(req, res) {
	users.resetPassword(req, res);
})

usersRouter.delete('/', function(req, res) {
	users.remove(req, res);
})

usersRouter.post('/bulk_insert', function(req, res) {
	users.bulkInsert(req, res)
})

usersRouter.post('/bulk_remove', function(req, res) {
	users.bulkRemove(req, res)
})

usersRouter.post('/agent_loper', function(req, res) {
	users.addAgentLoper(req, res)
})

usersRouter.put('/agent_loper', function(req, res) {
	users.editAgentLoper(req, res)
})

usersRouter.post('/register', function(req,  res){
    users.registerUser(req, res)
})

usersRouter.post('/masjid', function(req, res){
    users.createMasjid(req, res)
})


module.exports = usersRouter;