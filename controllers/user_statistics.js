var tbl_user_statistic = require('../models/tbl_user_statistic');
var logger = require('../libraries/logger');
var auth = require('../controllers/auth')
var moment = require("moment");

exports.search = function (req, res) {

    var field = "";
    var value = [];
    var result = {}
    let token = (req.headers.token) ? req.headers.token : null
    var dateFrom = (req.query.date_from) ? req.query.date_from : '2000-01-01 00:00:00'
    const dateToQuery = (req.query.date_to) ? req.query.date_to : moment().format("YYYY-MM-DD HH:mm:ss")
    var dateTo = (dateToQuery) ? moment(dateToQuery).add(1, 'days').format("YYYY-MM-DD HH:mm:ss") : moment().add(1, 'days').format("YYYY-MM-DD HH:mm:ss")

    //VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    if (req.query.network) {
        field += "users.network = ?"
        value.push(req.query.network)
        if (req.query.role || dateFrom || dateTo) {
            field += " AND ";
        }
    }

    if (req.query.role) {
        field += "users.role = ?"
        value.push(req.query.role)
        if (dateFrom || dateTo) {
            field += " AND ";
        }
    }

    if (req.query.date_from && req.query.date_to) {
        field += "users.created_at BETWEEN ? AND ?"
        value.push(dateFrom, dateTo)
    }else if (req.query.date_from && !req.query.date_to) {
        field += "users.created_at BETWEEN ? AND " + "'" + dateTo + "'"
        value.push(dateFrom)
    }else if (req.query.date_to && !req.query.date_from) {
        field += "users.created_at BETWEEN "+ "'" + dateFrom + "'" +" AND ?"
        value.push(dateTo)
    }else {
        field += "users.created_at BETWEEN "+ "'" + dateFrom + "'" +" AND "+ "'" + dateTo + "'"
    }

    tbl_user_statistic.search(field, value)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {
            total = rows.length
            let date_from = dateFrom
            let date_to = dateToQuery
            Object.assign(rows[0], {date_from}, {date_to} )

            result.ResponseCode = "200";
            result.ResponseDesc = "Search User Statistic Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n User Statistic Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "400";
        result.ResponseDesc = errors;

        logger.info("\n User Statistic Response : ", JSON.stringify(result));
        res.send(result)

    })
}

exports.activeUsers = function (req, res) {

    var field = "";
    var value = [];
    var result = {}
    let token = (req.headers.token) ? req.headers.token : null
    var dateFrom = (req.query.date_from) ? req.query.date_from : '2000-01-01 00:00:00'
    const dateToQuery = (req.query.date_to) ? req.query.date_to : moment().format("YYYY-MM-DD HH:mm:ss")
    var dateTo = (dateToQuery) ? moment(dateToQuery).add(1, 'days').format("YYYY-MM-DD HH:mm:ss") : moment().add(1, 'days').format("YYYY-MM-DD HH:mm:ss")

    //VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    if (req.query.network) {
        field += "users.network = ?"
        value.push(req.query.network)
        if (req.query.role || dateFrom || dateTo) {
            field += " AND ";
        }
    }

    if (req.query.role) {
        field += "users.role = ?"
        value.push(req.query.role)
        if (dateFrom || dateTo) {
            field += " AND ";
        }
    }

    if (req.query.date_from && req.query.date_to) {
        field += "tr_logs.request_time BETWEEN ? AND ?"
        value.push(dateFrom, dateTo)
    }else if (req.query.date_from && !req.query.date_to) {
        field += "tr_logs.request_time BETWEEN ? AND " + "'" + dateTo + "'"
        value.push(dateFrom)
    }else if (req.query.date_to && !req.query.date_from) {
        field += "tr_logs.request_time BETWEEN "+ "'" + dateFrom + "'" +" AND ?"
        value.push(dateTo)
    }else {
        field += "tr_logs.request_time BETWEEN "+ "'" + dateFrom + "'" +" AND "+ "'" + dateTo + "'"
    }

    tbl_user_statistic.activeUsers(field, value)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {
            total = rows.length
            let date_from = dateFrom
            let date_to = dateToQuery
            Object.assign(rows[0], {date_from}, {date_to} )

            result.ResponseCode = "200";
            result.ResponseDesc = "Search Active User Statistic Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Active User Statistic Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "400";
        result.ResponseDesc = errors;

        logger.info("\n Active User Statistic Response : ", JSON.stringify(result));
        res.send(result)

    })
}

exports.growthUsers = function (req, res) {

    var field = "";
    var value = [];
    var result = {}
    let token = (req.headers.token) ? req.headers.token : null
    var dateFrom = (req.query.date_from) ? req.query.date_from : '2000-01-01'
    var dateTo = (req.query.date_to) ? moment(req.query.date_to).add(1, 'days').format("YYYY-MM-DD") : moment().add(1, 'days').format("YYYY-MM-DD")

    //VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    if (req.query.network) {
        field += "users.network = ?"
        value.push(req.query.network)
        if (req.query.role || dateFrom || dateTo) {
            field += " AND ";
        }
    }

    if (req.query.role) {
        field += "users.role = ?"
        value.push(req.query.role)
        if (dateFrom || dateTo) {
            field += " AND ";
        }
    }

    if (req.query.date_from && req.query.date_to) {
        field += "DATE(created_at) BETWEEN ? AND ?"
        value.push(dateFrom, dateTo)
    }else if (req.query.date_from && !req.query.date_to) {
        field += "DATE(created_at) BETWEEN ? AND " + "'" + dateTo + "'"
        value.push(dateFrom)
    }else if (req.query.date_to && !req.query.date_from) {
        field += "DATE(created_at) BETWEEN "+ "'" + dateFrom + "'" +" AND ?"
        value.push(dateTo)
    }else {
        field += "DATE(created_at) BETWEEN "+ "'" + dateFrom + "'" +" AND "+ "'" + dateTo + "'"
    }

    tbl_user_statistic.growthUsers(field, value)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {
            total = rows.length

            result.ResponseCode = "200";
            result.ResponseDesc = "Search Growth User Statistic Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Growth User Statistic Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "400";
        result.ResponseDesc = errors;

        logger.info("\n Growth User Statistic Response : ", JSON.stringify(result));
        res.send(result)

    })
}