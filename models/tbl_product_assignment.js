var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT pa.*, us.name as agent_name, us.network as network_id, us.area as area_id, us.district_id, net.network, pm.template, pm.scheme FROM product_assigments pa INNER JOIN users us ON pa.user_id = us.id LEFT JOIN network net ON us.network = net.id LEFT JOIN product_models pm ON pa.product_id = pm.id WHERE pa.deleted_at IS NULL' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT pa.*, us.name as agent_name, us.network as network_id, us.area as area_id, us.district_id, net.network, pm.template, pm.scheme FROM product_assigments pa INNER JOIN users us ON pa.user_id = us.id LEFT JOIN network net ON us.network = net.id LEFT JOIN product_models pm ON pa.product_id = pm.id WHERE pa.deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
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
        db.get().query('INSERT INTO product_assigments SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE product_assigments SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};