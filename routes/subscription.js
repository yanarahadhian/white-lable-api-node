const express = require('express')
const subscriptionRouter = express.Router()
const subscription = require('../controllers/subscription')

subscriptionRouter.get('/', function(req, res) {
    subscription.search(req, res)
})

subscriptionRouter.delete('/', function(req, res) {
    subscription.delete(req, res)
})

subscriptionRouter.post('/', function(req, res) {
    subscription.add(req, res)
})

subscriptionRouter.put('/', function(req, res) {
    subscription.edit(req, res)
})

subscriptionRouter.get('/logs', function(req, res) {
    subscription.getLogs(req, res)
})

module.exports = subscriptionRouter