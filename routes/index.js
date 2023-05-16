const express = require('express')
const indexRouter = express.Router()

indexRouter.get('/', function(req, res) {
    const result = {
        ResponseCode : '200',
        ResponseDesc : 'Admin API running'
    }

    res.status(200).json(result)
})

module.exports = indexRouter