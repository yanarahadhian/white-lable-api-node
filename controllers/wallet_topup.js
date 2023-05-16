var tbl_wallet_topup = require('../models/tbl_wallet_topup');
var tbl_wallet = require('../models/tbl_wallet');
var tbl_transaction_log = require('../models/tbl_transaction_log');
var logger = require('../libraries/logger');
var moment = require("moment");
var auth = require('../controllers/auth');


exports.search= function (req, res) {

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
        field += "wl.id = ?";
        value.push(req.query.id);
        if (req.query.username || req.query.network_id || req.query.network || req.query.name || req.query.agen_lopper_biller || req.query.payment_type || req.query.amount || req.query.transfer_receipt || req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.username) {
        field += "us.username like ?";
        value.push("%" + req.query.username + "%");
        if (req.query.network_id || req.query.network || req.query.name || req.query.agen_lopper_biller || req.query.payment_type || req.query.amount || req.query.transfer_receipt || req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.network_id) {
        field += "us.network = ?";
        value.push(req.query.network_id);
        if (req.query.network || req.query.name || req.query.agen_lopper_biller || req.query.payment_type || req.query.amount || req.query.transfer_receipt || req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.network) {
        field += "net.network like ?";
        value.push("%" + req.query.network + "%");
        if (req.query.name || req.query.agen_lopper_biller || req.query.payment_type || req.query.amount || req.query.transfer_receipt || req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.name) {
        field += "wl.name like ?";
        value.push("%" + req.query.name + "%");
        if (req.query.agen_lopper_biller || req.query.payment_type || req.query.amount || req.query.transfer_receipt || req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.agen_lopper_biller) {
        field += "wl.agen_lopper_biller like ?";
        value.push("%" + req.query.agen_lopper_biller + "%");
        if (req.query.payment_type || req.query.amount || req.query.transfer_receipt || req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.payment_type) {
        field += "wl.payment_type like ?";
        value.push("%" + req.query.payment_type + "%");
        if (req.query.amount || req.query.transfer_receipt || req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.amount) {
        field += "wl.amount like ?";
        value.push("%" + req.query.amount + "%");
        if (req.query.transfer_receipt || req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.transfer_receipt) {
        field += "wl.transfer_receipt = ?";
        value.push(req.query.transfer_receipt);
        if (req.query.request_status || req.query.request_date)
            field += " AND ";
    }
    if (req.query.request_status) {
        field += "wl.request_status like ?";
        value.push("%" + req.query.request_status + "%");
        if (req.query.request_date)
            field += " AND ";
    }
    if (req.query.request_date) {
        req.query.request_date = JSON.parse(req.query.request_date)
        field += "DATE(wl.request_date) "+req.query.request_date.comparator+" ?"
        value.push(moment(req.query.request_date.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"))
    }

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

    logger.info("\n Request for Search Topup Wallet : " + JSON.stringify(req.query));

    tbl_wallet_topup.search(field, value, orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            total = rows.length

            if (page !== "all") {
                index = (page - 1) * size
                maxindex = (page * size)
                rows = rows.slice(index, maxindex)   
            }                

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Topup Wallet Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Topup Wallet Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Topup Wallet Response : ", JSON.stringify(result));
        res.json(result)
    
    })
};

exports.add = function (req, res) {

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

    var params = {
        user_id: req.body.user_id,
        name: req.body.name,
        agen_lopper_biller: req.body.agen_lopper_biller,
        phone_number: req.body.phone_number,
        account_id: req.body.account_id,
        payment_type: req.body.payment_type,
        amount: req.body.amount,
        bank_destination: req.body.bank_destination,
        bank_account: req.body.bank_account,
        bank_source: req.body.bank_source,
        bank_account_name: req.body.bank_account_name,
        transfer_receipt: req.body.transfer_receipt,
        created_by: req.body.created_by,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        request_date: moment().format("YYYY-MM-DD HH:mm:ss"),
        request_status: "Verify"
    }
    logger.info("\n Request for Add Top Up Wallet : " + JSON.stringify(req.body));
    
    if (!field){
        field += " wl.user_id = ?";    
    }
    value.push(params.user_id);

    if (!field){
        field += " AND wl.phone_number = ?";    
    }
    value.push(params.phone_number);

    if (!field){
        field += " AND wl.account_id = ?";    
    }
    value.push(params.account_id);

    tbl_wallet.search(field, value, orderBy)
    .then(function (rows) {
        if(rows.length == 0){
            return Promise.reject('Wallet properties does not exist');
        }
        return tbl_wallet_topup.create(params)
    })
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Topup Wallet Success";
            result.ResponseData = rows;
            logger.info("\n Topup Wallet Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Topup Wallet Response : ", JSON.stringify(result));
        res.send(result)
   
    })
};

exports.edit = function (req, res) {
    
    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var param_id = req.body.id;
    var data = {};
    var user_id = "";
    var current_balance = 0
    var amount = 0
    var result = {}

    if (req.body.request_status == "Approved"){
        var param_data = {
            'request_status': req.body.request_status,
            'approved_by'   : req.body.request_by,
            'approved_at'   : req.body.request_at,
        }
    } else {
        var param_data = {
            'request_status' : req.body.request_status,
            'rejected_by'    : req.body.request_by,
            'rejected_at'    : req.body.request_at,
        }
    } 

    logger.info("\n Request for Edit Topup Wallet : " + JSON.stringify(req.body));

    var field = "";
    var value = [];
    var orderBy = "";

    if (!field){
        field += " wl.id = ?";    
    }
    value.push(param_id);

    tbl_wallet_topup.search(field, value, orderBy)
    .then(function (rows) {
        if (rows === null) {
            return Promise.reject('Data not found');
        } else {
            dataRows = rows[0]
            
            field = "";
            value = [];
            orderBy = "";

            if (!field){
                field += " wl.user_id = ?";    
            }
            value.push(dataRows.user_id);

            return tbl_wallet.search(field, value, orderBy)
        }

    }).then(function (wallet_details) {
        if(wallet_details.length > 0){
            current_balance = wallet_details[0].efective_balance
            data = {
                'user_id_seller': dataRows.phone_number,
                'seller_name': dataRows.name,
                'agent_id': dataRows.phone_number,
                'agent_name': dataRows.name,
                'invoice_id': Math.floor(100000 + Math.random() * 900000),
                'type_trans': 11,
                'time_user': moment().format('YYYY-MM-DD hh:mm:ss'),
                'product_id': 0,
                'product': (dataRows.agen_lopper_biller.toLowerCase() === "agent") ? 'TAMBAH SALDO AGENT' : 'TAMBAH SALDO LOPER',
                'sku': 'TOPUP AGENT',
                'billing_id': dataRows.phone_number,
                'billing_denom': dataRows.amount,
                'harga_jual': dataRows.amount,
                'debet_kredit': 'K',
                'balance_before': current_balance,
                'balance_after': current_balance + dataRows.amount,
                'response_time': moment().format('YYYY-MM-DD hh:mm:ss'),
                'created_at': moment().format('YYYY-MM-DD hh:mm:ss'),
                'updated_at': moment().format('YYYY-MM-DD hh:mm:ss')
            }
            return tbl_wallet_topup.update(param_data, param_id)
            .then(function (edit_topup_wallet) {
                if (req.body.request_status != "Approved") {
                    data.status = "Gagal"
                    tbl_transaction_log.create(data).then(function(){
                        result.ResponseCode = auth_resp.status;
                        result.ResponseDesc = "Create Transaction Log Success!";
                        res.send(result);    
                    })
                    .catch(function(errors){
                        result.ResponseCode = "500";
                        result.ResponseDesc = errors;
                        res.send(result);      
                    });
                } else {
                    let wallet_param = {
                        efective_balance: data.balance_after
                    }

                    return tbl_wallet.update(wallet_param, dataRows.user_id)
                    .then(function (wallet){
                        data.status = "Berhasil"
                        tbl_transaction_log.create(data).then(function(){
                            result.ResponseCode = auth_resp.status;
                            result.ResponseDesc = "Create Transaction Log Success!";
                            res.send(result);    
                        })
                        .catch(function(errors){
                            result.ResponseCode = "500";
                            result.ResponseDesc = errors;
                            res.send(result);      
                        });
                    });
                }
            }).then(function (wallet) {
                // Transaction has been committed
                // result is whatever the result of the promise chain returned to the transaction callback

                result.ResponseCode = auth_resp.status
                result.ResponseDesc = "Edit Wallet Success"
                result.ResponseData = wallet 
            })
        }

        logger.info("\n Response for Edit Topup Wallet : ", JSON.stringify(result));
        res.send(result);    

    }).catch(function(errors) {
        result.ResponseCode = "500"
        result.ResponseDesc = errors 

        logger.info("\n Response for Edit Topup Wallet : ", JSON.stringify(result));
        res.send(result);    
    })
}

exports.remove = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var param_id = req.body.id;
    var params = {
        'deleted_at': moment().format("YYYY-MM-DD HH:mm:ss")
    }
    var result = {}

    logger.info("\n Request For Delete Topup Wallet : " + JSON.stringify(req.body));
    
    tbl_wallet_topup.update(params,param_id)
    .then(function (rows){
        if (rows <= 0) {
            return Promise.reject('No Topup Wallet Deleted');
        }
        else{
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Remove Topup Wallet Success";
            result.ResponseData = rows;
            logger.info("\n Topup Wallet Response : ", JSON.stringify(result));

            res.send(result);        
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Topup Wallet Response : ", JSON.stringify(result));
        res.send(result);

    })
};

