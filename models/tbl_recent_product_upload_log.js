var db = require('../config/database.js');

exports.listLogs = function (upload_id) {
    return new Promise(function (resolve, reject) {
        db.get().query(`SELECT * FROM product_model_upload_logs WHERE product_model_upload_id = ? AND deleted_at IS NULL`, [upload_id], function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve (rows)
            }
        })
    })
}

exports.create = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO product_model_upload_logs SET ?', [data], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

exports.update = function (param_data, id) {
    return new Promise(function (resolve, reject) {
        db.get().query('UPDATE product_model_upload_logs SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};