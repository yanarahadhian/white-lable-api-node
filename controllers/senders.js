var tbl_sender = require('../models/tbl_sender');
var tbl_network = require('../models/tbl_network');
var logger = require('../libraries/logger');
var moment = require("moment");
var auth = require('./auth');

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

    // CONDITION MANAGEMENT
    if (req.query.id) {
        field += "senders.id = ?"
        value.push(req.query.id);
        if (req.query.sender)
            field += " AND ";
    }
    if (req.query.sender) {
        field += "senders.sender like ?"
        value.push(`%${ req.query.sender }%`);
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
        orderBy = "";
    }

    tbl_sender.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            result.ResponseCode = "404";
            result.ResponseDesc = 'Data Not Found!';
    
            logger.info("\n Senders Response : ", JSON.stringify(result));
            res.json(result)
        } else {

            total = rows.length

            if (page !== "all") {
                index = (page - 1) * size
                maxindex = (page * size)
                rows = rows.slice(index, maxindex)   
            }                

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Senders Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Senders Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Senders Response : ", JSON.stringify(result));
        res.json(result)
    
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

    var params = {
        sender: req.body.sender,
        description: req.body.description,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Add Sender Request : " + JSON.stringify(req.body));

    if (!field){
        field += " senders.sender = ?";    
    }
    value.push(params.sender);

    tbl_sender.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Sender already exists');
        }
        return tbl_sender.create(params)
    }).then(function (sender) {
        if (sender.length == 0) {
            return Promise.reject('No rows');
        } else {
            result.ResponseCode = auth_resp.status
            result.ResponseDesc = "Create Sender Success!"
            result.ResponseData = sender

            logger.info("\n Users Response : ", JSON.stringify(result));
            res.send(result)
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Sender Response : ", JSON.stringify(result));
        res.send(result)
    
    })
};

exports.edit = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var id = req.body.id

    var params = {
        sender: req.body.sender,
        description: req.body.description,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}

    logger.info("\n Request Edit Sender : ", JSON.stringify(id));

    tbl_sender.update(params, id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Senders Success";
            result.ResponseData = rows;
            logger.info("\n Senders Response : ", JSON.stringify(result));

            res.send(result);

        }

    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Senders Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.delete = function(req, res) {
    
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

    var id = req.query.id
    var params = {
        deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Delete Sender : ", JSON.stringify(id));

    if (!field){
        field += " network.sender_id = ?";    
    }
    value.push(id);

    tbl_sender.search(field, value, orderBy)
    .then(function (rows){
        if (rows.length !== 0) {
            return Promise.reject("This Sender is being used by Network "+rows[0].network);
        } else {
            return tbl_sender.update(params, id)
        }
    }).then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Deleted');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Delete Senders Success";
            result.ResponseData = rows;
            logger.info("\n Senders Response : ", JSON.stringify(result));

            res.send(result);

        }
        
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Senders Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}