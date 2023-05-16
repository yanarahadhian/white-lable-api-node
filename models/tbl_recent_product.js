var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT pm.*, pt.product_type, bl.name as biller_name FROM product_models pm INNER JOIN product_types pt ON pm.product_type_id = pt.id LEFT JOIN biller_hosts bl ON pm.biller_host_id = bl.id WHERE pm.deleted_at IS NULL' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT pm.*, pt.product_type, bl.name as biller_name FROM product_models pm INNER JOIN product_types pt ON pm.product_type_id = pt.id LEFT JOIN biller_hosts bl ON pm.biller_host_id = bl.id WHERE pm.deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }
    });
};

exports.create = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO product_models SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE product_models SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.getAllProductType = function () {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM product_types', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};