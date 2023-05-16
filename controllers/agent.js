var tbl_agent = require('../models/tbl_agent');
var logger = require('../libraries/logger');
var sha256 = require("crypto-js/sha256");
var config = require('../config/config');
var auth = require('../controllers/auth');
var moment = require("moment");
var md5 = require("md5");
var indicative = require("indicative");

exports.search = function(req, res) {

    //verify username & json web token
    // auth.verify(req.body.token)
    // .catch(function(err){
    //     return Promise.reject('Auth Failed');
    // })

    var field = "";
    var value = [];
    var result = {}
    var size = (req.query.size) ? req.query.size : 5
    var page = (req.query.page) ? req.query.page : 1
    var index = ""
    var maxindex = ""

    if (req.body.username) {
        field += "users.username like ?"
        value.push("%" + req.body.username.value + "%");
        if (req.body.name || req.body.email || req.body.area)
            field += " AND ";
    }
    if (req.body.name) {
        field += "users.name like ?"
        value.push("%" + req.body.name.value + "%");
        if (req.body.email || req.body.area)
            field += " AND ";
    }
    if (req.body.email) {
        field += "users.email like ?"
        value.push("%" + req.body.email.value + "%");
        if (req.body.area)
            field += " AND ";
    }
    if (req.body.area) {
        field += "areas.area like ?";
        value.push("%" + req.body.area.value + "%");
        if (req.body.phone_number)
            field += " AND "
    }
    if (req.body.phone_number) {
        field += "users.phone_number like ?"
        value.push(req.body.phone_number.value + "%")
        if (req.body.status)
            field += " AND "
    }
    if (req.body.status) {
        field += "users.status like ?"
        value.push("%" + req.body.status.value + "%")
    }

    //only search active agents
    if (!field){
        field += " users.active = ?";    
    } else {
        field += " AND users.active = ?";    
    }
    value.push(1);

    //only search agents groups
    if (!field){
        field += " users.role = ?";    
    } else {
        field += " AND users.role = ?";    
    }
    value.push(3);

    if (req.query.name) {
        orderName = " ORDER BY " + req.query.name;
        if (req.query.orderBy) {
            orderName += " " + req.query.orderBy;
        } else {
            orderName += " ASC";
        }
    }

        tbl_agent.searchAgent(field, value, orderName).then(function (rows) {
            if (rows.length == 0) {
                return Promise.reject('No rows');
            } else {

                total = rows.length

                if(page!=="all"){
                    index = (page-1)*size
                    maxindex = (page*size)
                    rows = rows.slice(index,maxindex)   
                }                

                result.ResponseCode = "00";
                result.ResponseDesc = "Search Loper Successful";
                result.ResponseData = rows;
                result.ResponseTotalResult = total;
                logger.info("\n Loper Response : ", JSON.stringify(result));

                res.send(result);

            }
        }).catch(function (errors) {

            result.ResponseCode = "99";
            result.ResponseDesc = errors;

            logger.info("\n Loper Response : ", JSON.stringify(result));
            res.send(result)
       
        })
}

exports.list = function(req, res) {

    var result = {}
    var size = (req.query.size) ? req.query.size : 5
    var page = (req.query.page) ? req.query.page : 1
    var index = ""
    var maxindex = ""
    
    //orderBy value must be ASC or DESC
    if (req.query.orderBy) {
        orderOption = " ORDER BY users.username " + req.query.orderBy;
    } else {
        orderOption = " ORDER BY users.username ASC";
    }

    tbl_agent.getAllAgentOrderBy(orderOption).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            if(page!=="all"){
                index = (page-1)*size
                maxindex = (page*size)
                rows = rows.slice(index,maxindex)   
            }   

            result.ResponseCode = "00";
            result.ResponseDesc = "Get All Agent Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Agent Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = errors;

        logger.info("\n Agent Response : ", JSON.stringify(result));
        res.send(result)
       
    })
    

}

exports.listUpline = function(req, res) {

    var username = req.body.username
    var area = req.body.area
    var result = {}

    logger.info("\n Request List Uplines : ", JSON.stringify(username));

    tbl_agent.getUplines(area,username)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = "00";
            result.ResponseDesc = "Get All Upline Successful";
            result.ResponseData = rows;
            logger.info("\n Agent Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = errors;

        logger.info("\n Agent Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.listByNetwork = function(req, res) {

    var network = req.params.id
    var result = {}

    logger.info("\n Request List By Network : ", JSON.stringify(network));

    var params = {
        'network': network
    }

    tbl_agent.listByParam(params)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = "00";
            result.ResponseDesc = "Get Agent By Network "+network+" Successful";
            result.ResponseData = rows;
            logger.info("\n Agent Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = errors;

        logger.info("\n Agent Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.view = function(req, res) {

    var result = {}

    var username = req.params.username

    logger.info("\n Request View Agent : ", JSON.stringify(username));

    tbl_agent.getAgentDetails(username)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = "00";
            result.ResponseDesc = "Get Agent ID "+username+" Successful";
            result.ResponseData = rows;
            logger.info("\n Agent Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = errors;

        logger.info("\n Agent Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.add = function(req, res) {

    //verify json web token
    // auth.verify(req.body.token)
    // .catch(function(err){
    //     return Promise.reject('Auth Failed');
    // })

    var hashPassword = md5(md5(config.default_password).substring(0,16)+config.salt_key).substring(0,16)

    var data = {
        username: req.body.username,
        name: req.body.name,
        password: hashPassword,
        alamat: req.body.alamat,
        email: req.body.email,
        phone_number: req.body.phone_number,
        network: req.body.network,
        area: req.body.area,
        upline: req.body.upline,
        status: req.body.status,
        noktp: req.body.noktp,
        npwp: req.body.npwp,
        siup: req.body.siup,
        rekening_bank: req.body.rekening_bank,
        nama_bank: req.body.nama_bank,
        role: 3,
        active: 1,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}

    var rules = {
        'username'      : 'number|required',
        'name'          : 'string|required',
        'password'      : 'required',
        'email'         : 'string|required',
        'phone_number'  : 'number|required',
        'network'       : 'number|required',
        'area'          : 'number|required',
        'upline'        : 'number|required',
        'rekening_bank' : 'number|required',
        'nama_bank'     : 'string|required'     
    }

    logger.info("\n Request Add Agent : ", JSON.stringify(data));

    indicative.validate(data,rules)
    .then(function(){
        return tbl_agent.getAgentDetails(data.username)
    })
    .then(function (user_rows) {
        if(user_rows.length > 0){
            return Promise.reject('Username already exists');
        }

        return tbl_agent.createAgent(data)
    })
    .then(function (agent_rows) {
        if (agent_rows.affectedRows == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = "00";
            result.ResponseDesc = "Create Agent Success";
            result.ResponseData = agent_rows;
            logger.info("\n Agent Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = errors;

        logger.info("\n Agent Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.edit = function(req, res) {

    //verify json web token
    // auth.verify(req.body.token)
    // .catch(function(err){
    //     return Promise.reject('Auth Failed');
    // })

    var username = req.body.username
    var hashPassword = (req.body.hasOwnProperty('password')) ? (req.body.password !== "") ? md5(md5(req.body.password).substring(0,16)+config.salt_key).substring(0,16) : "" : ""

    var params = {
        'name': req.body.name,
        'phone_number': req.body.phone_number,
        'network': req.body.network,
        'area': req.body.area,
        'alamat': req.body.alamat,
        'status': (req.body.status.toLowerCase() === "active") ? "Active" : "Inactive",
        'noktp': req.body.noktp,
        'npwp': req.body.npwp,
        'siup': req.body.siup,
        'rekening_bank': req.body.rekening_bank,
        'nama_bank': req.body.nama_bank,
        'upline': req.body.upline,
        'updated_at': moment().format("YYYY-MM-DD HH:mm:ss")
    }

    if(hashPassword !== ""){
        params.password = hashPassword
    }

    var result = {}

    var rules = {
        'name'          : 'string|required',
        'phone_number'  : 'number|required',
        'network'       : 'number|required',
        'area'          : 'number|required',
        'upline'        : 'number|required',
        'rekening_bank' : 'number|required',
        'nama_bank'     : 'string|required'     
    }

    logger.info("\n Request Edit Agent : ", JSON.stringify(params));

    indicative.validate(params,rules)
    .then(function(){
        return tbl_agent.updateAgent(params,username)
    })
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = "00";
            result.ResponseDesc = "Edit Agent Success";
            result.ResponseData = rows;
            logger.info("\n Agent Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = (errors[0].sqlMessage) ? errors[0].sqlMessage : errors[0].message;

        logger.info("\n Agent Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.updateStatus = function(req, res) {

    //verify json web token
    // auth.verify(req.body.token)
    // .catch(function(err){
    //     return Promise.reject('Auth Failed');
    // })

    var username = req.body.username

    var result = {}

    logger.info("\n Request Update Status Agent : ", JSON.stringify(username));

    tbl_agent.getAgentDetails(username)
    .then(function (details) {
        if (details.length <= 0) {
            return Promise.reject('No username found');
        } else {
            var status = (details[0].status.toLowerCase() === "active") ? "Inactive" : "Active"
            var params = {
                'status': status,
                'updated_at': moment().format("YYYY-MM-DD HH:mm:ss")
            }
            return tbl_agent.updateAgent(params,username)
        }
    })
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = "00";
            result.ResponseDesc = "Update Status Agent Success";
            result.ResponseData = rows;
            logger.info("\n Agent Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = errors;

        logger.info("\n Agent Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.resetPassword = function(req, res) {

    //verify json web token
    // auth.verify(req.body.token)
    // .catch(function(err){
    //     return Promise.reject('Auth Failed');
    // })

    var username = req.body.username

    var hashPassword = md5(md5(config.default_password).substring(0,16)+config.salt_key).substring(0,16)

    var params = {
        password: hashPassword
    }

    var result = {}

    logger.info("\n Request Reset Password : ", JSON.stringify(username));

    tbl_agent.updateAgent(params, username)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = "00";
            result.ResponseDesc = "Reset Password Success";
            result.ResponseData = rows;
            logger.info("\n Reset Password Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = errors;

        logger.info("\n Reset Password Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.remove = function(req, res) {

    var username = req.body.username

    var params = {
        'status': 'Inactive',
        'active': 0,
        'deleted_at': moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}

    logger.info("\n Request Remove Agent : ", JSON.stringify(username));

    tbl_agent.updateAgent(params,username)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows deleted');
        } else {
            
            result.ResponseCode = "00";
            result.ResponseDesc = "Remove Agent Success";
            result.ResponseData = rows;
            logger.info("\n Agent Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "99";
        result.ResponseDesc = errors;

        logger.info("\n Agent Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}