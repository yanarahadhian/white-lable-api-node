var tbl_universitas = require('../models/tbl_universitas');
var logger = require('../libraries/logger');
var moment = require('moment');
var config = require('../config/config');

exports.search = function(req, res){

    var result = {}
    var phrase = req.query.nama_universitas

    tbl_universitas.search(phrase)
    .then(function(rows){

        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {         

            total = rows.length

            result.ResponseCode = "200";
            result.ResponseDesc = "Search Universitas Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Universitas Response : ", JSON.stringify(result));

            res.send(result);

        }

    }).catch(function (errors) {

        result.ResponseCode = "400";
        result.ResponseDesc = errors;

        logger.info("\n Universitas Response : ", JSON.stringify(result));
        res.send(result)

    })
}