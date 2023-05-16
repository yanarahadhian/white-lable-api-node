var tbl_recent_product_upload_log = require('../models/tbl_recent_product_upload_log');
var logger = require('../libraries/logger');
var auth = require('../controllers/auth');
var moment = require("moment");

exports.list = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    let result = {}

    let upload_id = req.params.upload_id

    tbl_recent_product_upload_log.listLogs(upload_id)
    .then(function(rows) {
        if (rows <= 0) {
            return Promise.reject('No Rows')
        } else {
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Get All Product Uploads Logs Successful"
            result.ResponseData = rows
            result.ResponseTotalResult = rows.length

            logger.info('\n Product Uploads Logs Response : ', JSON.stringify(result))

            res
                .status(200)
                .send(result)
        }
    })
    .catch(function(error) {
        result.ResponseCode = '500'
        result.ResponseDesc = error

        logger.info('\n Product Uploads Logs Response : ', JSON.stringify(result))

        res.send(result)
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
        product_model_upload_id: req.body.product_model_upload_id,
        template: req.body.template,
        scheme: req.body.scheme,
        sku: req.body.sku,
        product_name: req.body.product_name,
        operator: req.body.operator,
        start_date_time: req.body.start_date_time,
        end_date_time: req.body.end_date_time,
        harga_biller: req.body.harga_biller,
        fee_jpx: req.body.fee_jpx,
        fee_agent: req.body.fee_agent,
        fee_loper: req.body.fee_loper,
        selling_price: req.body.selling_price,
        max_admin: req.body.max_admin,
        point_loper: req.body.point_loper,
        point_agent: req.body.point_agent,
        description: req.body.description
    }

    logger.info("\n Request Upload Product logs : ", JSON.stringify(uploadLog));

    tbl_recent_product_upload_log.create(uploadLog)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Upload Product logs Success";
            result.ResponseData = rows;
            logger.info("\n Product Uploads Logs Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Uploads Logs Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.remove = function(req, res) {
    
    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }
    
    var id = req.query.id

    var params = {
        deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}
    
    logger.info("\n Request Remove Product Uploads Logs : ", JSON.stringify(req.query.id));
    
    tbl_recent_product_upload_log.update(params,id).then(function (rows){
        if (rows <= 0) {
            return Promise.reject('No Product Uploads Logs Deleted');
        }
        else{
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Remove Product Uploads Logs Success";
            result.ResponseData = rows;
            logger.info("\n Product Uploads Logs Response : ", JSON.stringify(result));

            res.send(result);        
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Uploads Logs Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}