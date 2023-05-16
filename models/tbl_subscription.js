const db = require('../config/database.js')

exports.getSubscriptions = function (field, value) {
    let subscriptionsQuery = 'SELECT * FROM subscription_models'

    if (field) {
        subscriptionsQuery += ` WHERE ${ field }`
    }

    return new Promise(function (resolve, reject) {
        db.get().query(subscriptionsQuery, value, function(err, rows) {
            if (err) {
                reject (err)
            } else {
                resolve (rows)
            }
        })
    })
}

exports.deleteSubscription = function(id) {
    return new Promise(function (resolve, reject) {
        db.get().query("DELETE FROM subscription_models WHERE id = ?", [id], function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        } )
    })
}

exports.insertSubscription = function(data) {
    return new Promise (function (resolve, reject) {
        db.get().query("INSERT INTO subscription_models SET ?", [data], function(err, rows) {
            if (err) {
                reject(err)
            } else (
                resolve(rows)
            )
        })
    })
}

exports.getUnusedSubscriptionModelEdit = function (oldName, newName) {
    return new Promise(function (resolve, reject) {
        db.get().query(`SELECT * FROM subscription_models WHERE name NOT IN ('${ oldName }') AND name = '${ newName }'`, function(err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.updateSubscription = function(data, id) {
    return new Promise(function (resolve, reject) {
        db.get().query("UPDATE subscription_models SET ? WHERE id = ?", [data, id], function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.getSubscriptionLogs = function(field, value, sortField) {
    let subscriptonLogsQuery = `SELECT subscription_models.name as subscription_name, subscription_models.role, network.network, users.name as user_name, subscription_logs.* FROM subscription_logs 
	                                LEFT JOIN subscription_models ON subscription_logs.subscription_model_id = subscription_models.id
                                    LEFT JOIN network ON subscription_logs.network_id = network.id
                                    LEFT JOIN users ON subscription_logs.user_id = users.id`

    if (field) {
        subscriptonLogsQuery += ' WHERE ' + field
    }

    subscriptonLogsQuery += sortField

    return new Promise(function (resolve, reject) {
        db.get().query(subscriptonLogsQuery, value, function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}