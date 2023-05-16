var tbl_komisariat = require('../models/tbl_komisariat');
var logger = require('../libraries/logger');
var moment = require("moment");
var auth = require('../controllers/auth')

exports.searchMobile = function(req, res) {

    var field = "";
    var value = [];
    var result = {}

    if (req.query.id) {
        field += "kom.id = ?"
        value.push(req.query.id);
        if (req.query.komisariat_name || req.query.badko_id || req.query.cabang_id || req.query.cabang_name || req.query.badko_name)
            field += " AND ";
    }
    if (req.query.komisariat_name) {
        field += "kom.komisariat_name like ?"
        value.push("%" + req.query.komisariat_name + "%");
        if (req.query.badko_id || req.query.cabang_id || req.query.cabang_name || req.query.badko_name)
            field += " AND ";
    }
    if (req.query.badko_id) {
        field += "kom.badko_id = ?"
        value.push(req.query.badko_id);
        if (req.query.cabang_id || req.query.cabang_name || req.query.badko_name)
            field += " AND ";
    }
    if (req.query.cabang_id) {
        field += "kom.cabang_id = ?"
        value.push(req.query.cabang_id);
        if (req.query.cabang_name || req.query.badko_name)
            field += " AND ";
    }
    if (req.query.cabang_name) {
        field += "cab.cabang_name like ?"
        value.push("%" + req.query.cabang_name + "%");
        if (req.query.badko_name)
            field += " AND ";
    }
    if (req.query.badko_name) {
        field += "bad.badko_name like ?"
        value.push("%" + req.query.badko_name + "%");
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

    logger.info("\n Request for Search HMI Komisariat : " + JSON.stringify(req.query));

    tbl_komisariat.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            result.ResponseDesc = "Search HMI Komisariat  Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n HMI Komisariat  Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n HMI Komisariat  Response : ", errors);
        res.send(result)
    
    })
}