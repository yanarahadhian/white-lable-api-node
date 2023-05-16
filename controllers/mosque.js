var tbl_mosque = require('../models/tbl_mosque');
var tbl_user = require('../models/tbl_user');
var tbl_network = require('../models/tbl_network');
var logger = require('../libraries/logger');
var moment = require('moment');
var config = require('../config/config');
var md5 = require("md5");
var auth = require('../controllers/auth')

exports.getMosqueByDistrict = function(req, res){

    var result = {}
    var id_district = req.query.id_district

    tbl_mosque.searchByDistricts(id_district)
    .then(function(rows){

        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {         

            total = rows.length

            result.ResponseCode = "200";
            result.ResponseDesc = "Search Masjid Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Masjid Response : ", JSON.stringify(result));

            res.send(result);

        }

    }).catch(function (errors) {

        result.ResponseCode = "400";
        result.ResponseDesc = errors;

        logger.info("\n Masjid Response : ", JSON.stringify(result));
        res.send(result)

    })
}

exports.add = function(req, res) {

    var result = {}
    var data = {
        district_id: req.body.district_id,
        nama_masjid: req.body.nama_masjid,
        alamat_masjid: req.body.alamat_masjid,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        approved: 1,
        registrant: req.body.registrant
    }

    logger.info("\n Request Add Masjid : ", JSON.stringify(data))

    tbl_mosque.add(data)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseDesc = "Create Masjid Success";
            result.ResponseData = rows;
            logger.info("\n Masjid Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Masjid Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.verifyMasjidAsAgent = function(req, res){

    var field = "";
    var value = [];
    var orderBy = "";
    let agentPassword = config.default_password
    let hashPassword = md5(md5(agentPassword).substring(0,16)+config.salt_key).substring(0,16)
    var result = {}
    var namaMasjid = ""
    var alamatMasjid = ""
    var fieldMasjid = ""
    var valueMasjid = []
    var masjid_id = req.body.masjid_id

    var data = {
        username: req.body.username,
        password: hashPassword,
        email: req.body.email,
        phone_number: req.body.phone_number,
        network: req.body.network,
        area: req.body.area,
        upline: req.body.upline,
        status: 'Inactive',
        noktp:  (req.body.noktp) ? (req.body.noktp) : (null),
        npwp:  (req.body.npwp) ? (req.body.npwp) : (null),
        siup:  (req.body.siup) ? (req.body.siup) : (null),
        rekening_bank:  (req.body.rekening_bank) ? (req.body.rekening_bank) : (null),
        nama_bank:  (req.body.nama_bank) ? (req.body.nama_bank) : (null),
        role: req.body.role,
        active: 1,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        name: "",
        alamat: ""
    }

    logger.info("\n Request Add Agent / Loper : ", JSON.stringify(data));
    
    if (!field){
        field += " users.username = ?";    
    }
    value.push(data.username);

    if (!fieldMasjid){
        fieldMasjid += " id = ?";    
    }
    valueMasjid.push(masjid_id);

    tbl_mosque.search(fieldMasjid, valueMasjid)
    .then(function(rows){
        if(rows.length == 0){
            return Promise.reject('Masjid Null');
        }
        
        if(rows[0].approved == 1){
            return Promise.reject('Masjid Approved');
        }

        data.name = rows[0].nama_masjid
        data.alamat = rows[0].alamat

        return tbl_user.search(field, value, orderBy)
    })
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Username already exists');
        }
        return tbl_mosque.updateMasjidAsUser(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {
            tbl_network.getNetworkDetails(data.network)
            .then(function (dataNetwork) {
                if (dataNetwork.length == 0) {
                    return Promise.reject('No Network Data');
                } else {
                    tbl_mosque.verifyMasjid(rows, masjid_id)
                    .then(function (rows){
                        if (rows.length == 0) {
                            return Promise.reject('No rows');
                        } else {         
                            result.ResponseCode = "200";
                            result.ResponseDesc = "Add Masjid Successful";
                            result.ResponseData = rows;
                            logger.info("\n Masjid Response : ", JSON.stringify(result));
                
                            res.send(result);
                        }
                    }).catch(function(errors){
                        return Promise.reject('Add Masjid Failed');
                    })
                }
            }).catch(function (errors) {
                return Promise.reject('Get Network Detail Failed');
            })
        }
    })
    .catch(function (errors) {
        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Update Masjid As Agent Response : ", JSON.stringify(result));
        res.send(result)
    })

}


exports.verifyMasjidOnly = function(req, res){
    var field = "";
    var value = [];
    var orderBy = "";
    var result = {}

    var data = {
        user_id: 777,
        masjid_id: req.body.masjid_id
    }

    logger.info("\n Request Verify Masjid : ", JSON.stringify(data));

    tbl_mosque.verifyMasjid(data.user_id, data.masjid_id)
    .then(function (rows){
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {         
            result.ResponseCode = "200";
            result.ResponseDesc = "Verify Masjid Successful";
            result.ResponseData = rows;
            logger.info("\n Masjid Response : ", JSON.stringify(result));

            res.send(result);
        }
    }).catch(function(errors){
        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Verify Masjid Response : ", errors);
        res.send(result)
    })
}

exports.search = function(req, res){
    var field = "";
    var value = [];
    var result = {};

    if (req.query.id) {
        field += "id = ?"
        value.push(req.query.id)
        if (req.query.user_id || req.query.district_id || req.query.nama_masjid || req.query.approved || req.query.registrant)
            field += " AND ";
    }
    if (req.query.user_id) {
        field += "user_id = ?"
        value.push(req.query.user_id)
        if (req.query.district_id || req.query.nama_masjid || req.query.approved || req.query.registrant)
            field += " AND ";
    }
    if (req.query.district_id) {
        field += "district_id = ?"
        value.push(req.query.district_id)
        if (req.query.nama_masjid || req.query.approved || req.query.registrant)
            field += " AND ";
    }
    if (req.query.nama_masjid) {
        field += "nama_masjid like ?"
        value.push(req.query.nama_masjid)
        if (req.query.approved || req.query.registrant)
            field += " AND ";
    }
    if (req.query.approved) {
        field += "approved = ?"
        value.push(req.query.approved)
        if (req.query.registrant)
            field += " AND ";
    }
    if (req.query.registrant) {
        field += "registrant like ?"
        value.push(req.query.registrant)
    }
    value.push(1);
    tbl_mosque.search(field, value)
    .then(function (rows){
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {         

            total = rows.length

            result.ResponseCode = "200";
            result.ResponseDesc = "Search Masjid Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Masjid Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function(errors){
        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Masjid Response : ", errors);
        logger.info("\n Masjid Response : ", JSON.stringify(result));
        res.json(result)
    })
    
}

exports.bulkAdd = function (req, res) {
    let token = (req.headers.token) ? (req.headers.token) : null
    let auth_resp = auth.verify(token)
    let result = {}
    
    // VERIFY JWT
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
    }

    let mosques = (req.body.mosques) ? (req.body.mosques) : (null)
    let time = moment().format("YYYY-MM-DD HH:mm:ss")
    let approved = 1
    let bulkInsertData = []

    if (mosques) {
        mosques.forEach(item => {
            let mosqueDetailsData = []
            let registrant = (item.registrant) ? (item.registrant) : (null)
            
            mosqueDetailsData.push(item.district_id, time, item.mosque_name, item.mosque_alamat, approved, registrant)
            bulkInsertData.push(mosqueDetailsData)
        })
    } else {

        result.ResponseCode = '400'
        result.ResponseDesc = 'Bad Request on Payload'

        logger.info("\n Request Bulk Insert Mosques : ", JSON.stringify(result))
    }

    tbl_mosque.bulk(bulkInsertData)
    .then((response) => {

        result.ResponseCode = '200'
        result.ResponseDesc = 'Bulk Insert Mosques Successful'
        result.ResponseData = response

        logger.info("\n Request Bulk Insert Mosques : ", JSON.stringify(result))

        res.send(result)
    })
    .catch((error) => {

        result.ResponseCode = '400'
        result.ResponseDesc = 'Bulk Insert Mosques Failed'
        result.ResponseData = error

        logger.info("\n Request Bulk Insert Mosques : ", JSON.stringify(result))
        
        res.send(result)
    })
}

exports.getMosqueTestBeta = function (req, res) {
    
    let result = {}
    let size = (req.query.size) ? req.query.size : 5
    let page = (req.query.page) ? req.query.page : 1
    let field = ''
    let fieldLimit = ''

    if (page !== "all") {
        fieldLimit = ' LIMIT ' + size + ' OFFSET ' + page
    }

    tbl_mosque.searchBeta(field, fieldLimit)
    .then(function (rows) {
        res.json(rows)
    }).catch(function (errors) {

        result.ResponseCode = 400
        result.ResponseDesc = errors

        res.json(result)

    })
}

