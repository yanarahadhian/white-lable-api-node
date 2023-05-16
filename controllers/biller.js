var tbl_biller = require('../models/tbl_biller');
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
        field += "id = ?"
        value.push(req.query.id);
        if (req.query.account_id || req.query.name || req.query.host_name || req.query.host_ip)
            field += " AND ";
    }
    if (req.query.account_id) {
        field += "account_id like ?"
        value.push("%" + req.query.account_id + "%");
        if (req.query.name || req.query.host_name || req.query.host_ip)
            field += " AND ";
    }
    if (req.query.name) {
        field += "name like ?";
        value.push("%" + req.query.name + "%");
        if (req.query.host_name || req.query.host_ip)
            field += " AND ";
    }
    if (req.query.host_name) {
        field += "host_name like ?";
        value.push("%" + req.query.host_name + "%");
        if (req.query.host_ip)
            field += " AND ";
    }
    if (req.query.host_ip) {
        field += "host_ip like ?";
        value.push("%" + req.query.host_ip + "%");
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

    tbl_biller.search(field, value, orderBy).then(function (rows) {
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
            result.ResponseDesc = "Search Biller Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Biller Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Biller Response : ", JSON.stringify(result));
        res.send(result)
    
    })
}

exports.add = function(req, res) {

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
    var result = {}
    var data = {
        account_id: req.body.account_id,
        name: req.body.name,
        host_name: req.body.host_name,
        host_ip: req.body.host_ip,
        description: req.body.description,
        topup_code: req.body.topup_code,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }


    logger.info("\n Request Add Biller : ", JSON.stringify(data));

    if (data.account_id && data.name) {
        field += " biller_hosts.account_id = ? OR biller_hosts.name = ?"
        value.push(data.account_id, data.name)
    }

    tbl_biller.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Biller already exists');
        }

        return tbl_biller.create(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Biller Success";
            result.ResponseData = rows;
            logger.info("\n biller Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Biller Response : ", JSON.stringify(result));
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
        account_id: req.body.account_id,
        name: req.body.name,
        host_name: req.body.host_name,
        host_ip: req.body.host_ip,
        description: req.body.description,
        topup_code: req.body.topup_code,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    let fieldGetDetails = `id = ?`
    let valueGetDetails = [ id ]
    let orderGetDetails = ''

    logger.info("\n Request Edit Biller : ", JSON.stringify(id));

    tbl_biller.search(fieldGetDetails, valueGetDetails, orderGetDetails)
    .then((resBillerDetail) => {
        if (resBillerDetail.length === 1) {
            let oldName = resBillerDetail[0].name
            let newName = params.name

            return tbl_biller.getUnusedBillerEdit(oldName, newName)
        } else {
            return Promise.reject('Cannot find Biller Details')
        }
    })
    .then((resUnusedBillerEdit) => {
        if (resUnusedBillerEdit.length > 0) {
            return Promise.reject('Biller Name already exist')
        } else {
            return tbl_biller.update(params, id)
        }
    })
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited')
        } else {
            result.ResponseCode = auth_resp.status
            result.ResponseDesc = "Edit Biller Success"
            result.ResponseData = rows
            
            logger.info("\n Biller Response : ", JSON.stringify(result))

            res.json(result)
        }
    }).catch(function (errors) {

        result.ResponseCode = "500"
        result.ResponseDesc = errors

        logger.info("\n Biller Response : ", JSON.stringify(result))
        
        res.json(result)
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

    var id = req.body.id

    var params = {
        deleted_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}

    logger.info("\n Request Remove Biller : ", JSON.stringify(id));

    tbl_biller.checkUsedBiller(id)
    .then(function (rows) {
        if (rows.length > 0) {
            return Promise.reject('This Biller is being used');
        } else {
            
            tbl_biller.update(params,id).then(function (rows){
                if (rows <= 0) {
                    return Promise.reject('No Biller Deleted');
                }
                else{
                    result.ResponseCode = auth_resp.status;
                    result.ResponseDesc = "Remove Biller Success";
                    result.ResponseData = rows;
                    logger.info("\n Biller Response : ", JSON.stringify(result));

                    res.send(result);        
                }
            })
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Biller Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.bulkRemove = function (req, res) {
    
    const token = (req.headers.token) ? (req.headers.token) : (null)
    const auth_resp = auth.verify(token)
    const biller_hosts = req.body.biller_hosts
    let result = {}
    
    // Verify JWT
    if (auth_resp.status !== "200") {
        res.json(auth_resp)
        return false
    }
    
    if (biller_hosts.length > 0) {
        let biller_hosts_id = []
        let deleted_at = moment().format("YYYY-MM-DD HH:mm:ss")
        
        for (let i = 0; i < biller_hosts.length; i++) {
            biller_hosts_id.push(biller_hosts[i].id)
        }

        console.log('\n Biller Host Delete Request : ', biller_hosts_id)

        tbl_biller.bulkDelete(biller_hosts_id, deleted_at)
        .then((response) => {
                result.ResponseCode = '200'
                result.ResponseDesc = "Bulk Remove Biller Success"
                result.ResponseData = response

                logger.info("\n Bulk Biller Remove Response : ", JSON.stringify(result))

                res.json(result)
        })
        .catch((err) => {
            result.ResponseCode = "500"
            result.ResponseDesc = errors

            logger.info("\n Bulk Biller Remove Response : ", JSON.stringify(result));
            
            res.json(result)
        })
    } else {
        result.ResponseCode = "400"
        result.ResponseDesc = 'No Request Data Received'

        logger.info("\n Biller Response : ", JSON.stringify(result));

        res.json(result)
    }
}