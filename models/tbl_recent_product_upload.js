var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    let condition = ''
    
    if (field) {
        condition = ` AND ${ field }`
    }

    if (orderBy) {
        condition += orderBy
    }

    return new Promise(function (resolve, reject) {
        db.get().query(`SELECT	pu.*, 
                                pt.product_type,
                                bl.name as biller_host,
                                net.network,
                                ar.area,
                                us.name as agent
                        FROM product_model_uploads pu 
                        LEFT JOIN product_types pt ON pu.product_type_id = pt.id 
                        LEFT JOIN biller_hosts bl ON pu.biller_host_id = bl.id
                        LEFT JOIN users us ON pu.user_id = us.id
                        LEFT JOIN network net ON us.network = net.id
                        LEFT JOIN areas ar ON us.area = ar.id WHERE pu.deleted_at IS NULL${ condition }`, value, function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.create = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO product_model_uploads SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE product_model_uploads SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};