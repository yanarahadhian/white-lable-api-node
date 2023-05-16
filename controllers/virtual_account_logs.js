var tbl_va_logs = require('../models/tbl_va_logs');
var logger = require('../libraries/logger');
var moment = require("moment");
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

    if (req.query.network) {
        field += "users.network = ?"
        value.push(req.query.network);
        if (req.query.id || req.query.invoice_id || req.query.virtual_account_id || req.query.user_name || req.query.payment_amount || req.query.va_status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.id) {
        field += "val.id = ?"
        value.push(req.query.id);
        if (req.query.invoice_id || req.query.virtual_account_id || req.query.user_name || req.query.payment_amount || req.query.va_status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.invoice_id) {
        field += "val.invoice_id like ?"
        value.push("%" + req.query.invoice_id + "%");
        if (req.query.virtual_account_id || req.query.user_name || req.query.payment_amount || req.query.va_status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.virtual_account_id) {
        field += "va.virtual_account_id = ?"
        value.push(req.query.virtual_account_id);
        if (req.query.user_name || req.query.payment_amount || req.query.va_status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.user_name) {
        field += "val.user_name like ?"
        value.push("%" + req.query.user_name + "%");
        if (req.query.payment_amount || req.query.va_status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.payment_amount) {
        field += "val.payment_amount like ?"
        value.push("%" + req.query.payment_amount + "%");
        if (req.query.va_status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.va_status) {
        field += "val.va_status like ?"
        value.push("%" + req.query.va_status + "%");
        if (req.query.created_at)
            field += " AND ";
    }
    if (req.query.created_at) {
        // parsing created_at value from string back to object literalls
        req.query.created_at = JSON.parse(req.query.created_at)
        field += "DATE(val.created_at) "+req.query.created_at.comparator+" ?"
        value.push(moment(req.query.created_at.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"));
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

    tbl_va_logs.search(field, value, orderBy).then(function (rows) {
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
            result.ResponseDesc = "Search Transaction Logs Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Transaction Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Transaction Response : ", JSON.stringify(result));
        res.send(result)
    
    })
}