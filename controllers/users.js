var tbl_user = require('../models/tbl_user');
var tbl_network = require('../models/tbl_network');
var tbl_mosque = require('../models/tbl_mosque');
var tbl_wallet = require('../models/tbl_wallet');
var logger = require('../libraries/logger');
var config = require('../config/config');
var moment = require("moment");
var md5 = require("md5");
var mail = require('../middleware/mail');
var config = require('../config/config');
var auth = require('../controllers/auth')
var { getAllUsername, randomString } = require('../middleware/user')

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

    // CONDITION MANAGEMENT
    if (req.query.id) {
        field += "users.id = ?"
        value.push(req.query.id)
        if (req.query.username || req.query.name || req.query.email || req.query.phone_number || req.query.networkName || req.query.network_id || req.query.areaName || req.query.area_id || req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.username) {
        field += "users.username like ?"
        value.push(`%${ req.query.username }%`)
        if (req.query.name || req.query.email || req.query.phone_number || req.query.networkName || req.query.network_id || req.query.areaName || req.query.area_id || req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.name) {
        field += "users.name like ?"
        value.push(`%${ req.query.name }%`)
        if (req.query.email || req.query.phone_number || req.query.networkName || req.query.network_id || req.query.areaName || req.query.area_id || req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.email) {
        field += "users.email like ?"
        value.push(`%${ req.query.email }%`)
        if (req.query.phone_number || req.query.networkName || req.query.network_id || req.query.areaName || req.query.area_id || req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.phone_number) {
        field += "users.phone_number like ?"
        value.push(`%${ req.query.phone_number }%`)
        if (req.query.networkName || req.query.network_id || req.query.areaName || req.query.area_id || req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.networkName) {
        field += "network.network like ?"
        value.push(`%${ req.query.networkName }%`)
        if (req.query.network_id || req.query.areaName || req.query.area_id || req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.network_id) {
        field += "network.id = ?"
        value.push(req.query.network_id)
        if (req.query.areaName || req.query.area_id || req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.areaName) {
        field += "areas.area like ?"
        value.push(`%${ req.query.areaName }%`)
        if (req.query.area_id || req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.area_id) {
        field += "areas.id = ?"
        value.push(req.query.area_id)
        if (req.query.role || req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.role) {
        field += "groups.id = ?"
        value.push(req.query.role)
        if (req.query.roleName || req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.roleName) {
        field += "groups.name like ?"
        value.push(`%${ req.query.roleName }%`)
        if (req.query.status || req.query.role_level  || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.status) {
        field += "users.status = ?"
        if (req.query.status.includes('in')) {
            value.push('inactive')
        } else {
            value.push('active')
        }

        if (req.query.role_level || req.query.level_exception)
            field += " AND ";
    }
    if (req.query.role_level) {
        field += "groups.level > ?"
        value.push(req.query.role_level)
        if (req.query.level_exception) {
            field += " AND "
        }
    }
    if (req.query.level_exception) {
        field += "groups.level != ?"
        value.push(req.query.level_exception)
    }
    
    //only search active agents
    if (!field){
        field += "users.active = ?";    
    } else {
        field += " AND users.active = ?";    
    }
    value.push(1);

    
    // SORT MANAGEMENT
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
    
    tbl_user.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            result.ResponseCode = "404";
            result.ResponseDesc = 'Data Not Found!';
    
            logger.info("\n Users Response : ", JSON.stringify(result));
            res.json(result)
        } else {

            total = rows.length

            if (page !== "all") {
                index = (page - 1) * size
                maxindex = (page * size)
                rows = rows.slice(index, maxindex)   
            }                
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Users Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Users Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Users Response : ", JSON.stringify(result));
        res.json(result)
    
    })
}

exports.searchUplines = function(req, res) {

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
    

    if (req.query.area) {
        field += "area = ?"
        value.push(req.query.area)
        if (req.query.network || req.query.district_id) {
            field += " AND "
        }
    }
    if (req.query.network) {
        field += "network = ?"
        value.push(req.query.network)
        if (req.query.network) {
            field += " AND "
        }
    }
    if (req.query.district_id) {
        field += "district_id = ?"
        value.push(req.query.district_id)
    }

    if (!req.query.district_id){
        field += "users.role = ?";    
    } else {
        field += " AND users.role = ?";    
    }
    value.push(3);

    // SORT MANAGEMENT
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
    
    logger.info("\n Request List Uplines on Area : " + JSON.stringify(req.query));
    
    tbl_user.getUplines(field, value, orderBy)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows')
        } else {

            result.ResponseCode = auth_resp.status
            result.ResponseDesc = "Get All Upline Successful"
            result.ResponseData = rows
            
            logger.info("\n Upline List Response : ", JSON.stringify(result))
            res.json(result)
        }
    }).catch(function (errors) {

        result.ResponseCode = "500"
        result.ResponseDesc = errors

        logger.info("\n Upline List Response : ", JSON.stringify(result))
        res.json(result)
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
    var randomStr = randomString()
    let hashPassword = md5(md5(randomStr).substring(0,16)+config.salt_key).substring(0,16)
    let dashboard_url = config.dashboard_url

    var data = {
        username: req.body.username,
        password: hashPassword,
        name: req.body.name,
        phone_number: req.body.phone_number,
        alamat: (req.body.alamat) ? (req.body.alamat) : (null),
        district_id: (req.body.district_id) ? (req.body.district_id) : (null),
        area: req.body.area,
        email: req.body.email,
        profile_img: (req.body.profile_img) ? (req.body.profile_img) : (null),
        status: 'Inactive',
        network: req.body.network,
        role: req.body.role,
        active: 1,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}

    logger.info("\n Request Add Users : ", JSON.stringify(data));
    
    if (!field){
        field += " users.username = ?";    
    }

    value.push(data.username);

    tbl_user.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Username already exists');
        }

        return tbl_user.createUser(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {
            tbl_network.getNetworkDetails(data.network)
            .then(function (dataNetwork) {
                let networkName = null
                let networkSenderEmail = null

                if (dataNetwork.length < 1) { 
                    logger.info("\n No data network available with ID : ", data.network) 
                } else {
                    networkName = dataNetwork[0].network
                    networkSenderEmail = dataNetwork[0].sender_email
                }

                result.ResponseCode = auth_resp.status
                result.ResponseDesc = "Create Users Success!";
                result.ResponseData = rows;
                logger.info("\n Users Response : ", JSON.stringify(result));
                
                req.body.networkName = networkName
                req.body.networkSenderMail = networkSenderEmail
                req.body.subject = 'Your credential access to Agan Dashboard is here!'
                req.body.message = `You have been granted access to the Agan Dashboard; Here is your username and password : ;;Username     : ${ data.username } ;Password     : ${ randomStr } ;;Please login at ${ dashboard_url } and change your password immediately by going to My Profile`
                req.body.password = randomStr
    
                mail.sendMail(req)
                .then(function(response) {
                    logger.info('Send Mail to User Success : ', response)
                    result.ResponseMailUser = response.message
                    result.ResponseMailLog = response.mailLog
                    res.send(result)
                })
                .catch(function(err) {
                    logger.info('Send Mail to User Failed : ', err)
                    result.ResponseMailUser = err.message
                    result.ResponseMailLog = err.mailLog
                    res.send(result)
                })
            })
            .catch(function(err) {
                logger.info('Send Mail to User Failed : ', err)
                return Promise.reject('Send Mail to User Email Failed');
            })
        }
    }).catch(function (errors) {
        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Users Response : ", JSON.stringify(result));
        res.send(result)
    })
}

exports.edit = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var username = req.body.username
    var image = (req.file) ? req.file.path : req.body.profile_img
    var params = {
        name: req.body.name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        alamat: req.body.alamat,
        status: req.body.status,
        role: req.body.role,
        network: req.body.network,
        area: req.body.area,
        profile_img: image,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

            // ----- new field for agent edit
    if (req.body.noktp) {
        params.noktp = req.body.noktp
    }

    if (req.body.npwp) {
        params.npwp = req.body.npwp
    }

    if (req.body.siup) {
        params.siup = req.body.siup
    }

    if (req.body.rekening_bank) {
        params.rekening_bank = req.body.rekening_bank
    }

    if (req.body.nama_bank) {
        params.nama_bank = req.body.nama_bank
    }

    if (req.body.upline) {
        params.upline = req.body.upline
    }

    var result = {}

    logger.info("\n Request Edit Users : ", JSON.stringify(params));

    tbl_user.updateUser(params,username)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Users Success";
            result.ResponseData = rows;
            logger.info("\n Users Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Users Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.changePassword = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var username = req.body.username
    var password = req.body.password

    var hashPassword = md5(md5(password).substring(0,16)+config.salt_key).substring(0,16)

    var params = {
        password: hashPassword
    }

    var result = {}

    logger.info("\n Request Edit Users : ", JSON.stringify(username));

    tbl_user.updateUser(params, username)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Change Password Users Success";
            result.ResponseData = rows;
            logger.info("\n Users Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Users Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.resetPassword = function(req, res) {
    
    var field = "";
    var value = [];
    var orderBy = "";
    var result = {}
    
    var dataUser = {}
    var username = req.body.username
    var randomStr = randomString()
    let hashPassword = md5(md5(randomStr).substring(0,16)+config.salt_key).substring(0,16)
    let dashboard_url = config.dashboard_url
    var params = {
        password: hashPassword
    }

    if (!field){
        field += " users.username = ?";    
    }
    value.push(username);

    logger.info("\n Request Reset Password : ", JSON.stringify(username));

    tbl_user.search(field, value, orderBy)
    .then(function (rows) {
        dataUser = rows
        if (rows.length == 0) {
            return Promise.reject('No rows')
        }

        return tbl_user.updateUser(params, username)
    }).then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No User found');
        } else {
            tbl_network.getNetworkDetails(dataUser[0].network)
            .then(function (dataNetwork) {
                let networkName = null
                let networkSenderEmail = null

                if (dataNetwork.length < 1) { 
                    logger.info("\n No data network available with ID : ", dataUser[0].network) 
                } else {
                    networkName = dataNetwork[0].network
                    networkSenderEmail = dataNetwork[0].sender_email
                }

                result.ResponseCode = "200";
                result.ResponseDesc = "Reset Password Success";
                result.ResponseData = rows;
                logger.info("\n Reset Password Response : ", JSON.stringify(result));
    
                req.body.networkName = networkName
                req.body.networkSenderMail = networkSenderEmail
                req.body.subject = 'Forgetten password reset'
                req.body.message = `Your password already reset, your ID : ; Username     : ${ username } ;Password     : ${ randomStr } ;Try login again at ${ dashboard_url } and change your password immediately by going to My Profile`
                req.body.password = randomStr
                req.body.name = dataUser[0].name
                req.body.email = dataUser[0].email
    
                mail.sendMail(req)
                .then(function(response) {
                    result.ResponseMailUser = response.message
                    result.ResponseMailLog = response.mailLog
                    res.send(result)
                })
                .catch(function(err) {
                    result.ResponseMailUser = err.message
                })

            })
            .catch(function(err) {
                logger.info('Send Mail to User Failed : ', err)
                return Promise.reject('Send Mail to User Email Failed');
            })
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Reset Password Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.remove = function(req, res) {

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

    var username = req.query.username
    
    var params = {
        'status': 'Inactive',
        'active': 0,
        'deleted_at': moment().format("YYYY-MM-DD HH:mm:ss")
    }
    
    logger.info("\n Request Remove Users : ", JSON.stringify(username));

    tbl_user.updateUser(params,username)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows deleted');
        } else {

            if (!field){
                field += " wl.username = ?";    
            }
            value.push(username);

            tbl_wallet.search(field, value, orderBy).then(function (wallets) {
                if (wallets.length >= 0) {
                    var walletId = wallets[0].id
                    var dataWallet = {
                        'enable_disable': 'DISABLE',
                        'deleted_at': moment().format("YYYY-MM-DD HH:mm:ss")
                    }

                    tbl_wallet.update(dataWallet,walletId)
                }
            })

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Remove Users Success";
            result.ResponseData = rows;
            logger.info("\n Users Response : ", JSON.stringify(result));

            res.send(result);
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Users Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.bulkInsert = function (req, res) {
    let arrUsername = []
    let result = {}
    let active = 1
    let role = req.body.role
    let status = 'inactive'
    let created_at = moment().format("YYYY-MM-DD HH:mm:ss")
    let password = md5(md5(config.default_password).substring(0,16)+config.salt_key).substring(0,16)
    
    let bulkInsertData = req.body.data
    
    let tableAttributes = req.body.tableAttributes
    let additionalAttributes = ['password', 'network', 'area', 'district_id', 'upline', 'status', 'role', 'active', 'created_at']
    tableAttributes.push(...additionalAttributes)
    
    let additionalValues = [password, Number(req.body.network), req.body.area, req.body.district_id, req.body.upline, status, role, active, created_at ]
    
    let bulkInsertWalletData = []
    let walletAttributes = ['user_id', 'username', 'account_id', 'agent_loper_biller', 'type', 'efective_balance', 'temporary_balance', 'efective_point', 'temporary_point', 'batas_limit', 'created_at']

    bulkInsertData.forEach(user => {
        // store username for duplicate check
        let username = user[0]
        arrUsername.push(username)
        
        // user data
        user.push(...additionalValues)
        
        let userType = {
            agent_loper_biller : (role === 3) ? "Agent" : (role === 4) ? "Loper" : "Biller",
            type: (role === 3 || role === 4) ? "K" : "D",
        }

        let userWallet = [ username, username, userType.agent_loper_biller, userType.type, 0, 0, 0, 0, 0, created_at ]

        bulkInsertWalletData.push(userWallet)
    })

    tbl_user.getUsersDuplicate(arrUsername)
    .then((rows) => {
        if (rows.length > 0) {
            let duplicateUsername = 'Duplicate Username : '

            rows.forEach(duplicate => {
                duplicateUsername = duplicateUsername + duplicate.username + ', '
            })

            result.ResponseCode = "22"
            result.ResponseDesc = 'Duplicate username found!'
            result.ResponseData = duplicateUsername

            logger.info("\n Bulk Insert Response : ", JSON.stringify(result))

            res.json(result)
        } else {
            let bulkInsertQuery = `INSERT INTO users (${ tableAttributes })`
            let bulkInsertWalletQuery = `INSERT INTO wallets (${ walletAttributes })`

            tbl_user.bulkInsertUsers(bulkInsertQuery, bulkInsertData, bulkInsertWalletQuery, bulkInsertWalletData, arrUsername)
            .then(function (response) {

                result.ResponseCode = "00"
                result.ResponseDesc = "Upload Success"
                result.ResponseLog = response

                logger.info("\n Bulk Insert Response :", JSON.stringify(result))

                res.json(result)
            })
            .catch(function (err) {
                result.ResponseCode = "99"
                result.ResponseDesc = err

                logger.info("\n Bulk Insert Response : ", JSON.stringify(result))

                res.json(result)
            })
        }
    })
    .catch((err) => {
        result.ResponseCode = "99"
        result.ResponseDesc = "Failed to Bulk Insert"
        result.ResponseError = err

        logger.info("\n Bulk Insert Response : ", JSON.stringify(result))

        res.json(result)
    })
}

exports.bulkRemove = function(req, res) {
    let result = {}

    let usernames = getAllUsername(req.body.users)
    let noMatchUsernames = []

    for (let index in usernames) {
        let username = usernames[index]

        tbl_user.getUserDetails(username)
        .then(function (rows) {
            if (rows.length === 0) {
                noMatchUsernames.push(username)
            }
        })
        .catch(function (err) {
            result.ResponseCode = "99"
            result.ResponseDesc = "Bulk Delete Users Failed"
            result.ResponseError = err

            logger.info("\n Bulk Delete Response : ", JSON.stringify(result))

            res.json(result)
        })
    }

    let allUsernameExists = noMatchUsernames.length === 0

    if (allUsernameExists) {
        // perform delete users

        let unremovedUsername = []

        let params = {
            'status' : 'Inactive',
            'active' : 0,
            'deleted_at' : moment().format("YYYY-MM-DD HH:mm:ss")
        }

        usernames.forEach(username => {
            tbl_user.updateUser(params, username)
            .then(function (rows) {
                if (rows <= 0) {
                    unremovedUsername.push(username)
                }
            })
            .catch(function (err) {
                result.ResponseCode = "99"
                result.ResponseDesc = "Bulk Delete Users: Failed to Update users Status"
                result.ResponseError = err

                logger.info("\n Users Response : ", JSON.stringify(result))

                res.json(result)
            }) 
        })

        let updateUsernamesSuccess = unremovedUsername.length === 0
        
        result.ResponseDesc = "00"

        if (updateUsernamesSuccess) {
            result.ResponseDesc = "Delete All Users Successfull"
        } else {
            result.ResponseDesc = "Delete All Users Partially Successfull!"
            result.ResponseData = unremovedUsername
        }
        
        logger.info("\n Users Response : ", JSON.stringify(result))
        res.json(result)
        
    } else {
            result.ResponseCode = "99"
            result.ResponseDesc = "Bulk Delete Users: Contains username that does not exist!"
            result.ResponseData = noMatchUsernames

            logger.info("\n Bulk Delete Response : ", JSON.stringify(result))

            res.json(result)
    }


}

exports.addAgentLoper = function(req, res) {
    
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
    let agentPassword = config.default_password
    let hashPassword = md5(md5(agentPassword).substring(0,16)+config.salt_key).substring(0,16)
    let dashboard_url = config.dashboard_url
    var result = {}

    var data = {
        username: req.body.username,
        password: hashPassword,
        name: req.body.name,
        phone_number: req.body.phone_number,
        alamat: (req.body.alamat) ? (req.body.alamat) : (null),
        district_id: (req.body.district_id) ? (req.body.district_id) : (null),
        area: req.body.area,
        email: req.body.email,
        profile_img: (req.body.profile_img) ? (req.body.profile_img) : (null),
        noktp:  (req.body.noktp) ? (req.body.noktp) : (null),
        npwp:  (req.body.npwp) ? (req.body.npwp) : (null),
        siup:  (req.body.siup) ? (req.body.siup) : (null),
        status: 'Inactive',
        nama_bank:  (req.body.nama_bank) ? (req.body.nama_bank) : (null),
        rekening_bank:  (req.body.rekening_bank) ? (req.body.rekening_bank) : (null),
        keagenan_number: (req.body.keagenan_number) ? (req.body.keagenan_number) : (null),
        status_keagenan: (req.body.status_keagenan) ? (req.body.status_keagenan) : (null),
        network: req.body.network,
        upline: req.body.upline,
        status_transaction: (req.body.status_transaction) ? (req.body.status_transaction) : (null),
        role: req.body.role,
        active: 1,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    
    logger.info("\n Request Add Agent / Loper : ", JSON.stringify(data));
    
    if (!field){
        field += " users.username = ?";    
    }
    value.push(data.username);

    tbl_user.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Username already exists');
        }

        return tbl_user.createAgentLoper(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {
            return tbl_network.getNetworkDetails(data.network)
        }
    })
    .then(function (dataNetwork) {
        logger.info('\n Response Get Data Network : ', JSON.stringify(dataNetwork))

        let networkName = null
        let networkSenderEmail = null
        let networkUrlWebsite = null

        if (dataNetwork.length < 1) { 
            logger.info("\n No data network available with ID : ", data.network)
            return Promise.reject('No data network available')
        } else {
            networkName = dataNetwork[0].network
            networkSenderEmail = dataNetwork[0].sender_email
            networkUrlWebsite = dataNetwork[0].url_website

            req.body.networkName = networkName
            req.body.networkSenderMail = networkSenderEmail
            req.body.subject = `Pendaftaran Anggota ${ networkName } Diterima`
            req.body.message = `Selamat bergabung menjadi anggota ${ networkName }!;;
                                Berikut ini adalah info akun Anda : ;;
                                Username : ${ data.username } ;
                                Password : ${ agentPassword } ;;
                                Silakan Login di aplikasi ${ networkName } dan segera ganti Password Anda dengan yang baru untuk aktivasi akun Anda. ;
                                Setelah aktivasi akun berhasil, Anda dapat menikmati berbagai layanan di aplikasi ${ networkName }. ;;
                                Untuk info lebih lanjut kamu dapat mengakses link ini ${ networkUrlWebsite } ;;
                                Salam`

            mail.sendMail(req)
            .then(function(responseMail) {
        
                result.ResponseCode = auth_resp.status
                result.ResponseDesc = "Create Agent / Loper Success!";
                result.ResponseMailUser = responseMail.message
                result.ResponseMailLog = responseMail.mailLog
        
                logger.info('\n Create Agent/Loper Success : ', JSON.stringify(result))
                
                res.send(result)
            })
            .catch(function (err) {
                // catching send mail failed after successful user create
                result.ResponseCode = "501"
                result.ResponseDesc = 'Send Mail Failed'
                
                logger.info("\n Create Agent/Loper Error Response : ", JSON.stringify(result))
                
                res.send(result)
            })
        }
    })
    .catch(function (errors) {
        result.ResponseCode = "500"
        result.ResponseDesc = errors

        logger.info("\n Create Agent/Loper Response : ", JSON.stringify(result))
        
        res.json(result)
    })
}

exports.editAgentLoper = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var username = req.body.username
    var params = {
        
        name: req.body.name,
        phone_number: req.body.phone_number,
        alamat: (req.body.alamat) ? (req.body.alamat) : (null),
        district_id: (req.body.district_id) ? (req.body.district_id) : (null),
        area: req.body.area,
        email: req.body.email,
        profile_img: (req.body.profile_img) ? (req.body.profile_img) : (null),
        noktp:  (req.body.noktp) ? (req.body.noktp) : (null),
        npwp:  (req.body.npwp) ? (req.body.npwp) : (null),
        siup:  (req.body.siup) ? (req.body.siup) : (null),
        status: req.body.status,
        nama_bank:  (req.body.nama_bank) ? (req.body.nama_bank) : (null),
        rekening_bank:  (req.body.rekening_bank) ? (req.body.rekening_bank) : (null),
        keagenan_number: (req.body.keagenan_number) ? (req.body.keagenan_number) : (null),
        status_keagenan: (req.body.status_keagenan) ? (req.body.status_keagenan) : (null),
        network: req.body.network,
        upline: req.body.upline,
        status_transaction: (req.body.status_transaction) ? (req.body.status_transaction) : (null),
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    var result = {}

    logger.info("\n Request Edit Users : ", JSON.stringify(params));

    tbl_user.updateUser(params,username)
    .then(function (rows) {
        if (rows <= 0) {
            return Promise.reject('No rows Edited');
        } else {
            
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Edit Users Success";
            result.ResponseData = rows;
            logger.info("\n Users Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Users Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}

exports.registerUser = function(req, res) {

    // var token = (req.headers.token) ? req.headers.token : null

    // //VERIFY JWT
    // let auth_resp = auth.verify(token)
    // if(auth_resp.status!=="200"){
    //     res.send(auth_resp)
    //     return false
    // }

    var field = "";
    var value = [];
    var orderBy = "";
    let agentPassword = config.default_password
    let hashPassword = md5(md5(agentPassword).substring(0,16)+config.salt_key).substring(0,16)
    var result = {}

    var data = {
        username: req.body.username,
        name: req.body.name,
        password: hashPassword,
        alamat: (req.body.alamat) ? (req.body.alamat) : (null),
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
        gender:  (req.body.gender) ? (req.body.gender) : (null),
        birth_place:  (req.body.birth_place) ? (req.body.birth_place) : (null),
        birth_date:  (req.body.birth_date) ? (req.body.birth_date) : (null),
        district_id:  (req.body.district_id) ? (req.body.district_id) : (null),
        komisariat_id:  (req.body.komisariat_id) ? (req.body.komisariat_id) : (null),
        lk:  (req.body.lk) ? (req.body.lk) : (null),
        mosque_id:  (req.body.mosque_id) ? (req.body.mosque_id) : (null),
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Add Agent / Loper : ", JSON.stringify(data));
    
    if (!field){
        field += " users.username = ?";    
    }
    value.push(data.username);

    tbl_user.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Username already exists');
        }

        return tbl_user.createAgentLoper(data)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {
            
            tbl_network.getNetworkDetails(data.network)
            .then(function (dataNetwork) {
                let networkName = null
                let networkSenderEmail = null
                let networkUrlWebsite = null

                if (dataNetwork.length < 1) { 
                    logger.info("\n No data network available with ID : ", data.network) 
                } else {
                    networkName = dataNetwork[0].network
                    networkSenderEmail = dataNetwork[0].sender_email
                    networkUrlWebsite = dataNetwork[0].url_website
                }

                result.ResponseCode = "200"
                result.ResponseDesc = "Create Agent / Loper Success!";
                result.ResponseData = rows;

                logger.info("\n Users Response : ", JSON.stringify(result));
                
                req.body.networkName = networkName
                req.body.networkSenderMail = networkSenderEmail
                req.body.subject = `Pendaftaran Anggota ${ networkName } Diterima`
                req.body.message = `Selamat bergabung menjadi anggota ${ networkName }!;
                    ;
                    Berikut ini adalah info akun Anda : ;
                    ;
                    Username : ${ data.username } ;
                    Password : ${ agentPassword } ;
                    ;
                    Silakan Login di aplikasi ${ networkName } dan segera ganti Password Anda dengan yang baru untuk aktivasi akun Anda. ;
                    Setelah aktivasi akun berhasil, Anda dapat menikmati berbagai layanan di aplikasi ${ networkName }. ;
                    ;
                    Untuk info lebih lanjut kamu dapat mengakses link ini ${ networkUrlWebsite } ;
                    ;
                    Salam`;

                mail.sendMail(req)
                .then(function(response) {
                    result.ResponseMailUser = response.message
                    result.ResponseMailLog = response.mailLog
                    logger.info("\n Register User Success : ", JSON.stringify.result);
                    
                    res.send(result)
                })
                .catch(function() {                    
                    return Promise.reject("Send Mail to User Email Failed")
                })
            }).catch(function (errors) {
                return Promise.reject("Get Network Failed")
            })
            
        }
    }).catch(function (errors) {
        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Create Agent/Loper Response : ", JSON.stringify(result));
        res.send(result)
    })
}

exports.createMasjid = function(req, res){

    var field = "";
    var value = [];
    var orderBy = "";
    let agentPassword = config.default_password
    let hashPassword = md5(md5(agentPassword).substring(0,16)+config.salt_key).substring(0,16)
    var result = {}

    var data = {
        username: req.body.username,
        name: req.body.name,
        password: hashPassword,
        alamat: (req.body.alamat) ? (req.body.alamat) : (null),
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
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Add Agent / Loper : ", JSON.stringify(data));
    
    if (!field){
        field += " users.username = ?";    
    }
    value.push(data.username);

    tbl_user.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length > 0){
            return Promise.reject('Username already exists');
        }

        return tbl_mosque.createMasjidAsUser(data)
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

                    tbl_mosque.add(rows, req.body.district_id)
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
    }).catch(function (errors) {
        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Create Agent/Loper Response : ", JSON.stringify(result));
        res.send(result)
    })

}