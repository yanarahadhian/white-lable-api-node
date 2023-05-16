const express = require('express')
const bankRouter = express.Router()
let bank = require('../controllers/bank')

bankRouter.get('/', function (req, res) {
    bank.list(req, res)
})

module.exports = bankRouter