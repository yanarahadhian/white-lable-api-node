var tbl_province = require('../models/tbl_province');
var logger = require('../libraries/logger');
var auth = require('../controllers/auth')

exports.search = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    var field = "";
    var value = [];
    var result = {}
    var size = (req.query.size) ? req.query.size : 5
    var page = (req.query.page) ? req.query.page : 1
    var index = ""
    var maxindex = ""

    if (req.query.id) {
        field += "id = ?"
        value.push(req.query.id);
        if (req.query.province_name)
            field += " AND ";
    }
    if (req.query.province_name) {
        field += "province_name like ?"
        value.push("%" + req.query.province_name + "%");
    }

    if (req.query.orderName) {
        orderBy = " ORDER BY " + req.query.orderName;
        if (req.query.orderBy) {
            orderBy += " " + req.query.orderBy;
        } else {
            orderBy += " ASC";
        }
    } else {
        orderBy = "";
    }

    logger.info("\n Request for Search Provinces : " + JSON.stringify(req.query));

    tbl_province.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            if(page!=="all"){
                index = (page-1)*size
                maxindex = (page*size)
                rows = rows.slice(index,maxindex)   
            }                

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Province Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Province Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Province Response : ", JSON.stringify(result));
        res.send(result)
    
    })
}

exports.searchMobile = function(req, res){

    var field = "";
    var value = [];
    var result = {}

    if (req.query.id) {
        field += "id = ?"
        value.push(req.query.id);
        if (req.query.province_name)
            field += " AND ";
    }
    if (req.query.province_name) {
        field += "province_name like ?"
        value.push("%" + req.query.province_name + "%");
    }

    if (req.query.orderName) {
        orderBy = " ORDER BY " + req.query.orderName;
        if (req.query.orderBy) {
            orderBy += " " + req.query.orderBy;
        } else {
            orderBy += " ASC";
        }
    } else {
        orderBy = "";
    }

    logger.info("\n Request for Search Provinces : " + JSON.stringify(req.query));

    tbl_province.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            result.ResponseDesc = "Search Province Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Province Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Province Response : ", errors);
        res.send(result)
    
    })
    
}