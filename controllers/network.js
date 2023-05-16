var tbl_network = require('../models/tbl_network');
var logger = require('../libraries/logger');
var sha256 = require("crypto-js/sha256");
var config = require('../config/config');
var auth = require('../controllers/auth')
var moment = require("moment");

exports.search = function(req, res) {

    var field = "";
    var value = [];
    var result = {}
    var size = (req.query.size) ? req.query.size : 5
    var page = (req.query.page) ? req.query.page : 1
    var index = ""
    var maxindex = ""
    let token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    // GET ACTIVE NETWORKS ONLY
    field += "network.deleted_at IS NULL"

    if (req.query.network || req.query.sender_name || req.query.id) {
        field += " AND "
    }

    // FIELD MANAGEMENT

    if (req.query.id) {
        field += 'network.id = ?'
        value.push(req.query.id)
        if (req.query.network || req.query.sender_name) {
            field += ' AND '
        }
    }

    if (req.query.network) {
        field += "network.network like ?"
        value.push("%" + req.query.network + "%");
        if (req.query.sender_name)
            field += " AND ";
    }

    if (req.query.sender_name) {
        field += "senders.sender like ?";
        value.push("%" + req.query.sender_name + "%");
    }

    // SORT MANAGEMENT
    if (req.query.orderName) {
        field += ` ORDER BY ${req.query.orderName}`

        if (req.query.orderBy) {
            field += ` ${ req.query.orderBy }`
        } else {
            field += " ASC"
        }
    }

    tbl_network.getNetworks(field, value)
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

            result.ResponseCode = "200";
            result.ResponseDesc = "Search Network Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Network Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "400";
        result.ResponseDesc = errors;

        logger.info("\n Network Response : ", JSON.stringify(result));
        res.send(result)

    })
}

exports.add = function(req, res) {
    
    let result = {}
    let token = (req.headers.token) ? req.headers.token : null
    let data = {
        network: req.body.network_name,
        sender_id: req.body.sender_id,
        sender_email : (req.body.sender_email) ? (req.body.sender_email) : ('do-not-reply@jpx.id'),
        url_website : (req.body.url_website) ? (req.body.url_website) : ('https://agan.id'),
        themes_color : (req.body.themes_color) ? (req.body.themes_color) : ('#1559a7'),
        header_font_color : (req.body.header_font_color) ? (req.body.header_font_color) : ('#f7f7f7'),
        logo : (req.body.logo) ? (req.body.logo) : (null),
        banner : (req.body.banner) ? (req.body.banner) : (null),
        splash_screen : (req.body.splash_screen) ? (req.body.splash_screen) : (null),
        dashboard_logo : (req.body.dashboard_logo) ? (req.body.dashboard_logo) : (null),
        favicon : (req.body.favicon) ? (req.body.favicon) : (null),
        subscription : (req.body.subscription_model_id) ? ('TRUE') : ('FALSE'),
        minimum_balance : (req.body.minimum_balance) ? (Number(req.body.minimum_balance)) : (0),
        subscription_model_id : (req.body.subscription_model_id) ? (parseInt(req.body.subscription_model_id)) : (null),
        call_center : (req.body.call_center) ? (req.body.call_center) : (req.body.call_center),
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }

    //VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }
    
    logger.info("\n Request Add Network : ", JSON.stringify(data));

    tbl_network.getNetworkDetailsByName(data.network)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Network is existed, please use another entry on field Name');
        }

        return tbl_network.createNetwork(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = "200";
            result.ResponseDesc = "Create Network Success";
            result.ResponseData = rows;
            logger.info("\n network Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "400";
        result.ResponseDesc = errors;

        logger.info("\n Network Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.edit = function(req, res) {

    let id = req.query.id
    let token = (req.headers.token) ? req.headers.token : null
    let result = {}

    let params = {
        network: req.body.network_name,
        sender_id: req.body.sender_id,
        sender_email : (req.body.sender_email) ? (req.body.sender_email) : ('do-not-reply@jpx.id'),
        url_website : (req.body.url_website) ? (req.body.url_website) : ('https://agan.id'),
        themes_color : (req.body.themes_color) ? (req.body.themes_color) : ('#1559a7'),
        header_font_color : (req.body.header_font_color) ? (req.body.header_font_color) : ('#f7f7f7'),
        logo : (req.body.logo) ? (req.body.logo) : (null),
        banner : (req.body.banner) ? (req.body.banner) : (null),
        splash_screen : (req.body.splash_screen) ? (req.body.splash_screen) : (null),
        dashboard_logo : (req.body.dashboard_logo) ? (req.body.dashboard_logo) : (null),
        favicon : (req.body.favicon) ? (req.body.favicon) : (null),
        subscription : (req.body.subscription_model_id) ? ('TRUE') : ('FALSE'),
        minimum_balance : (req.body.minimum_balance) ? (Number(req.body.minimum_balance)) : (0),
        subscription_model_id : (req.body.subscription_model_id) ? (parseInt(req.body.subscription_model_id)) : (null),
        call_center : (req.body.call_center) ? (req.body.call_center) : (req.body.call_center),
        upline : (req.body.upline) ? (req.body.upline) : (null),
        'updated_at': moment().format("YYYY-MM-DD HH:mm:ss")
    }

    //VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    logger.info("\n Request Edit Network : ", JSON.stringify(id));

    // search Network detail
    let field = `network.id = ${id}`

    tbl_network.getNetworks(field)
    .then((resNetworkDetail) => {
        if (resNetworkDetail.length === 1) {
            let oldName = resNetworkDetail[0].network
            let newName = params.network

            return tbl_network.getUnusedNetworkEdit(oldName, newName)
        } else {
            return Promise.reject('Cannot find Network Details')
        }
    })
    .then((resUnusedNetworkEdit) => {
        if (resUnusedNetworkEdit.length > 0) {
            return Promise.reject('Network Name already exists!')
        } else {
            return tbl_network.updateNetwork(params, id)
        }
    })
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = "200";
            result.ResponseDesc = "Edit Network Success";
            result.ResponseData = rows;
            logger.info("\n Network Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "400";
        result.ResponseDesc = errors;

        logger.info("\n Network Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.remove = function(req, res) {

    let id = req.query.id
    let token = (req.headers.token) ? req.headers.token : null
    let result = {}

    //VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    var params = {
        'deleted_at': moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Remove Network : ", JSON.stringify(id))

    tbl_network.checkUsedNetwork(id)
    .then(function (rows) {
        if (rows.length > 0) {
            return Promise.reject('This Network is being used');
        } else {
            
            tbl_network.updateNetwork(params,id).then(function (rows){
                if (rows <= 0) {
                    return Promise.reject('No Network Deleted');
                }
                else{
                    result.ResponseCode = "200";
                    result.ResponseDesc = "Remove Network Success";
                    result.ResponseData = rows;
                    logger.info("\n Network Response : ", JSON.stringify(result));

                    res.send(result);        
                }
            })
        }
    }).catch(function (errors) {

        result.ResponseCode = "401";
        result.ResponseDesc = errors;

        logger.info("\n Network Response : ", JSON.stringify(result));
        res.send(result)
    })
}