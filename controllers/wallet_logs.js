var tbl_wallet_log = require('../models/tbl_wallet_log');
var logger = require('../libraries/logger');
var moment = require("moment");
var auth = require('../controllers/auth')

exports.search = function(req, res) {
    
    let token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    let field = ""
    let fieldLimit = ""
    let value = []
    let result = {}
    let size = (req.query.size) ? req.query.size : 5
    let page = (req.query.page) ? req.query.page : 1

    if (req.query.network) {
        field += "users.network = ?"
        value.push(req.query.network);
        if (req.query.id || req.query.user_id || req.query.name || req.query.owner || req.query.transaction_date || req.query.invoice_id ||  req.query.source_account_id || req.query.dest_account_id || req.query.product || req.query.sku)
            field += " AND ";
    }
    if (req.query.id) {
        field += "wallet_logs.id = ?"
        value.push(req.query.id);
        if (req.query.user_id || req.query.name || req.query.owner || req.query.transaction_date || req.query.invoice_id ||  req.query.source_account_id || req.query.dest_account_id || req.query.product || req.query.sku)
            field += " AND ";
    }
    if (req.query.user_id) {
        field += "wallet_logs.user_id = ?"
        value.push(req.query.user_id);
        if (req.query.name || req.query.owner || req.query.transaction_date || req.query.invoice_id ||  req.query.source_account_id || req.query.dest_account_id || req.query.product || req.query.sku)
            field += " AND ";
    }
    if (req.query.name) {
        field += "users.name like ?"
        value.push("%" + req.query.name + "%");
        if (req.query.owner || req.query.transaction_date || req.query.invoice_id ||  req.query.source_account_id || req.query.dest_account_id || req.query.product || req.query.sku)
            field += " AND ";
    }
    if (req.query.owner) {
        field += "wallet_logs.owner like ?"
        value.push("%" + req.query.owner + "%");
        if (req.query.transaction_date || req.query.invoice_id ||  req.query.source_account_id || req.query.dest_account_id || req.query.product || req.query.sku)
            field += " AND ";
    }
    if (req.query.transaction_date) {
        // parsing transaction_date value from string back to object literalls
        req.query.transaction_date = JSON.parse(req.query.transaction_date)

        field += "DATE(wallet_logs.transaction_date) " + req.query.transaction_date.comparator+" ?"
        value.push(moment(req.query.transaction_date.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"))

        if (req.query.invoice_id ||  req.query.source_account_id || req.query.dest_account_id || req.query.product || req.query.sku) {
            field += ' AND '
        }
    }
    if (req.query.invoice_id) {
        field += "wallet_logs.invoice_id like ?"
        value.push("%" + req.query.invoice_id + "%");
        if (req.query.source_account_id || req.query.dest_account_id || req.query.product || req.query.sku)
            field += " AND ";
    }
    if (req.query.source_account_id) {
        field += "wallet_logs.source_account_id like ?"
        value.push("%" + req.query.source_account_id + "%");
        if (req.query.dest_account_id || req.query.product || req.query.sku)
            field += " AND ";
    }
    if (req.query.dest_account_id) {
        field += "wallet_logs.dest_account_id like ?"
        value.push("%" + req.query.dest_account_id + "%");
        if (req.query.product || req.query.sku)
            field += " AND ";
    }
    if (req.query.product) {
        field += "wallet_logs.product like ?"
        value.push("%" + req.query.product + "%");
        if (req.query.sku)
            field += " AND ";
    }
    if (req.query.sku) {
        field += "wallet_logs.sku like ?";
        value.push("%" + req.query.sku + "%");
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
    
    // PAGINATION MANAGEMENT
    if (page !== "all") {
        let offset = (size * page) - (size)
        fieldLimit = ' LIMIT ' + size + ' OFFSET ' + offset
    }

    tbl_wallet_log.searchWalletLogs(field, value, orderBy, fieldLimit)
    .then(function (response) {
        if (response.rowsLength <= 0) {
            return Promise.reject('No rows')
        } else {
            result.ResponseCode = "200"
            result.ResponseDesc = "Search Wallet Logs Successful"
            result.ResponseTotalResult = response.rowsLength
            result.ResponseData = response.rowsFetch
            
            logger.info("\n Transaction Logs Response : ", JSON.stringify(result))
            
            res.json(result)
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Wallet Logs Response : ", JSON.stringify(result));
        
        res.send(result)
    })
}