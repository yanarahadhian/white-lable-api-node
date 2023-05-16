var tbl_product_assignment = require('../models/tbl_product_assignment');
var logger = require('../libraries/logger');
var moment = require("moment");
var auth = require('../controllers/auth');

exports.search = function (req, res) {

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

    
    if(req.query.id){
        field += "pa.id = ?"
        value.push(req.query.id);
        if (req.query.user_id || req.query.product_id || req.query.network || req.query.agent || req.query.template || req.query.scheme)
            field += " AND ";
    }
    if(req.query.user_id){
        field += "pa.user_id = ?"
        value.push(req.query.user_id);
        if (req.query.product_id || req.query.network || req.query.agent || req.query.template || req.query.scheme)
            field += " AND ";
    }
    if(req.query.product_id){
        field += "pa.product_id = ?"
        value.push(req.query.product_id);
        if (req.query.network || req.query.agent || req.query.template || req.query.scheme)
            field += " AND ";
    }
    if (req.query.network) {
        field += "net.network like ?"
        value.push("%" + req.query.network + "%");
        if (req.query.agent || req.query.template || req.query.scheme)
            field += " AND ";
    }
    if (req.query.agent_name) {
        field += "us.name like ?"
        value.push("%" + req.query.name + "%");
        if (req.query.template || req.query.scheme)
            field += " AND ";
    }
    if (req.query.template) {
        field += "pm.template like ?"
        value.push("%" + req.query.template + "%");
        if (req.query.scheme)
            field += " AND ";
    }
    if (req.query.scheme) {
        field += "pm.scheme like ?"
        value.push("%" + req.query.scheme + "%");
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
    
    logger.info("\n Request Search Product Assignment: ", JSON.stringify(req.query));

    tbl_product_assignment.search(field, value, orderBy).then(function (rows) {
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
            result.ResponseDesc = "Search Product Assignment Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Product Assignment Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Assignment Response : ", JSON.stringify(result));
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

    var field = "";
    var value = [];
    var orderBy = "";
    var result = {}
    var data = {
        user_id: req.body.user_id,
        product_id: req.body.product_id,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }
    
    logger.info("\n Request Add Product Assignment : ", JSON.stringify(data));

    if (!field){
        field += " pa.user_id = ?";    
    }
    value.push(data.user_id);

    if (field){
        field += " AND pa.product_id = ?";    
    }
    value.push(data.product_id);

    tbl_product_assignment.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Assignment Product already exists !');
        }

        return tbl_product_assignment.create(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Product Assignment Success";
            result.ResponseData = rows;
            logger.info("\n Product Assignment Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Assignment Response : ", JSON.stringify(result));
        res.send(result)
   
    })
    
}

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
        user_id: req.body.user_id,
        product_id: req.body.product_id,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }

    var result = {}

    logger.info("\n Request Edit Product Assignment : ", JSON.stringify(id));

    tbl_product_assignment.update(params,id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Product Assignment Success";
            result.ResponseData = rows;
            logger.info("\n Product Assignment Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Assignment Response : ", JSON.stringify(result));
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

    logger.info("\n Request Remove Product Assignment: ", JSON.stringify(id));

    tbl_product_assignment.update(params,id).then(function (rows){
        if (rows <= 0) {
            return Promise.reject('No Product Assignment Deleted');
        }
        else{
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Remove Product Assignment Success";
            result.ResponseData = rows;
            logger.info("\n Product Assignment Response : ", JSON.stringify(result));

            res.send(result);        
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Assignment Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}