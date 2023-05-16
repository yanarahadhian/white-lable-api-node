let { uploadFile, deleteFile } = require('../middleware/asset')
let tbl_network = require('../models/tbl_network')
let fs = require('fs')
let fileType = require('file-type')
let multiparty = require('multiparty')
let logger = require('../libraries/logger')
let auth = require('../controllers/auth')

exports.uploadFileAsset = function(req, res) {
    let result = {}

    let token = (req.headers.token) ? req.headers.token : null
    
    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    const form = new multiparty.Form()

    form.parse(req, function (error, fields, files) {

        if (error) throw new Error(error)
        
        try {
            const path = files.file[0].path
            const buffer = fs.readFileSync(path)

            const type = fileType(buffer)
            const timestamp = Date.now().toString();
            const fileName = `assets/${timestamp}-${files.file[0].originalFilename}`;

            uploadFile(buffer, fileName, type)
            .then(function (uploadResponse) {
                result.ResponseCode = auth_resp.status
                result.ResponseDesc = "Upload Asset Successful"
                result.ResponseData  = uploadResponse

                logger.info("\n Upload Asset Response : ", JSON.stringify(result))

                res.status(200).json(result)
            })
            .catch(function (uploadErr) {
                result.ResponseCode = "400"
                result.ResponseDesc = uploadErr

                logger.info("\n Upload Asset Response : ", JSON.stringify(result))

                res.json(result)
            })
        } catch (error) {

            result.ResponseCode = "400"
            result.ResponseDesc = error

            logger.info("\n Upload Asset Response : ", JSON.stringify(result))

            res.json(result)
        }
      })
}

exports.deleteFileAsset = function(req, res) {
    let { asset_url } = req.query
    let objectKey = 'assets/'
    let token = (req.headers.token) ? req.headers.token : null
    let result = {}
    
    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    tbl_network.checkAssetOnAWS(asset_url)
    .then((resFileCheck) => {
        let { file_count } = resFileCheck[0]

        // if filename is not used in any fields (app logo, splash screen, banner, dashboard logo, favicon)
        // proceed delete the file on the aws bucket
        if (file_count <= 1) {

            let fileName = getFileName(asset_url)
            objectKey += fileName
            // objectKey += fileName

            return deleteFile(objectKey)

        } else {
            return Promise.reject("Asset still used and is not deleted on cloud buckets")
        }
    })
    .then((responseDelete) => {
        result.ResponseCode = "200"
        result.ResponseDesc = responseDelete

        logger.info("\n Delete File Response : ", JSON.stringify(result))

        res.status(200).send(result)
    })
    .catch((err) => {
        result.ResponseCode = "400"
        result.ResponseDesc = err
        
        logger.info("\n Delete File Response (error) : ", JSON.stringify(result))
        
        res.send(result)
    })
}

exports.uploadFileCsv = function(req, res) {
    let result = {}

    let token = (req.headers.token) ? req.headers.token : null
    
    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    const form = new multiparty.Form()

    form.parse(req, function (error, fields, files) {

        if (error) throw new Error(error)

        try {
            const path = files.file[0].path
            const buffer = fs.readFileSync(path)

            const type = { ext: 'csv', mime: 'text/csv' }
            const timestamp = Date.now().toString();
            const fileName = `uploads/${timestamp}-${files.file[0].originalFilename}`;
            
            uploadFile(buffer, fileName, type)
            .then(function (uploadResponse) {
                result.ResponseCode = auth_resp.status
                result.ResponseDesc = "Upload File Successful"
                result.ResponseData  = uploadResponse

                logger.info("\n Upload File Response : ", JSON.stringify(result))

                res.status(200).json(result)
            })
            .catch(function (uploadErr) {
                result.ResponseCode = "400"
                result.ResponseDesc = uploadErr

                logger.info("\n Upload File Response : ", JSON.stringify(result))

                res.json(result)
            })
        } catch (error) {

            result.ResponseCode = "400"
            result.ResponseDesc = error

            logger.info("\n Upload File Response : ", JSON.stringify(result))

            res.json(result)
        }
      })
}

getFileName = function(assetUrl) {
    let flag = "/"
    let startIndex = assetUrl.lastIndexOf(flag) + 1
    let fileName = assetUrl.slice(startIndex)

    return fileName
}