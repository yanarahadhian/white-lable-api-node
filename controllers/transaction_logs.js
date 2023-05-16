var tbl_transaction_log = require('../models/tbl_transaction_log');
var logger = require('../libraries/logger');
var moment = require("moment");
var auth = require('../controllers/auth')

exports.search = function(req, res) {
    var token = (req.headers.token) ? req.headers.token : null

    // VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    var field = "";
    var fieldLimit = "";
    var value = [];
    var result = {}
    var size = (req.query.size) ? req.query.size : 5
    var page = (req.query.page) ? req.query.page : 1

    if (req.query.network) {
        field += "users.network = ?"
        value.push(req.query.network);
        if (req.query.network_name || req.query.id || req.query.seller_name || req.query.request_time || req.query.invoice_id || req.query.product || req.query.type_trans || req.query.customer_number || req.query.billing_id || req.query.status )
            field += " AND ";
    }
    if (req.query.network_name) {
        field += "net.network like ?"
        value.push("%" + req.query.network_name + "%");
        if (req.query.id || req.query.seller_name || req.query.request_time || req.query.invoice_id || req.query.product || req.query.type_trans || req.query.customer_number || req.query.billing_id || req.query.status )
            field += " AND ";
    }
    if (req.query.id) {
        field += "tl.id = ?"
        value.push(req.query.id);
        if (req.query.seller_name || req.query.request_time || req.query.invoice_id || req.query.product || req.query.type_trans || req.query.customer_number || req.query.billing_id || req.query.status )
            field += " AND ";
    }
    if (req.query.seller_name) {
        field += "tl.seller_name like ?"
        value.push("%" + req.query.seller_name + "%");
        if (req.query.request_time || req.query.invoice_id || req.query.product || req.query.type_trans ||  req.query.customer_number || req.query.billing_id || req.query.status)
            field += " AND ";
    }
    if (req.query.request_time) {
        // parsing request_time value from string back to object literalls
        req.query.request_time = JSON.parse(req.query.request_time)

        field += "DATE(tl.request_time) " + req.query.request_time.comparator+" ?"
        value.push(moment(req.query.request_time.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"))

        if (req.query.invoice_id || req.query.product || req.query.type_trans ||  req.query.customer_number || req.query.billing_id || req.query.status) {
            field += ' AND '
        }
    }
    if (req.query.invoice_id) {
        field += "tl.invoice_id like ?"
        value.push("%" + req.query.invoice_id + "%");
        if (req.query.product || req.query.type_trans ||  req.query.customer_number || req.query.billing_id || req.query.status)
            field += " AND ";
    }
    if (req.query.product) {
        field += "tl.product like ?"
        value.push("%" + req.query.product + "%");
        if (req.query.type_trans ||  req.query.customer_number || req.query.billing_id || req.query.status)
            field += " AND ";
    }
    if (req.query.type_trans) {
        field += "tl.type_trans = ?"
        value.push(req.query.type_trans);
        if (req.query.customer_number || req.query.billing_id || req.query.status)
            field += " AND ";
    }
    if (req.query.customer_number) {
        field += "tl.customer_number like ?";
        value.push("%" + req.query.customer_number + "%");
        if (req.query.billing_id || req.query.status)
            field += " AND ";
    }
    if (req.query.billing_id) {
        field += "tl.billing_id like ?";
        value.push("%" + req.query.billing_id + "%");
        if (req.query.status)
            field += " AND ";
    }
    if (req.query.status) {
        field += "tl.status like ?";
        value.push("%" + req.query.status + "%");
    }

    if (req.query.orderName) {

        if (req.query.orderName === "network_name"){
            orderBy = " ORDER BY net.network";    
        }else{
            orderBy = " ORDER BY " + req.query.orderName;
        }
        
        if (req.query.orderBy) {
            orderBy += " " + req.query.orderBy;
        } else {
            orderBy += " ASC";
        }
    } else {
        orderBy = "";
    }

    // PAGINATION MANAGEMENT
    if (page !== "all") {
        let offset = (size * page) - (size)
        fieldLimit = ' LIMIT ' + size + ' OFFSET ' + offset
    }

    // tbl_transaction_log.search(field, value, orderBy, fieldLimit)
    tbl_transaction_log.search(field, value, orderBy, fieldLimit)
    .then(function (response) {

        if (response.rowsLength <= 0) {
            return Promise.reject('No rows')
        } else {
            result.ResponseCode = "200"
            result.ResponseDesc = "Search Transaction Logs Successful"
            result.ResponseTotalResult = response.rowsLength
            result.ResponseData = response.rowsFetch
            
            logger.info("\n Transaction Logs Response : ", JSON.stringify(result))
            
            res.json(result)
        }           
    }).catch(function (errors) {

        result.ResponseCode = "500"
        result.ResponseDesc = errors

        logger.info("\n Transaction Logs Response : ", JSON.stringify(result))
        res.json(result)
    
    })
}