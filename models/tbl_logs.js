var db = require('../config/database.js');

exports.getAllTransactionLogs = function (orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM transaction_logs ORDER BY id', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.searchTransactionLogs = function (field, value) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM transaction_logs WHERE ' + field, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getTransactionLogs = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM transaction_logs WHERE id ='+id, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.writeTransactionLog = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO transaction_logs SET ?', [data],  function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAllWalletLogs = function (orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT wallet_logs.*, users.name FROM wallet_logs, users WHERE wallet_logs.user_id = users.username', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.searchWalletLogs = function (field, value) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT wallet_logs.*, users.name FROM wallet_logs, users WHERE wallet_logs.user_id = users.username AND ' + field, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getWalletLogs = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM wallet_logs WHERE id ='+id, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};