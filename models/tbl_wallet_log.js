var db = require('../config/database.js');

exports.searchWalletLogs = function (field, value, orderBy, fieldLimit) {
    console.log('models : ', { field, value, orderBy, fieldLimit })
    return new Promise (function (resolve, reject) {
        db.get().beginTransaction(function (transactionErr) {
            if (transactionErr) {
                db.get().rollback(function () {
                    reject(transactionErr)
                })
            } else {
                // joins query with WHERE if conditions exists
                field = (field) ? (' WHERE ' + field) : ('')

                db.get().query('SELECT COUNT(*) as totalRows FROM wallet_logs LEFT JOIN users ON wallet_logs.user_id = users.username' + field + orderBy, value, function (errCountRows, resCountRows) {
                    if (errCountRows) {
                        db.get().rollback(function () {
                            reject(errCountRows)
                        })

                    } else {
                        db.get().query('SELECT wallet_logs.*, users.name as userName, users.network FROM wallet_logs LEFT JOIN users ON wallet_logs.user_id = users.username' + field + orderBy + fieldLimit, value, function (errFetch, rowsFetch) {
                            if (errFetch) {
                                db.get().rollback(function () {
                                    reject(errFetch)
                                })
                            } else {
                                db.get().commit(function (errCommit) {
                                    if (errCommit) {
                                        db.get().rollback(function () {
                                            reject(errCommit)
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
