var db = require('../config/database.js');

exports.search = function (field, value, orderBy, fieldLimit) {
    return new Promise (function (resolve, reject) {
        db.get().beginTransaction(function (transactionErr) {
            if (transactionErr) {
                db.get().rollback(function () {
                    reject(transactionErr)
                })
            } else {
                // joins query with WHERE if conditions exists
                field = (field) ? (' WHERE ' + field) : ('')

                db.get().query('SELECT COUNT(*) as totalRows FROM transaction_logs tl INNER JOIN users ON users.username = tl.user_id_seller LEFT JOIN network net ON net.id = users.network' + field + orderBy, value, function (errCountRows, resCountRows) {
                    if (errCountRows) {
                        db.get().rollback(function () {
                            reject(errCountRows)
                        })
                    } else {
                        db.get().query('SELECT tl.*, users.network, net.network as network_name FROM transaction_logs tl INNER JOIN users ON users.username = tl.user_id_seller LEFT JOIN network net ON net.id = users.network' + field + orderBy + fieldLimit, value, function (errFetch, rowsFetch) {
                            if (errFetch) {
                                db.get().rollback(function () {
                                    reject(errFetch)
                                })
                            } else {
                                db.get().commit(function (commitErr) {
                                    if (commitErr) {
                                        db.get().rollback(function () {
                                            reject(commitErr)
                                        })
                                    }

                                    resolve({ rowsLength : resCountRows[0].totalRows, rowsFetch })
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}

exports.create = function (data) {
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