var jwt = require('jsonwebtoken');
var config = require('../config/config');
var logger = require('../libraries/logger');
var sha256 = require("crypto-js/sha256");
var tbl_user = require('../models/tbl_user');
var tbl_role = require('../models/tbl_role');
var tbl_network = require('../models/tbl_network');
var dateformat = require('dateformat');
var md5 = require('md5');
var moment = require('moment');

exports.login = function (req, res) {

    var param_username = req.body.username
    var param_password = req.body.password

    var hashPassword = md5(md5(param_password).substring(0,16)+config.salt_key).substring(0,16)

	var result = {}
    var data_users = {}

    tbl_user.getUserAuth(param_username)
    .then(function (row_users) {
        
        if (row_users.length == 0) {
            return Promise.reject('This account is not found')
        } else {
            data_users = row_users[0]
            result.ResponseCode = "401";

            if (data_users.deleted_at !== null) {
                return Promise.reject('This account has been deleted. Contact Administrator for more details.')
            } else if (data_users.active === 0) {
                return Promise.reject('This account has been temporary suspended. Contact Administrator for more details.')
            } else if (data_users.last_login !== null && data_users.status.toLowerCase() == 'inactive') {
                return Promise.reject('This account has been temporary suspended. Contact Administrator for more details.')
            } else {
                //validate input password with the existing password
                if (hashPassword == data_users.password) {
                    //on login success, change status to Active
                    var data = {
                        status: "Active",
                        last_login: moment().format("YYYY-MM-DD HH:mm:ss")
                    }

                    return tbl_user.updateUser(data, param_username)
                } else {
                    result.ResponseCode = "400";
                    return Promise.reject('Username/ Password is invalid. Please enter a valid Username/ Password.')
                }
            }
        }
    })
    .then(function (update_result) {
        //get role rights
        var role_id = data_users.role
        return tbl_role.getPageRights(role_id)
    })
    .then(function (rights) {
        var token_exp = Math.floor(Date.now() / 1000) + (60 * 60);

        var token_id = jwt.sign({
            exp: token_exp,
            data: param_username,
            algorithm: 'RS256'
        }, config.secret);

        token_exp = new Date(token_exp * 1000);
        token_exp = token_exp.toUTCString();
        token_exp = dateformat(token_exp, "yyyy-mm-dd HH:MM:ss");

        var user_data = {
            username: data_users.username,
            name: data_users.name,
            role: data_users.role,
            role_level: data_users.level,
            network: data_users.network,
            network_name: data_users.network_name,
            favicon: data_users.favicon,
            url_website: data_users.url_website,
            sender_email: data_users.sender_email,
            dashboard_logo: data_users.dashboard_logo,
            rights: rights,
            last_login: data_users.last_login,
            status: data_users.status
        }

        var response_data = {
            token_id: token_id,
            token_exp: token_exp,
            data: user_data
        }

        result.ResponseCode = "200";
        result.ResponseDesc = "Login Successful";
        result.ResponseData = response_data;
        logger.info("\n Login Response : ", JSON.stringify(result));

        res.send(result);
    })
    .catch(function (errors) {

        if (!result.ResponseCode) {
            result.ResponseCode = "500";
        }
        
        result.ResponseDesc = errors;

        logger.info("\n Login Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.verify = function (token) {

    var param_token = token

    let result = {}
    var data_users = {}
    var status = ""

    logger.info("\n Token Verification Request : " + JSON.stringify(param_token));

    if(token===null){
        result.status = "401"
        result.message = "Token Verification Response : Unauthorized. No token was sent !"
    } else {
        jwt.verify(param_token, config.secret, function(err, decoded) {
            if (err) {
                if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
                    result.status = "401"
                    result.message = "Token Verification Response : "+err.message
                    result.desc = (err.name === "TokenExpiredError") ? "Token expired at : "+ moment(err.expiredAt).format("DD-MM-YYYY HH:mm:ss") : null
                }
            } else {
                result.status = "200"
                result.message = "Token Verification Response : Verification Successful !"
            }
        })
    }

    logger.info("\n "+result.message);   

    return result

}