var moment  = require("moment");
var logger  = require('../libraries/logger');
var config  = require('../config/config');
var redis_ws = require('../libraries/redis_ws');
var tbl_user = require('../models/tbl_user');
var tbl_virtual_account = require('../models/tbl_virtual_account');
var tbl_va_logs = require('../models/tbl_va_logs');
var auth = require('../controllers/auth');

exports.search = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
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
        field += "va.id = ?"
        value.push(req.query.id)
        if (req.query.user_id || req.query.network || req.query.virtual_account_id || req.query.name || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.user_id) {
        field += "va.user_id = ?"
        value.push(req.query.user_id)
        if (req.query.network || req.query.virtual_account_id || req.query.name || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.network) {
        field += "us.network = ?"
        value.push(req.query.network)
        if (req.query.virtual_account_id || req.query.name || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.virtual_account_id) {
        field += "va.virtual_account_id like ?"
        value.push(`%${ req.query.virtual_account_id }%`);
        if (req.query.user_id || req.query.name || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.name) {
        field += "us.name like ?"
        value.push(`%${ req.query.name }%`);
        if (req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.status) {
        field += "va.status like ?"
        value.push(`%${ req.query.status }%`);
        if (req.query.created_at)
            field += " AND ";
    }

    // (req.query.created_at) ? (req.query.created_at = JSON.parse(req.query.created_at)) : ('')
    
    if (req.query.created_at) {
        // parsing created_at value from string back to object literalls
        req.query.created_at = JSON.parse(req.query.created_at)

        field += "DATE(va.created_at) "+req.query.created_at.comparator+" ?"
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

    logger.info("\n Request for Search Virtual Account : " + JSON.stringify(req.query));
    
    tbl_virtual_account.search(field, value, orderBy)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            if(page!=="all"){
                index = (page-1)*size
                maxindex = (page*size)
                rows = rows.slice(index,maxindex)   
            }
            
            const setExpireAt = (row) => new Promise((resolve, reject) => {
                row.expired_at = moment(row.created_at).add(2, 'y');
                resolve(row);
            });

            var dataRow = [];            
            for(var i=0; i < rows.length; i++) {
                dataRow.push(setExpireAt(rows[i]));
            }

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Virtual Account Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Virtual Account Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Virtual Account Response : ", JSON.stringify(result));
        res.send(result)
       
    })
}

exports.add = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var field = "";
    var value = [];
    var orderBy = "";
    var result = {}

    var param_username = req.body.Username;
    var param_data = {
        'type'              : "createbilling",
        "client_id"         : config.bni_va.client_id,
        "trx_amount"        : req.body.TrxAmount,
        "billing_type"      : req.body.BillingType,
        "customer_name"     : "",
        "customer_email"    : "",
        "customer_phone"    : "",
        "datetime_expired"  : moment().add(2, 'y').format(),
        "description"       : "",
        "source_service"    : "web-dashboard",
        "trx_id"            : "",
        "virtual_account"   : ""
    }

    logger.info("\n Request For Creating Vitual Account : " + JSON.stringify(req.body));

    if (!field){
        field += " users.username = ?";    
    }
    value.push(param_username);

    tbl_user.search(field, value, orderBy)
    .then(function (users_details) {
        if (users_details.length == 0) {
            return Promise.reject('Username does not exist');
        } else {
            param_data.customer_name   = users_details[0].name;
            param_data.customer_email  = users_details[0].email;
            param_data.customer_phone  = users_details[0].phone_number;
            param_data.virtual_account = users_details[0].phone_number;
            param_data.description     = "Creating VA for " + users_details[0].phone_number;
            
            var sending_data = {
                "jobs": "CREATEVA",
                "data": param_data,
                "user": param_username
            };
            //sending data to redis
            return redis_ws.post_method(sending_data, config.redis_ws.create_va);
        }
    }).then(function (redis_response) {

        result.ResponseCode = redis_response.code;
        result.ResponseDesc = redis_response.message;
        result.ResponseData = redis_response.trx_id;

        logger.info("\n Response For Creating Virtual Account Data : ", JSON.stringify(result));
        res.send(result);

    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = (errors.hasOwnProperty("errno")) ? errors.errno : errors;

        logger.info("\n Response For Creating Vitual Account : ", JSON.stringify(result));
        res.send(result)

    })
}

exports.edit = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var field = "";
    var value = [];
    var orderBy = "";
    var result = {}

    var param_username = req.body.Username;
    var param_data = {
        'type'              : "updatebilling",
        "client_id"         : config.bni_va.client_id,
        "trx_id"            : req.body.VirtualAccount,
        "trx_amount"        : "0",
        "customer_name"     : req.body.CustomerName,
        "customer_email"    : req.body.CustomerEmail,
        "customer_phone"    : req.body.CustomerPhone,
        "virtual_account"   : req.body.VirtualAccount,
        "datetime_expired"  : req.body.ExpiredDate,
        "description"       : req.body.Description,
        "va_status"         : req.body.VirtualAccountStatus
    }

    logger.info("\n Request For Edit Virtual Account Data : " + JSON.stringify(req.body));

    if (!field){
        field += " users.username = ?";    
    }
    value.push(param_username);

    tbl_user.search(field, value, orderBy)
    .then(function (users_details) {
        if (users_details.length == 0) {
            return Promise.reject('Username does not exist');
        } else {
            if (!req.body.CustomerName) {
                param_data.customer_name = users_details[0].name;
            }
            if (!req.body.CustomerEmail) {
                param_data.customer_email = users_details[0].email;
            }
            if (!req.body.CustomerPhone) {
                param_data.customer_phone = users_details[0].phone_number;
            }
            
            field = "";
            value = [];
            orderBy = "";

            if (!field){
                field += " va.user_id = ?";    
            }
            value.push(param_username);

            return tbl_virtual_account.search(field, value, orderBy);

        }
    }).then(function (va_details) {
        if (va_details.length == 0) {
            return Promise.reject('Virtual Account does not exist');
        } else {

            if (!req.body.VirtualAccount) {
                param_data.virtual_account = va_details[0].virtual_account_id;
            }
            if (!req.body.ExpiredDate) {
                param_data.datetime_expired = va_details[0].created_at;
            }
            if (!req.body.Description) {
                param_data.description = va_details[0].note;
            }

            if (!req.body.VirtualAccountStatus) {
                param_data.va_status = va_details[0].status;
            } /*else {
                if (req.body.VirtualAccountStatus == 1) {
                    var sending_data = {
                        "jobs": "ACTIVEVA",
                        "data": param_data,
                        "user": param_username
                    };
                } else {
                    var sending_data = {
                        "jobs": "DEACTIVEVA",
                        "data": param_data,
                        "user": param_username
                    };
                }
                
            }*/

            var sending_data = {
                "jobs": "UPDATEVA",
                "data": param_data,
                "user": param_username
            };

            //sending data to redis
            return redis_ws.post_method(sending_data, config.redis_ws.update_va);
        }
    
    }).then(function (redis_response) {

        result.ResponseCode = redis_response.code;
        result.ResponseDesc = redis_response.message;
        result.ResponseData = redis_response.trx_id;

        logger.info("\n Response For Edit Virtual Account Data : ", JSON.stringify(result));
        res.send(result);

    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = (errors.hasOwnProperty("errno")) ? errors.errno : errors;

        logger.info("\n Response For Edit Virtual Account Data : ", JSON.stringify(result));
        res.send(result);

    })
};

exports.getLogs = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var field = "";
    var value = [];
    var orderBy = "";
    var result = {}

    var param_id = req.params.id;

    logger.info("\n Request For Virtual Account Logs : " + JSON.stringify(req.params));

    if (!field){
        field += " va.id = ?";    
    }
    value.push(param_id);

    tbl_virtual_account.search(field, value, orderBy)
    .then(function (virtualAccount) {
        if (virtualAccount.length == 0) {
            return Promise.reject('Virtual Account does not exist');
        } else {
            result.ResponseData = virtualAccount[0];

            field = "";
            value = [];
            orderBy = "";

            if (!field){
                field += " val.user_id = ?";    
            }
            value.push(virtualAccount[0].user_id);

            return tbl_va_logs.search(field, value, orderBy)

        }
    }).then(function (virtualAccountLogs) {

        result.ResponseCode = auth_resp.status;
        result.ResponseDesc = "Get Virtual Account Logs Success";
        result.ResponseData.Activities = virtualAccountLogs;

        logger.info("\n Response For Virtual Account Logs : ", JSON.stringify(result));
        res.send(result);

    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;
        logger.info("\n Response For Virtual Account Logs : ", JSON.stringify(result));
        res.send(result);

    })

};
