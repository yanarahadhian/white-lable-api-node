var tbl_role = require('../models/tbl_role');
var logger = require('../libraries/logger');
var sha256 = require("crypto-js/sha256");
var config = require('../config/config');
var moment = require("moment");
var auth = require('../controllers/auth');

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
    var orderBy = ""

    if (req.query.id) {
        field += "id = ?"
        value.push(req.query.id)
        if (req.query.name || req.query.description || req.query.level  || req.query.level_exception || req.query.role_exception)
            field += " AND ";
    }
    if (req.query.name) {
        field += "name like ?"
        value.push('%'+req.query.name+'%')
        if (req.query.description || req.query.level  || req.query.level_exception || req.query.role_exception)
            field += " AND ";
    }
    if (req.query.description) {
        field += "description like ?";
        value.push('%'+req.query.description+'%')
        if (req.query.level  || req.query.level_exception || req.query.role_exception)
            field += " AND ";
    }
    if (req.query.level) {
        field += "level > ?";
        value.push(req.query.level)
        if (req.query.level_exception || req.query.role_exception) {
            field += " AND "
        }
    }
    if (req.query.level_exception) {
        field += "groups.level != ?"
        value.push(req.query.level_exception)
        if (req.query.role_exception) {
            field += " AND "
        }
    }
    if (req.query.role_exception) {
        field += "groups.id NOT IN (?)"
        value.push(req.query.role_exception)
    }

    if (req.query.orderName && req.query.orderBy) {
        orderBy = ` ORDER BY ${req.query.orderName} ${req.query.orderBy}`
    } else {
        orderBy =  " ORDER BY name ASC"
    }

    tbl_role.search(field, value, orderBy)
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

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Role Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Role Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Role Response : ", JSON.stringify(result));
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
        name: req.body.name,
        description: req.body.description,
        level: req.body.level,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Add Role : ", JSON.stringify(data));

    if (!field){
        field += " groups.name = ?";    
    }
    value.push(data.name);

    tbl_role.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Role already exists');
        }

        return tbl_role.createRole(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Role Success";
            result.ResponseData = rows;
            logger.info("\n Role Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Role Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.edit = function(req, res) {

    let id = req.query.id
    let oldName = req.body.oldName
    let newName = req.body.name
    let result = {}
    let token = (req.headers.token) ? req.headers.token : null
    let params = {
        name: req.body.name,
        description: req.body.description,
        level: req.body.level,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    logger.info("\n Request Edit Role : ", JSON.stringify(id));

    // find equal name to be replace, if there is no match with newName proceed edit request
    tbl_role.searchReplacementName(oldName, newName)
    .then(function (duplicateRows) {
        // if response length higher than 0, withdraw edit request
        if (duplicateRows.length > 0) {
            return Promise.reject('Role already exists!')
        } else {
            return tbl_role.updateRole(params, id)
        }
    })
    .then(function (updateRows) {
        if (updateRows <= 0) {
            return Promise.reject('No rows edited!');
        } else {
            
            result.ResponseCode = auth_resp.status
            result.ResponseDesc = "Edit Role Success"
            result.ResponseData = updateRows
            
            logger.info("\n Role Response : ", JSON.stringify(result))

            res.send(result);
        }
    })
    .catch(function (err) {
    
        result.ResponseCode = "500";

        if (err.sqlMessage) {
            result.ResponseDesc = err.sqlMessage
        } else {
            result.ResponseDesc = err;
        }

        logger.info("\n Role Response : ", JSON.stringify(result));
    
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

    let params = {
        'deleted_at': moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Remove Role : ", JSON.stringify(id))

    tbl_role.checkUsedRole(id)
    .then(function (rows) {
        if (rows.length > 0) {
            return Promise.reject('This Role is being used');
        } else {
            
            tbl_role.updateRole(params,id).then(function (rows){
                if (rows <= 0) {
                    return Promise.reject('No Role Deleted');
                }
                else{
                    result.ResponseCode = auth_resp.status;
                    result.ResponseDesc = "Remove Role Success";
                    result.ResponseData = rows;
                    logger.info("\n Role Response : ", JSON.stringify(result));

                    res.send(result);        
                }
            })
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Role Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.viewRights = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var result = {}

    var id = req.params.id

    logger.info("\n Request View Role Rights : ", JSON.stringify(id));

    tbl_role.getRoleRights(id)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Get Role ID "+id+" Successful";
            result.ResponseData = rows;
            logger.info("\n Role Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Role Response : ", JSON.stringify(result))
        res.send(result)
    })
}

exports.updateRights = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var result = {}

    var id = req.body.id
    var data = req.body.checked

    logger.info("\n Request Update Role Rights : ", JSON.stringify(data));

    tbl_role.insertRoleRights(id,data)
    .then(function(insertedRows){
        if (insertedRows.length < 0) {
            return Promise.reject('No rows inserted');
        } else {
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Update Role ID "+id+" Successful. Logout the User to make changes effect";
            result.ResponseData = insertedRows;
            logger.info("\n Role Response : ", JSON.stringify(result));

            res.send(result);
        }
    })
    .catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Role Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}