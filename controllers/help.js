var tbl_help = require('../models/tbl_help');
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

    if (req.query.id) {
        field += "bt.id = ?"
        value.push(req.query.id);
        if (req.query.user || req.query.network_id || req.query.network || req.query.area || req.query.position || req.query.device_token || req.query.hardware_id || req.query.judul || req.query.questions || req.query.status || req.query.gmt || req.query.created_at )
            field += " AND ";
    }
    if (req.query.user) {
        field += "bt.user like ?"
        value.push("%" + req.query.user + "%");
        if (req.query.network_id || req.query.network || req.query.area || req.query.position || req.query.device_token || req.query.hardware_id || req.query.judul || req.query.questions || req.query.status || req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.network_id) {
        field += "us.network like ?"
        value.push("%" + req.query.network_id + "%");
        if (req.query.network || req.query.area || req.query.position || req.query.device_token || req.query.hardware_id || req.query.judul || req.query.questions || req.query.status || req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.network) {
        field += "net.network like ?"
        value.push("%" + req.query.network + "%");
        if (req.query.area || req.query.position || req.query.device_token || req.query.hardware_id || req.query.judul || req.query.questions || req.query.status || req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.city) {
        field += "ar.area like ?"
        value.push("%" + req.query.city + "%");
        if (req.query.position || req.query.device_token || req.query.hardware_id || req.query.judul || req.query.questions || req.query.status || req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.position) {
        field += "bt.position like ?"
        value.push("%" + req.query.position + "%");
        if (req.query.device_token || req.query.hardware_id || req.query.judul || req.query.questions || req.query.status || req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.devicetoken) {
        field += "bt.devicetoken like ?"
        value.push("%" + req.query.devicetoken + "%");
        if (req.query.hardware_id || req.query.judul || req.query.questions || req.query.status || req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.hardware_id) {
        field += "bt.hardware_id like ?"
        value.push("%" + req.query.hardware_id + "%");
        if (req.query.judul || req.query.questions || req.query.status || req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.judul) {
        field += "bt.judul like ?"
        value.push("%" + req.query.judul + "%");
        if (req.query.questions || req.query.status || req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.questions) {
        field += "bt.questions like ?"
        value.push("%" + req.query.questions + "%");
        if (req.query.status || req.query.gmt || req.query.created_at) 
            field += " AND ";
    }
    if (req.query.status) {
        field += "bt.status like ?"
        value.push("%" + req.query.status + "%");
        if (req.query.gmt || req.query.created_at)
            field += " AND ";
    }
    if (req.query.gmt) {
        field += "bt.gmt like ?"
        value.push("%" + req.query.gmt + "%");
        if (req.query.created_at)
            field += " AND ";
    }
    // if (req.query.gmt) {
    //     req.query.gmt = JSON.parse(req.query.gmt)
    //     field += "DATE(bt.gmt) "+req.query.gmt.comparator+" ?"
    //     value.push(moment(req.query.gmt.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"))
    //     if (req.query.created_at)
    //         field += " AND ";
    // }
    if (req.query.created_at) {
        req.query.created_at = JSON.parse(req.query.created_at)
        field += "DATE(bt.created_at) "+req.query.created_at.comparator+" ?"
        value.push(moment(req.query.created_at.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"))
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

    logger.info("\n Request for Search Help : " + JSON.stringify(req.query));

    tbl_help.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No Help rows');
        } else {

            total = rows.length

            if(page!=="all"){
                index = (page-1)*size
                maxindex = (page*size)
                rows = rows.slice(index,maxindex)   
            }                

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Help Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Help Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Help Response : ", JSON.stringify(result));
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
        status: req.body.status,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Edit Customer : ", JSON.stringify(id));

    tbl_help.update(params,id)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } 

        var param_detail = {
            status: req.body.status,
            note: req.body.note,
            userid: req.body.user_id,
            user_name: req.body.user_name,
            bantuan_id: id,
            summary: '',
            created_at: moment().format("YYYY-MM-DD HH:mm:ss")
        }

        return tbl_help.createDetail(param_detail)

    }).then(function (details) {
        if (details.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Help Success";
            
            logger.info("\n Help Response : ", JSON.stringify(result));

            res.send(result);

        }
            
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Help Response : ", JSON.stringify(result));
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

    logger.info("\n Request Remove Help : ", JSON.stringify(id));

    tbl_help.update(params,id).then(function (rows){
        if (rows <= 0) {
            return Promise.reject('No Help Deleted');
        }
        else{
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Remove Help Success";
            result.ResponseData = rows;
            logger.info("\n Help Response : ", JSON.stringify(result));

            res.send(result);        
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Help Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.details = function (req, res) {

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

    logger.info("\n Request For Help Details : " + JSON.stringify(req.params));

    if (!field){
        field += " bt.id = ?";    
    }
    value.push(param_id);

    tbl_help.search(field, value, orderBy)
    .then(function (help) {
        if (help.length == 0) {
            return Promise.reject('Help does not exist');
        } else {
            result.ResponseData = help[0];

            field = "";
            value = [];
            orderBy = "";

            if (!field){
                field += " bantuan_id = ?";    
            }
            value.push(help[0].id);

            return tbl_help.searchDetails(field, value, orderBy)

        }
    }).then(function (helpDetails) {

        result.ResponseCode = auth_resp.status;
        result.ResponseDesc = "Get Help Details Success";
        result.ResponseData.Details = helpDetails;

        logger.info("\n Response For Help Details : ", JSON.stringify(result));
        res.send(result);

    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;
        logger.info("\n Response For Help Details : ", JSON.stringify(result));
        res.send(result);

    })

};