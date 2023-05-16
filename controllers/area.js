var tbl_area = require('../models/tbl_area');
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

    if (req.query.province_name) {
        field += "provinces.province_name like ?"
        value.push("%" + req.query.province_name + "%")
        if (req.query.id || req.query.area || req.query.province_id || req.query.note)
            field += " AND "
    }
    if (req.query.id) {
        field += "areas.id = ?"
        value.push(req.query.id);
        if (req.query.area || req.query.province_id || req.query.note)
            field += " AND ";
    }
    if (req.query.area) {
        field += "areas.area like ?"
        value.push("%" + req.query.area + "%");
        if (req.query.province_id || req.query.note)
            field += " AND ";
    }
    if (req.query.province_id) {
        field += "areas.province_id = ?"
        value.push(req.query.province_id);
        if (req.query.note)
            field += " AND ";
    }
    if (req.query.note) {
        field += "areas.note like ?";
        value.push("%" + req.query.note + "%");
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

    tbl_area.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('Search undefined');
        } else {

            total = rows.length

            if(page!=="all"){
                index = (page-1)*size
                maxindex = (page*size)
                rows = rows.slice(index,maxindex)   
            }                

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Area Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Area Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Area Response : ", JSON.stringify(result));
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
        province_id: req.body.province_id,
        area: req.body.area,
        note: req.body.note,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Add Area : ", JSON.stringify(data));

    if (!field){
        field += " areas.area = ?";    
    }
    value.push(data.area);

    tbl_area.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Area already exists');
        }

        return tbl_area.create(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Your data has been successfully created.";
            result.ResponseData = rows;
            logger.info("\n area Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Area Response : ", JSON.stringify(result));
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

    var field = "";
    var value = [];
    var orderBy = "";
    var result = {}

    var id = req.body.id
    var params = {
        province_id: req.body.province_id,
        area: req.body.area,
        note: req.body.note,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Edit Area : ", JSON.stringify(id));

    if (params.area) {
        field += " areas.area = ?"
        value.push(params.area)
    } else {
        result.ResponseCode = "500"
        result.ResponseDesc = 'Uncomplete Request Parameter'

        logger.info("\n Area Update Response : ", JSON.stringify(result))

        res.send(result)
    }

    tbl_area.search(field, value, orderBy)
    .then(function (rows) {
        if (rows.length > 0 && rows[0].id != id) {
            return Promise.reject('City name already exist')
        }

        return tbl_area.update(params, id)
    })
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Your data has been successfully updated.";
            result.ResponseData = rows;
            logger.info("\n Area Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Area Response : ", JSON.stringify(result));
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

    logger.info("\n Request Remove Area : ", JSON.stringify(id));

    tbl_area.checkUsedArea(id)
    .then(function (rows) {
        if (rows.length > 0) {
            return Promise.reject('This Area is being used');
        } else {
            
            tbl_area.update(params,id).then(function (rows){
                if (rows <= 0) {
                    return Promise.reject('No Area Deleted');
                }
                else{
                    result.ResponseCode = auth_resp.status;
                    result.ResponseDesc = "Your data has been successfully deleted.";
                    result.ResponseData = rows;
                    logger.info("\n Area Response : ", JSON.stringify(result));

                    res.send(result);        
                }
            })
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Area Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.bulkAdd = function(req, res) {

    let token = (req.headers.token) ? req.headers.token : null
    let auth_resp = auth.verify(token)
    let result = {}
    
    //VERIFY JWT
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }
    
    let provinces = req.body.areas.provinces
    let time = moment().format("YYYY-MM-DD HH:mm:ss")
    let bulkInsertData = []

    provinces.forEach((province) => {
        let provinceId = province.id
        let areas = province.areas
        
        areas.forEach((area) => {
            let areaData = []
            areaData.push(provinceId, area, time)
            bulkInsertData.push(areaData)
        })
    })

    tbl_area.bulkAdd(bulkInsertData)
    .then((rows) => {
        result.ResponseCode = auth_resp.status
        result.ResponseDesc = "Bulk Insert Area Successful"
        result.ResponseData = rows

        logger.info("\n Bulk Insert Area Response : ", JSON.stringify(result))

        res.json(result)
    })
    .catch((err) => {
        result.ResponseCode = "401"
        result.ResponseDesc = err

        logger.info("\n Bulk Insert Area Response : ", JSON.stringify(result))

        res.json(result)
    })
}