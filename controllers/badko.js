var tbl_badko = require('../models/tbl_badko');
var logger = require('../libraries/logger');
var auth = require('../controllers/auth')

exports.searchMobile = function(req, res){

    var field = "";
    var value = [];
    var result = {}

    if (req.query.id) {
        field += "id = ?"
        value.push(req.query.id);
        if (req.query.badko_name)
            field += " AND ";
    }
    if (req.query.badko_name) {
        field += "badko_name like ?"
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

    logger.info("\n Request for Badan Koordinasi HMI " + JSON.stringify(req.query));

    tbl_badko.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            result.ResponseDesc = "Search Badan Koordinasi HMI Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Badan Koordinasi HMI Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Badan Koordinasi HMI Response : ", errors);
        res.send(result)
    
    })
    
}