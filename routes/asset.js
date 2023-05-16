let express = require('express')
let assetRouter = express.Router()
let asset = require('../controllers/asset')

assetRouter.post('/upload', function(req, res) {
    asset.uploadFileAsset(req, res)
})

assetRouter.delete('/', function(req, res) {
    asset.deleteFileAsset(req, res)
})

assetRouter.post('/uploadFileCsv', function(req, res) {
    asset.uploadFileCsv(req, res)
})

assetRouter.delete('/deleteFile', function(req, res) {
    asset.deleteFile(req, res)
})

module.exports = assetRouter