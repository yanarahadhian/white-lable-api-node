var express = require('express');
var authRouter = express.Router();
var auth = require('../controllers/auth');

authRouter.post('/login', function(req, res) {
    auth.login(req, res);
})

module.exports = authRouter;