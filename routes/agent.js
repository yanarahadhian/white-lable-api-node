var express = require('express');
var agentRouter = express.Router();
var agent = require('../controllers/agent');

agentRouter.post('/search', function(req, res) {
    agent.search(req, res);
})

agentRouter.post('/add', function(req, res) {
    agent.add(req, res);
})

agentRouter.get('/list', function(req, res) {
    agent.list(req, res);
})

agentRouter.post('/listUpline', function(req, res) {
    agent.listUpline(req, res);
})

agentRouter.get('/listByNetwork/:id', function(req, res) {
    agent.listByNetwork(req, res);
})

agentRouter.get('/view/:username', function(req, res) {
	agent.view(req, res);
})

agentRouter.post('/edit', function(req, res) {
	agent.edit(req, res);
})

agentRouter.post('/update_status', function(req, res) {
	agent.updateStatus(req, res);
})

agentRouter.post('/reset_password', function(req, res) {
	agent.resetPassword(req, res);
})

agentRouter.post('/remove', function(req, res) {
	agent.remove(req, res);
})

module.exports = agentRouter;