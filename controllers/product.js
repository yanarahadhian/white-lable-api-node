var tbl_product = require('../models/tbl_product');
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
    var producttype = (req.query.producttype) ? req.query.producttype : 0
    var size = (req.query.size) ? req.query.size : 5
    var page = (req.query.page) ? req.query.page : 1
    var index = ""
    var maxindex = ""

    if(producttype !== 0){
        field += "product_type = ?"
        value.push(producttype);
        if (req.query.id || req.query.sku || req.query.product_name || req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if(req.query.id){
        field += "products.id = ?"
        value.push(req.query.id);
        if (req.query.sku || req.query.product_name || req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.sku) {
        field += "sku like ?"
        value.push("%" + req.query.sku + "%");
        if (req.query.product_name || req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.product_name) {
        field += "product_name like ?";
        value.push("%" + req.query.product_name + "%");
        if (req.query.operator || req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.operator) {
        field += "operator like ?";
        value.push("%" + req.query.operator + "%");
        if (req.query.biller_name || req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.biller_name) {
        field += "biller_name like ?";
        value.push("%" + req.query.biller_name + "%");
        if (req.query.start_date_time || req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.start_date_time) {
        field += "DATE(start_date_time) "+req.query.start_date_time.comparator+" ?"
        value.push(moment(req.query.start_date_time.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"));
        if (req.query.end_date_time || req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.end_date_time) {
        field += "DATE(end_date_time) "+req.query.end_date_time.comparator+" ?"
        value.push(moment(req.query.end_date_time.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"));
        if (req.query.harga_biller || req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.harga_biller) {
        field += "harga_biller like ?";
        value.push("%" + req.query.harga_biller + "%");
        if (req.query.fee_jpx || req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.fee_jpx) {
        field += "fee_jpx like ?";
        value.push("%" + req.query.fee_jpx + "%");
        if (req.query.fee_agent || req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.fee_agent) {
        field += "fee_agent like ?";
        value.push("%" + req.query.fee_agent + "%");
        if (req.query.fee_loper || req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.fee_loper) {
        field += "fee_loper like ?";
        value.push("%" + req.query.fee_loper + "%");
        if (req.query.enable_disable || req.query.network || req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.enable_disable) {
        field += "enable_disable like ?";
        value.push("%" + req.query.enable_disable + "%");
        if (req.query.network || rreq.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.network) {
        field += "network.network like ?";
        value.push("%" + req.query.network + "%");
        if (req.query.area || req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.area) {
        field += "areas.area like ?";
        value.push("%" + req.query.area + "%");
        if (req.query.agen_name || req.query.created_at)
            field += " AND ";
    }
    if (req.query.agen_name) {
        field += "agen_name like ?";
        value.push("%" + req.query.agen_name + "%");
        if (req.query.created_at)
            field += " AND ";
    }
    if (req.query.created_at) {
        field += "DATE(products.created_at) "+req.query.created_at.comparator+" ?"
        value.push(moment(req.query.created_at.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"));
    }

    if (req.query.orderName && req.query.orderBy) {
        orderBy = ` ORDER BY ${req.query.orderName} ${req.query.orderBy}`
    } else {
        orderBy =  " ORDER BY product_name ASC"
    }
    
    logger.info("\n Request Search Product : ", JSON.stringify(req.query));

    tbl_product.search(field, value, orderBy).then(function (rows) {
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
            result.ResponseDesc = "Search Product Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Response : ", JSON.stringify(result));
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

    var result = {}

    var data = {
        sku: req.body.sku,
        product_name: req.body.product_name,
        product_type: req.body.product_type,
        operator: req.body.operator,
        biller_host_id: req.body.biller_host_id,
        biller_account_id: req.body.biller_account_id,
        biller_name: req.body.biller_name,
        host_name: req.body.host_name,
        host_ip: req.body.host_ip,
        start_date_time: moment(req.body.start_date_time).format("YYYY-MM-DD HH:mm:ss"),
        end_date_time: moment(req.body.end_date_time).format("YYYY-MM-DD HH:mm:ss"),
        area: req.body.area,
        harga_biller: req.body.harga_biller,
        fee_jpx: req.body.fee_jpx,
        harga_agent: req.body.harga_agent,
        fee_agent: req.body.fee_agent,
        harga_jual: req.body.harga_jual,
        fee_loper: req.body.fee_loper,
        max_admin_loper: req.body.max_admin_loper,
        point_loper: req.body.point_loper,
        point_agent: req.body.point_agent,
        description: req.body.description,
        agen: req.body.agen,
        agen_name: req.body.agen_name,
        user_create: req.body.user_create,
        enable_disable: req.body.enable_disable,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }

    logger.info("\n Request Add Product : ", JSON.stringify(data));

    tbl_product.create(data)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Product Success";
            result.ResponseData = rows;
            logger.info("\n Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
};

exports.edit = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var id = req.body.id

    var params = {
        sku: req.body.sku,
        product_name: req.body.product_name,
        operator: req.body.operator,
        biller_host_id: req.body.biller_host_id,
        biller_account_id: req.body.biller_account_id,
        biller_name: req.body.biller_name,
        host_name: req.body.host_name,
        host_ip: req.body.host_ip,
        start_date_time: moment(req.body.start_date_time).format("YYYY-MM-DD HH:mm:ss"),
        end_date_time: moment(req.body.end_date_time).format("YYYY-MM-DD HH:mm:ss"),
        area: req.body.area,
        harga_biller: req.body.harga_biller,
        fee_jpx: req.body.fee_jpx,
        harga_agent: req.body.harga_agent,
        fee_agent: req.body.fee_agent,
        harga_jual: req.body.harga_jual,
        fee_loper: req.body.fee_loper,
        max_admin_loper: req.body.max_admin_loper,
        point_loper: req.body.point_loper,
        point_agent: req.body.point_agent,
        description: req.body.description,
        agen: req.body.agen,
        agen_name: req.body.agen_name,
        user_create: req.body.user_create,
        enable_disable: (req.body.enable_disable.toLowerCase() == "enable") ? "DISABLE" : "ENABLE" ,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }

    var result = {}

    logger.info("\n Request Edit Product : ", JSON.stringify(id));

    tbl_product.update(params,id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Product Success";
            result.ResponseData = rows;
            logger.info("\n Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.remove = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var id = req.body.id

    var result = {}

    logger.info("\n Request Remove Product : ", JSON.stringify(id));

    tbl_product.delete(id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Remove Product Success";
            result.ResponseData = rows;
            logger.info("\n Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Response : ", JSON.stringify(result));
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

    var id = req.body.id

    var params = {
        enable_disable: (req.body.enable_disable.toLowerCase() == "enable") ? "DISABLE" : "ENABLE" ,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }

    var result = {}

    logger.info("\n Request Update Status Product : ", JSON.stringify(id));

    tbl_product.update(params,id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Update Status Product Success";
            result.ResponseData = rows;
            logger.info("\n Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.checkExistingProduct = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var result = {}

    tbl_product.checkDuplicateProduct(req.body.sku, req.body.agen)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Product Exist";
            result.ResponseData = rows;
            logger.info("\n Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
};

exports.listProductType = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var result = {}

    tbl_product.getAllProductType()
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Get All Product Type Successful";
            result.ResponseData = rows;
            logger.info("\n Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}