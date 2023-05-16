var tbl_district = require('../models/tbl_district');
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
        field += "dis.id = ?"
        value.push(req.query.id);
        if (req.query.district_name || req.query.province_id || req.query.area_id || req.query.area || req.query.province_name)
            field += " AND ";
    }
    if (req.query.district_name) {
        field += "dis.district_name like ?"
        value.push("%" + req.query.district_name + "%");
        if (req.query.province_id || req.query.area_id || req.query.area || req.query.province_name)
            field += " AND ";
    }
    if (req.query.province_id) {
        field += "dis.province_id = ?"
        value.push(req.query.province_id);
        if (req.query.area_id || req.query.area || req.query.province_name)
            field += " AND ";
    }
    if (req.query.area_id) {
        field += "dis.area_id = ?"
        value.push(req.query.area_id);
        if (req.query.area || req.query.province_name)
            field += " AND ";
    }
    if (req.query.area) {
        field += "ar.area like ?"
        value.push("%" + req.query.area + "%");
        if (req.query.province_name)
            field += " AND ";
    }
    if (req.query.province_name) {
        field += "pro.province_name like ?"
        value.push("%" + req.query.province_name + "%");
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

    logger.info("\n Request for Search Districts : " + JSON.stringify(req.query));

    tbl_district.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No Districts rows');
        } else {

            total = rows.length

            if(page!=="all"){
                index = (page-1)*size
                maxindex = (page*size)
                rows = rows.slice(index,maxindex)   
            }                

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search District Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n District Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n District Response : ", JSON.stringify(result));
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
        district_name: req.body.district_name,
        province_id: req.body.province_id,
        area_id: req.body.area_id,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Add District : ", JSON.stringify(data));

    if (!field){
        field += "dis.district_name like ?"
    }
    value.push("%" + data.district_name + "%");

    if (field){
        field += " AND dis.province_id = ?";    
    }
    value.push(data.province_id);

    if (field){
        field += " AND dis.area_id = ?";    
    }
    value.push(data.area_id);

    tbl_district.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('District already exists!, choose different province or city or district');
        }

        return tbl_district.create(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create District Success";
            result.ResponseData = rows;
            logger.info("\n District Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n District Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.edit = function(req, res) {

    const token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    let field = ''
    let value = []
    let orderBy = ''
    let result = {}
    let id = req.body.id
    let params = {
        district_name: req.body.district_name,
        province_id: req.body.province_id,
        area_id: req.body.area_id,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Edit District : ", JSON.stringify(id))

    if (params.district_name && params.province_id && params.area_id) {
        field += "dis.district_name = ? AND dis.province_id = ? AND dis.area_id = ?"
        value.push(params.district_name, params.province_id, params.area_id)
    } else {
        result.ResponseCode = '400'
        result.ResponseDesc = 'Uncomplete Request Parameters'

        logger.info("\n District Update Response : ", JSON.stringify(result))
        res.send(result)
    }

    tbl_district.search(field, value, orderBy)
    .then(function (rows) {
        if (rows.length > 0 && rows[0].id != id) {          
            return Promise.reject('District already exists!, choose different province or city or district')
        }

        return tbl_district.update(params, id)
    })
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit District Success";
            result.ResponseData = rows;
            logger.info("\n District Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n District Response : ", JSON.stringify(result));
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

    logger.info("\n Request Remove District : ", JSON.stringify(id));

    tbl_district.checkUsedDistrict(id)
    .then(function (rows) {
        if (rows.length > 0) {
            return Promise.reject(`This District is being used by User ${rows[0].name}`);
        } else {
            
            tbl_district.update(params,id).then(function (rows){
                if (rows <= 0) {
                    return Promise.reject('No District Deleted');
                }
                else{
                    result.ResponseCode = auth_resp.status;
                    result.ResponseDesc = "Remove District Success";
                    result.ResponseData = rows;
                    logger.info("\n District Response : ", JSON.stringify(result));

                    res.send(result);        
                }
            })
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n District Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.searchMobile = function(req, res) {

    var field = "";
    var value = [];
    var result = {}

    if (req.query.id) {
        field += "dis.id = ?"
        value.push(req.query.id);
        if (req.query.district_name || req.query.province_id || req.query.area_id || req.query.area || req.query.province_name)
            field += " AND ";
    }
    if (req.query.district_name) {
        field += "dis.district_name like ?"
        value.push("%" + req.query.district_name + "%");
        if (req.query.province_id || req.query.area_id || req.query.area || req.query.province_name)
            field += " AND ";
    }
    if (req.query.province_id) {
        field += "dis.province_id = ?"
        value.push(req.query.province_id);
        if (req.query.area_id || req.query.area || req.query.province_name)
            field += " AND ";
    }
    if (req.query.area_id) {
        field += "dis.area_id = ?"
        value.push(req.query.area_id);
        if (req.query.area || req.query.province_name)
            field += " AND ";
    }
    if (req.query.area) {
        field += "ar.area like ?"
        value.push("%" + req.query.area + "%");
        if (req.query.province_name)
            field += " AND ";
    }
    if (req.query.province_name) {
        field += "pro.province_name like ?"
        value.push("%" + req.query.province_name + "%");
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

    logger.info("\n Request for Search Districts : " + JSON.stringify(req.query));

    tbl_district.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            result.ResponseDesc = "Search District Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n District Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n District Response : ", errors);
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
            let areaId = area.id
            let districts = area.districts
            
            districts.forEach((district) => {
                let districtData = []
                districtData.push(district, provinceId, areaId, time)
                bulkInsertData.push(districtData)
            })
        })
    })
    
    tbl_district.bulkAdd(bulkInsertData)
    .then((rows) => {

        result.ResponseCode = auth_resp.status
        result.ResponseDesc = "Bulk Insert District Successful"
        result.ResponseData = rows
        
        logger.info("\n\n Bulk Insert District Response : ", JSON.stringify(result))

        res.json(result)
    })
    .catch((err) => {
        result.ResponseCode = "401"
        result.ResponseDesc = err

        logger.info("\n\n Bulk Insert District Response (err) : ", JSON.stringify(result))

        res.json(result)
    })
}