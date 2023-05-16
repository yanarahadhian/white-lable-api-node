var db = require('../config/database.js');

exports.search = function (field, value) {
    return new Promise(function (resolve, reject) {   
        const fieldString = field.split(' ')
        if (fieldString[0] === "users.network" && fieldString[4] !== "users.role") {
            db.get().query("SELECT network, COUNT(*) as total_users FROM users WHERE deleted_at IS NULL AND " + field, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else if (fieldString[0] === "users.role") {
            db.get().query("SELECT role, COUNT(*) as total_users FROM users WHERE deleted_at IS NULL AND " + field, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else if (fieldString[0] === "users.network" && fieldString[4] === "users.role") {
            db.get().query("SELECT network, role, COUNT(*) as total_users FROM users WHERE deleted_at IS NULL AND " + field, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query("SELECT COUNT(*) as total_users FROM users WHERE deleted_at IS NULL AND " + field, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }  
    });
};



exports.activeUsers = function (field, value) {
    return new Promise(function (resolve, reject) { 
        const fieldString = field.split(' ')
        if (fieldString[0] === "users.network" && fieldString[4] !== "users.role") {
            db.get().query(`SELECT statistics.network, COUNT(*) as total_users FROM (
                SELECT DISTINCT(tr_logs.user_id_seller),
                tr_logs.request_time,
                users.role,
                users.network
                FROM jpx_db.transaction_logs tr_logs 
                LEFT JOIN jpx_db.users users ON tr_logs.user_id_seller = users.username 
                RIGHT JOIN jpx_db.network ON users.network = network.id
                WHERE ${field} GROUP BY tr_logs.user_id_seller) as statistics`, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else if (fieldString[0] === "users.role") {
            db.get().query(`SELECT statistics.role, COUNT(*) as total_users FROM (
                SELECT DISTINCT(tr_logs.user_id_seller),
                tr_logs.request_time,
                users.role,
                users.network
                FROM jpx_db.transaction_logs tr_logs 
                LEFT JOIN jpx_db.users users ON tr_logs.user_id_seller = users.username 
                RIGHT JOIN jpx_db.network ON users.network = network.id
                WHERE ${field} GROUP BY tr_logs.user_id_seller) as statistics`, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else if (fieldString[0] === "users.network" && fieldString[4] === "users.role") {
            db.get().query(`SELECT statistics.network, statistics.role, COUNT(*) as total_users FROM (
                SELECT DISTINCT(tr_logs.user_id_seller),
                tr_logs.request_time,
                users.role,
                users.network
                FROM jpx_db.transaction_logs tr_logs 
                LEFT JOIN jpx_db.users users ON tr_logs.user_id_seller = users.username 
                RIGHT JOIN jpx_db.network ON users.network = network.id
                WHERE ${field} GROUP BY tr_logs.user_id_seller) as statistics`, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query(`SELECT COUNT(*) as total_users FROM (
                SELECT DISTINCT(tr_logs.user_id_seller),
                tr_logs.request_time,
                users.role,
                users.network
                FROM jpx_db.transaction_logs tr_logs 
                LEFT JOIN jpx_db.users users ON tr_logs.user_id_seller = users.username 
                RIGHT JOIN jpx_db.network ON users.network = network.id
                WHERE ${field} GROUP BY tr_logs.user_id_seller) as statistics`, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }  
    });
};

exports.growthUsers = function (field, value) {
    return new Promise(function (resolve, reject) { 
        db.get().query(`SELECT DATE_FORMAT(created_at, "%Y-%m-%d") created_at, count(created_at) as total_users FROM users WHERE deleted_at IS NULL AND ${field} GROUP BY DATE_FORMAT(created_at, "%Y-%m-%d")`, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}