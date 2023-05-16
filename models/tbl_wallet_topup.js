var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT us.username, us.network as network_id, net.network, wl.* FROM wallet_topup_request wl INNER JOIN users us ON wl.user_id = us.id LEFT JOIN network net ON us.network = net.id WHERE wl.deleted_at IS NULL' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT us.username, us.network as network_id, net.network, wl.* FROM wallet_topup_request wl INNER JOIN users us ON wl.user_id = us.id LEFT JOIN network net ON us.network = net.id WHERE wl.deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }
    });
};

exports.create = function (param_data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO wallet_topup_request SET ?', [param_data], function (err, result) {
            if (err)
                reject(err);
            else
                resolve(result.insertId);
        });
    });
}

exports.update = function (param_data, id) {
    return new Promise(function (resolve, reject) {
        db.get().query('UPDATE wallet_topup_request SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.delete = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('DELETE FROM wallet_topup_request WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

