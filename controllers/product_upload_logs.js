var tbl_product_upload_log = require('../models/tbl_product_upload_log');
var tbl_product_upload = require('../models/tbl_product_upload');
var logger = require('../libraries/logger');
var auth = require('../controllers/auth');

exports.list = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    let result = {}

    let file_id = req.params.file_id

    tbl_product_upload_log.getProductUploadLogsByFileId(file_id)
    .then(function(rows) {
        if (rows <= 0) {
            return Promise.reject('No Rows')
        } else {
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Get All Product Uploads By File ID Successful"
            result.ResponseData = rows
            result.ResponseTotalResult = rows.length

            logger.info('\n Product Uploads By File ID Response : ', JSON.stringify(result))

            res
                .status(200)
                .send(result)
        }
    })
    .catch(function(error) {
        result.ResponseCode = '500'
        result.ResponseDesc = error

        logger.info('\n Product Uploads By File ID Response : ', JSON.stringify(result))

        res.send(result)
    })
}

exports.remove = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    let result = {}

    let field = ''
    let value = []
    var orderBy = "";

    let file_id = req.params.file_id

    if (file_id) {
        field += 'product_upload_files.id = ?'
        value.push(file_id)
    }

    tbl_product_upload.search(field, value, orderBy)
    .then(function (rows) {
        let foundFileUploadLogs = rows.length === 1
        if (foundFileUploadLogs) {
            // perform delete
            
            tbl_product_upload_log.delete(file_id)
            .then(function (deleteResponse) {
                result.ResponseCode = auth_resp.status
                result.ResponseDesc = "Delete Successfull"
                result.ResponseData = deleteResponse
                result.ResponseTotalResult = rows.length
        
                logger.info('\n FIND FILE BY ID, SUCCESS RESPONSE : ', JSON.stringify(result))
        
                res
                    .status(200)
                    .json(result)
            })
            .catch(function (deleteErr) {
                console.log({deleteErr})
                return Promise.reject('Delete Process Has Problem')
            })


        } else {
            return Promise.reject('No Match File Upload Logs With Given ID')
        }

        
    })
    .catch(function (err) {
        result.ResponseCode = '500'
        result.ResponseDesc = err
        
        logger.info('\n FIND FILE BY ID, ERROR RESPONSE : ', JSON.stringify(result))

        res.json(result)
    })
}

exports.add = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var result = {}

    var uploadLog = {
        file_id: req.body.file_id,
        sku: req.body.sku,
        product_name: req.body.product_name,
        operator: req.body.operator,
        start_date_time: req.body.start_date_time,
        end_date_time: req.body.end_date_time,
        harga_biller: req.body.harga_biller,
        fee_jpx: req.body.fee_jpx,
        harga_agent: req.body.harga_agent,
        fee_agent: req.body.fee_agent,
        harga_jual: req.body.harga_jual,
        fee_loper: req.body.fee_loper,
        max_admin_loper: req.body.max_admin_loper,
        point_loper: req.body.point_loper,
        point_agent: req.body.point_agent,
        description: req.body.description
    }

    logger.info("\n Request Upload Product : ", JSON.stringify(uploadLog));

    tbl_product_upload_log.create(uploadLog)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Upload Product logs Success";
            result.ResponseData = rows;
            logger.info("\n Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}