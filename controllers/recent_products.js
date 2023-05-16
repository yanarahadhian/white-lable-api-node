var tbl_recent_product = require('../models/tbl_recent_product');
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
        field += "pm.id = ?"
        value.push(req.query.id);
        if (req.query.template || req.query.scheme || req.query.sku || req.query.product_type_id || req.query.product_name || req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.template) {
        field += "pm.template like ?"
        value.push("%" + req.query.template + "%");
        if (req.query.scheme || req.query.sku || req.query.product_type_id || req.query.product_name || req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.scheme) {
        field += "pm.scheme like ?"
        value.push("%" + req.query.scheme + "%");
        if (req.query.sku || req.query.product_type_id || req.query.product_name || req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.sku) {
        field += "pm.sku = ?"
        value.push(req.query.sku);
        if (req.query.product_type_id || req.query.product_name || req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if(req.query.product_type){
        field += "pt.product_type like ?"
        value.push("%" + req.query.product_type + "%");
        if (req.query.product_name || req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.product_name) {
        field += "pm.product_name like ?";
        value.push("%" + req.query.product_name + "%");
        if (req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.operator) {
        field += "pm.operator like ?";
        value.push("%" + req.query.operator + "%");
        if (req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.biller_name) {
        field += "bl.name like ?";
        value.push("%" + req.query.biller_name + "%");
        if (req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.start_date_time) {
        req.query.start_date_time = JSON.parse(req.query.start_date_time)
        field += "DATE(pm.start_date_time) "+req.query.start_date_time.comparator+" ?"
        value.push(moment(req.query.start_date_time.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"));
        if (req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.end_date_time) {
        req.query.end_date_time = JSON.parse(req.query.end_date_time)
        field += "DATE(pm.end_date_time) "+req.query.end_date_time.comparator+" ?"
        value.push(moment(req.query.end_date_time.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"));
        if (req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.harga_biller) {
        field += "pm.harga_biller like ?";
        value.push("%" + req.query.harga_biller + "%");
        if (req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.fee_jpx) {
        field += "pm.fee_jpx like ?";
        value.push("%" + req.query.fee_jpx + "%");
        if (req.query.fee_agent || req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.fee_agent) {
        field += "pm.fee_agent like ?";
        value.push("%" + req.query.fee_agent + "%");
        if (req.query.fee_loper || req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.fee_loper) {
        field += "pm.fee_loper like ?";
        value.push("%" + req.query.fee_loper + "%");
        if (req.query.status || req.query.created_at)
            field += " AND ";
    }
    if (req.query.status) {
        field += "pm.status like ?";
        value.push("%" + req.query.status + "%");
        if (req.query.created_at)
            field += " AND ";
    }
    if (req.query.created_at) {
        req.query.created_at = JSON.parse(req.query.created_at)
        field += "DATE(pm.created_at) "+req.query.created_at.comparator+" ?"
        value.push(moment(req.query.created_at.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"));
    }

    if (req.query.orderName && req.query.orderBy) {
        orderBy = ` ORDER BY ${req.query.orderName} ${req.query.orderBy}`
    } else {
        orderBy =  " ORDER BY product_name ASC"
    }
    
    logger.info("\n Request Search Recent Product : ", JSON.stringify(req.query));

    tbl_recent_product.search(field, value, orderBy).then(function (rows) {
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
            result.ResponseDesc = "Search Recent Product Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Recent Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Recent Product Response : ", JSON.stringify(result));
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
        template: req.body.template,
        scheme: req.body.scheme,
        sku: req.body.sku,
        product_type_id: req.body.product_type_id,
        product_name: req.body.product_name,
        operator: req.body.operator,
        biller_host_id: req.body.biller_host_id,
        start_date_time: moment(req.body.start_date_time).format("YYYY-MM-DD HH:mm:ss"),
        end_date_time: moment(req.body.end_date_time).format("YYYY-MM-DD HH:mm:ss"),
        harga_biller: req.body.harga_biller,
        fee_jpx: req.body.fee_jpx,
        fee_agent: req.body.fee_agent,
        fee_loper: req.body.fee_loper,
        selling_price: req.body.selling_price,
        max_admin: req.body.max_admin,
        point_loper: req.body.point_loper,
        point_agent: req.body.point_agent,
        description: req.body.description,
        user_create: req.body.user_create,
        status: req.body.status,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }
    
    logger.info("\n Request Add Recent Product : ", JSON.stringify(data));

    if (!field){
        field += " pm.template = ?";    
    }
    value.push(data.template);

    if (field){
        field += " AND pm.sku = ?";    
    }
    value.push(data.sku);

    tbl_recent_product.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Template or SKU Product already exists');
        }

        return tbl_recent_product.create(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Product Success";
            result.ResponseData = rows;
            logger.info("\n Recent Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Recent Product Response : ", JSON.stringify(result));
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
        template: req.body.template,
        scheme: (req.body.scheme === "Fee Based") ? 0 : 1,
        sku: req.body.sku,
        product_type_id: req.body.product_type_id,
        product_name: req.body.product_name,
        operator: req.body.operator,
        biller_host_id: req.body.biller_host_id,
        start_date_time: moment(req.body.start_date_time).format("YYYY-MM-DD HH:mm:ss"),
        end_date_time: moment(req.body.end_date_time).format("YYYY-MM-DD HH:mm:ss"),
        harga_biller: req.body.harga_biller,
        fee_jpx: req.body.fee_jpx,
        fee_agent: req.body.fee_agent,
        fee_loper: req.body.fee_loper,
        selling_price: req.body.selling_price,
        max_admin: req.body.max_admin,
        point_loper: req.body.point_loper,
        point_agent: req.body.point_agent,
        description: req.body.description,
        user_create: req.body.user_create,
        status: req.body.status,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }

    var result = {}

    logger.info("\n Request Edit Recent Product : ", JSON.stringify(id));

    tbl_recent_product.update(params,id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Product Success";
            result.ResponseData = rows;
            logger.info("\n Recent Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Recent Product Response : ", JSON.stringify(result));
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

    var field = "";
    var value = [];
    var orderBy = "";
    var id = req.query.id
    var params = {
        deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}

    logger.info("\n Request Remove Recent Product : ", JSON.stringify(id));

    if (!field){
        field += " pa.id = ?";    
    }
    value.push(id);

    tbl_product_assignment.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject("Product can't be deleted, already on Assignment !");
        }

        return tbl_recent_product.update(params,id)
    })

    .then(function (rows){
        if (rows <= 0) {
            return Promise.reject('No Product Deleted');
        }
        else{
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Remove Product Success";
            result.ResponseData = rows;
            logger.info("\n Recent Product Response : ", JSON.stringify(result));

            res.send(result);        
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Recent Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.updateStatus = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var id = req.params.id
    var status = (req.body.status === "ENABLE") ? "DISABLE" : "ENABLE"
    var params = {
        'status': status,
        'updated_at': moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}

    logger.info("\n Request Update Status Product : ", JSON.stringify(id));

    tbl_recent_product.update(params,id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Update Status Product Success";
            result.ResponseData = rows;
            logger.info("\n Recent Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Recent Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.listProductType = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var result = {}

    tbl_recent_product.getAllProductType()
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Get All Product Type Successful";
            result.ResponseData = rows;
            logger.info("\n Recent Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Recent Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}