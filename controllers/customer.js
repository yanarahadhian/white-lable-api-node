var tbl_customer = require('../models/tbl_customer');
var logger = require('../libraries/logger');
var moment = require("moment");
var auth = require('../controllers/auth')

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

    if (req.query.id) {
        field += "cs.id = ?";
        value.push(req.query.id);
        if (req.query.network || req.query.customer_id || req.query.namacustomer || req.query.id_pel || req.query.product || req.query.operator || req.query.phone_number)
            field += " AND ";
    }
    if (req.query.network) {
        field += "us.network = ?";
        value.push(req.query.network);
        if (req.query.customer_id || req.query.namacustomer || req.query.id_pel || req.query.product || req.query.operator || req.query.phone_number)
            field += " AND ";
    }
    if (req.query.customer_id) {
        field += "cs.customer_id = ?";
        value.push(req.query.customer_id);
        if (req.query.namacustomer || req.query.id_pel || req.query.product || req.query.operator || req.query.phone_number)
            field += " AND ";
    }
    if (req.query.namacustomer) {
        field += "cs.namacustomer like ?";
        value.push("%" + req.query.namacustomer + "%");
        if (req.query.id_pel || req.query.product || req.query.operator || req.query.phone_number)
            field += " AND ";
    }
    if (req.query.id_pel) {
        field += "cs.id_pel = ?";
        value.push(req.query.id_pel);
        if (req.query.product || req.query.operator || req.query.phone_number)
            field += " AND ";
    }
    if (req.query.product) {
        field += "cs.product like ?";
        value.push("%" + req.query.product + "%");
        if (req.query.operator || req.query.phone_number)
            field += " AND ";
    }
    if (req.query.operator) {
        field += "cs.operator like ?";
        value.push("%" + req.query.operator + "%");
        if (req.query.phone_number)
            field += " AND ";
    }
    if (req.query.phone_number) {
        field += "cs.phone_number like ?";
        value.push("%" + req.query.phone_number + "%");
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

    tbl_customer.search(field, value, orderBy).then(function (rows) {
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
            result.ResponseDesc = "Search Customer Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Customer Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Customer Response : ", JSON.stringify(result));
        res.send(result)
    
    })
}

exports.edit = function(req, res) {

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
        customer_id: req.body.customer_id,
        namacustomer: req.body.namacustomer,
        id_pel: req.body.id_pel,
        product: req.body.product,
        operator: req.body.operator,
        phone_number: req.body.phone_number,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Edit Customer : ", JSON.stringify(id));

    tbl_customer.update(params,id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Customer Success";
            result.ResponseData = rows;
            logger.info("\n Customer Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Customer Response : ", JSON.stringify(result));
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

    logger.info("\n Request Remove Customer : ", JSON.stringify(id));

    tbl_customer.update(params,id).then(function (rows){
        if (rows <= 0) {
            return Promise.reject('No Customer Deleted');
        }
        else{
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Remove Customer Success";
            result.ResponseData = rows;
            logger.info("\n Customer Response : ", JSON.stringify(result));

            res.send(result);        
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Customer Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}