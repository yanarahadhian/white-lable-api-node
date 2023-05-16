var db = require('../config/database.js');
var moment = require('moment');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query(`SELECT users.id, users.name, users.username, users.password, users.salt, users.email, users.gender, users.birth_place, users.birth_date, users.alamat, users.noktp, users.npwp, users.siup, users.phone_number, users.rekening_bank, users.nama_bank, 
                        users.area, areas.area as areaName, users.district_id, districts.district_name as districtName, users.network, network.network as networkName, users.upline, uplines.name as uplineName, users.kode_agen, users.role, groups.name as roleName, groups.level, 
                        users.user_bb, users.pass_bb, users.remember_code, users.last_login, users.ip_address, users.pin_bb, users.profile_img, users.keagenan_number, users.status_keagenan,
                        users.status_transaction, users.komisariat_id, komisariats.komisariat_name as komisariatName, users.universitas, users.pendidikan_terakhir, users.lk, users.mosque_id, mosques.nama_masjid,
                        users.status, users.active, users.activation_code, users.forgotten_password_code, users.forgotten_password_time, users.created_at, users.updated_at, users.deleted_at FROM users 
                            LEFT JOIN areas ON users.area = areas.id 
                            LEFT JOIN groups ON users.role = groups.id 
                            LEFT JOIN network ON users.network = network.id 
                            LEFT JOIN districts ON users.district_id = districts.id
                            LEFT JOIN mosques ON users.mosque_id = mosques.id
                            LEFT JOIN komisariats ON users.komisariat_id = komisariats.id
                            LEFT JOIN users uplines ON users.upline = uplines.id WHERE ` + field + orderBy, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getUplines = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.id, users.name FROM users WHERE ' + field + orderBy, value, function(err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.getUserAuth = function (username) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT users.*, groups.level, network.network as network_name, network.favicon, network.url_website, network.sender_email, network.dashboard_logo FROM users LEFT JOIN groups ON users.role = groups.id LEFT JOIN network ON users.network = network.id WHERE username = ?', [username], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.createUser = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO users SET ?', [data], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

exports.updateUser = function (param_data, username) {
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

exports.deleteUser = function (username) {
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


exports.getUsersDuplicate = function (lopersUsername) {
    return new Promise (function (resolve, reject) {
        db.get().query('SELECT username FROM users WHERE username IN (?)', [lopersUsername], function (err, rows) {
            if (err) {
                reject (err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.bulkInsertUsers = function (bulkInsertQuery, bulkInsertData, bulkInsertWalletQuery, bulkInsertWalletData, usernames) {
    return new Promise(function (resolve, reject) {
        db.get().beginTransaction(function (transaction_err) {
            if (transaction_err) {
                db.get().rollback(function () {
                    reject(transaction_err)
                })
            } else {
                // CREATE NEW USERS
                db.get().query(bulkInsertQuery + ' VALUES ?', [bulkInsertData], function (insert_error, insert_rows) {
                    if (insert_error) {
                        db.get().rollback(function () {
                            reject(insert_error)
                        })
                    } else {
                        // RETRIEVE ID'S FROM CREATED USER IN AFTER PREVIOUS QUERY SUCCEEDED
                        db.get().query('SELECT id, username FROM users WHERE username IN (?)', [usernames], function (username_error, username_rows) {
                            if (username_error) {
                                db.get().rollback(function () {
                                    reject(username_error)
                                })
                            } else {
                                // UNSHIFT (INSERT INT FIRST INDEX) USER_ID IN ARRAY OF WALLET DATA
                                for (let i = 0; i < bulkInsertWalletData.length; i++) {
                                    let usernameData = bulkInsertData[i][0]
                                    
                                    for (let j = 0; j < username_rows.length; j++) {
                                        if (usernameData == username_rows[j].username) {
                                            bulkInsertWalletData[i].unshift(username_rows[j].id)
                                        }
                                    }
                                }

                                // CREATE WALLETS FOR CREATED USERS
                                db.get().query(bulkInsertWalletQuery + ' VALUES ?', [bulkInsertWalletData], function (wallet_errors, wallet_rows) {
                                    if (wallet_errors) {
                                        db.get().rollback(function () {
                                            reject(wallet_errors)
                                        })
                                    } else {
                                        db.get().commit(function (commit_errors) {
                                            if (commit_errors) {
                                                db.get().rollback(function () {
                                                    reject(commit_errors)
                                                })
                                            }

                                            resolve({ insert_rows, wallet_rows })
                                        })
                                    }
                                })
                            }
                        })
                    }
                })   
            }
        })

    })
} 

exports.createAgentLoper = function (data) {
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