var db = require('../config/database.js');
var moment = require('moment');

exports.getAllLoper = function () {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.username, users.name, users.email, users.alamat, users.noktp, users.npwp, users.siup, users.rekening_bank, users.nama_bank, users.phone_number, areas.area, users.upline, users.status, users.created_at FROM users LEFT JOIN areas ON areas.id = users.area LEFT JOIN groups ON users.role = groups.id WHERE groups.id = 4 AND active = 1', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAllLoperOrderBy = function (orderBy) {
    return new Promise(function (resolve, reject) {
        // db.get().query('SELECT users.username, users.name, network.network, users.email, users.alamat, users.noktp, users.npwp, users.siup, users.rekening_bank, users.nama_bank, users.phone_number, areas.area, users.upline, users.status, users.created_at FROM users LEFT JOIN areas ON areas.id = users.area LEFT JOIN groups ON users.role = groups.id LEFT JOIN network ON network.id = users.network WHERE groups.id = 4 AND active = 1' + orderBy, function (err, rows) {
        db.get().query('SELECT users.username, users.name, upline.name as upline_name, network.network, users.email, users.alamat, users.noktp, users.npwp, users.siup, users.rekening_bank, users.nama_bank, users.phone_number, areas.area, users.status, users.created_at FROM users LEFT JOIN areas ON areas.id = users.area LEFT JOIN groups ON users.role = groups.id LEFT JOIN network ON network.id = users.network LEFT JOIN users as upline ON upline.id = users.upline WHERE groups.id = 4 AND users.active = 1' + orderBy, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.searchLoper = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {
        // db.get().query('SELECT users.username, users.name, users.email, users.alamat, users.noktp, users.npwp, users.siup, users.rekening_bank, users.nama_bank, users.phone_number, network.network,areas.area, users.upline, users.status, users.created_at FROM users LEFT JOIN areas ON areas.id = users.area LEFT JOIN network ON users.network = network.id WHERE ' + field + orderBy, value, function (err, rows) {
        db.get().query('SELECT users.username, upline.name as upline_name, users.name as name, users.email, users.alamat, users.noktp, users.npwp, users.siup, users.rekening_bank, users.nama_bank, users.phone_number, network.network, areas.area, users.status, users.created_at FROM users as users LEFT JOIN areas ON areas.id = users.area LEFT JOIN network ON users.network = network.id LEFT JOIN users as upline ON upline.id = users.upline WHERE ' + field + orderBy, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getLoperDetails = function (username) {
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

exports.getUplines = function (area) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.id, users.name FROM users, groups WHERE users.role = groups.id AND groups.id = 3 AND users.area = ? AND active = 1', [area], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.createLoper = function (data) {
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

exports.updateLoper = function (param_data, username) {
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

exports.deleteLoper = function (username) {
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
