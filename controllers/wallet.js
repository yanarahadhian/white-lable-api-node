var tbl_wallet = require('../models/tbl_wallet');
var logger = require('../libraries/logger');
var moment = require("moment");
var auth = require('../controllers/auth');

exports.search = function (req, res) {

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

    // CONDITION MANAGEMENT
    if (req.query.id) {
        field += "id = ?";
        value.push(req.query.id);
        if (req.query.network || req.query.user_id || req.query.name || req.query.username || req.query.account_id || req.query.agent_loper_biller || req.query.efective_balance || req.query.efective_point || req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.network) {
        field += "us.network = ?";
        value.push(req.query.network);
        if (req.query.user_id || req.query.name || req.query.username || req.query.account_id || req.query.agent_loper_biller || req.query.efective_balance || req.query.efective_point || req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.user_id) {
        field += "user_id = ?";
        value.push(req.query.user_id);
        if (req.query.name || req.query.username || req.query.account_id || req.query.agent_loper_biller || req.query.efective_balance || req.query.efective_point || req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.name) {
        field += "us.name like ?";
        value.push("%" + req.query.name + "%");
        if (req.query.username || req.query.account_id || req.query.agent_loper_biller || req.query.efective_balance || req.query.efective_point || req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.username) {
        field += "wl.username = ?";
        value.push(req.query.username);
        if (req.query.account_id || req.query.agent_loper_biller || req.query.efective_balance || req.query.efective_point || req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.account_id) {
        field += "account_id like ?";
        value.push("%" + req.query.account_id + "%");
        if (req.query.agent_loper_biller || req.query.efective_balance || req.query.efective_point || req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.agent_loper_biller) {
        field += "agent_loper_biller like ?";
        value.push("%" + req.query.agent_loper_biller + "%");
        if (req.query.efective_balance || req.query.efective_point || req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.efective_balance) {
        field += "efective_balance like ?";
        value.push("%" + req.query.efective_balance + "%");
        if (req.query.efective_point || req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.efective_point) {
        field += "efective_point like ?";
        value.push("%" + req.query.efective_point + "%");
        if (req.query.batas_limit || req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.batas_limit) {
        field += "batas_limit like ?";
        value.push("%" + req.query.batas_limit + "%");
        if (req.query.enable_disable || req.query.network_name)
            field += " AND ";
    }
    if (req.query.enable_disable) {
        value.push("%" + req.query.enable_disable + "%");
        field += "enable_disable like ?"
        if (req.query.network_name)
            field += " AND "
    } if (req.query.network_name) {
        field += "nw.network like ?"
        value.push("%" + req.query.network_name + "%")
    }

    // SORT MANAGEMENT
    if (req.query.orderName) {
        orderBy = " ORDER BY " + req.query.orderName;
        if (req.query.orderBy) {
            orderBy += " " + req.query.orderBy;
        } else {
            orderBy += " ASC";
        }
    } else {
        orderBy = " ORDER BY network_id, name";
    }

    logger.info("\n Request for Search Wallet : " + JSON.stringify(req.query));

    tbl_wallet.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            if (page !== "all") {
                index = (page - 1) * size
                maxindex = (page * size)
                rows = rows.slice(index, maxindex)   
            }                

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Wallet Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Wallet Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Wallet Response : ", JSON.stringify(result));
        res.json(result)
    
    })
};

exports.edit = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    var result = {}
    var id = req.body.id

    var params = {
        type: req.body.type,
        efective_balance: (req.body.efective_balance) ? (req.body.efective_balance) : (0),
        temporary_balance: (req.body.temporary_balance) ? (req.body.temporary_balance) : 0,
        efective_point: (req.body.efective_point) ? (req.body.efective_point) : 0,
        temporary_point: (req.body.temporary_point)  ? (req.body.temporary_point) : 0,
        batas_limit: (req.body.batas_limit)  ? (req.body.batas_limit) : 0,
        description: req.body.description,
        value_data: req.body.value_data  ? (req.body.value_data) : (null),
        enable_disable: req.body.enable_disable,
        note: req.body.note,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request for Edit Wallet : " + JSON.stringify(params));

    tbl_wallet.update(params, id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Wallet Success";
            result.ResponseData = rows;
            logger.info("\n Wallet Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Wallet Response : ", JSON.stringify(result));
        res.send(result)
   
    })
};