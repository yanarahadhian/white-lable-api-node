var db = require('../config/database.js');
var moment = require('moment');

exports.getAllAgent = function () {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.username, users.name, users.email, users.alamat, users.noktp, users.npwp, users.siup, users.rekening_bank, users.nama_bank, users.phone_number, areas.area, users.upline, users.status, users.created_at FROM users LEFT JOIN areas ON areas.id = users.area LEFT JOIN groups ON users.role = groups.id WHERE groups.id = 3 AND active = 1', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAllAgentOrderBy = function (orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.username, users.name, upline.name as upline_name, users.email, users.alamat, users.noktp, users.npwp, users.siup, users.rekening_bank, users.nama_bank, users.phone_number, network.network, areas.area, users.status, users.created_at, virtual_accounts.status as va_status FROM jpx_db.users LEFT JOIN jpx_db.network ON users.network = network.id LEFT JOIN jpx_db.areas ON areas.id = users.area LEFT JOIN jpx_db.groups ON users.role = groups.id LEFT JOIN jpx_db.virtual_accounts ON users.phone_number = virtual_accounts.user_id LEFT JOIN jpx_db.users as upline ON upline.id = users.upline WHERE groups.id = 3 AND users.active = 1' + orderBy, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.searchAgent = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.username, users.name, upline.name as upline_name, users.email, users.alamat, users.noktp, users.npwp, users.siup, users.rekening_bank, users.nama_bank, users.phone_number, areas.area, network.network, users.status, users.created_at, virtual_accounts.status as va_status FROM users LEFT JOIN network ON users.network = network.id LEFT JOIN areas ON areas.id = users.area LEFT JOIN virtual_accounts ON users.phone_number = virtual_accounts.user_id LEFT JOIN users as upline ON upline.id = users.upline WHERE ' + field + orderBy, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAgentDetails = function (username) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM users WHERE username = ?', [username], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAllUpline = function () {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.id, users.name FROM users, groups WHERE users.role = groups.id AND groups.id = 3 AND active = 1', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getUplines = function (area, username) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.id, users.name FROM users, groups WHERE users.role = groups.id AND groups.id = 3 AND active = 1 AND users.area = ? AND username <> ?', [area, username], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.listByParam = function (params) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM users WHERE ?', [params], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.createAgent = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().beginTransaction(function (err){
            if(err) {
                db.get().rollback(function (){
                    reject(err);
                })
            }
            else{
                db.get().query('INSERT INTO users SET ?', [data], function (users_errors, users_rows) {
                    if (users_errors) {
                        db.get().rollback(function (){
                            reject(users_errors);
                        })
                    } else {

                        var wallet = {
                            user_id: users_rows.insertId,
                            username: data.username,
                            account_id: data.username,
                            agent_loper_biller: (data.role === 3) ? "Agent" : (data.role === 4) ? "Loper" : "Biller",
                            type: (data.role === 3 || data.role === 4) ? "K" : "D",
                            efective_balance: 0,
                            temporary_balance: 0,
                            efective_point: 0,
                            temporary_point: 0,
                            batas_limit: 0,
                            created_at: moment().format("YYYY-MM-DD HH:mm:ss")
                        }

                        db.get().query('INSERT INTO wallets SET ?', [wallet], function (wallet_errors, wallet_rows) {
                            if (wallet_errors) {
                                db.get().rollback(function (){
                                    reject(wallet_errors);
                                })
                            } else {
                                db.get().commit(function (commit_errors){
                                    if(commit_errors){
                                       db.get().rollback(function (){
                                            reject(commit_errors);
                                        }) 
                                    }
                                    resolve(wallet_rows);
                                });
                            }
                        })
                    }
                })
            }    
        })
    })
}

exports.updateAgent = function (param_data, username) {
    return new Promise(function (resolve, reject) {
        db.get().query('UPDATE users SET ? WHERE username = ?', [param_data, username], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.deleteAgent = function (username) {
    return new Promise(function (resolve, reject) {
        db.get().query('DELETE FROM users WHERE username = ?', [username], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};