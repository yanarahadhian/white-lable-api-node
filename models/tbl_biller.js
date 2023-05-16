var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT * FROM biller_hosts WHERE deleted_at IS NULL' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT * FROM biller_hosts WHERE deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }
    });
};

exports.checkUsedBiller = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT biller_hosts.id, biller_hosts.account_id, biller_hosts.name FROM biller_hosts, products WHERE biller_hosts.id = products.biller_host_id AND biller_hosts.id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getUnusedBillerEdit = function (oldBillerName, newBillerName) {
    return new Promise (function (resolve, reject) {
        db.get().query(`SELECT * FROM biller_hosts WHERE name NOT IN ('${ oldBillerName }') AND name = '${ newBillerName }' AND deleted_at IS NULL`, function (err, rows) {
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
        db.get().query('INSERT INTO biller_hosts SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE biller_hosts SET ? WHERE id = ?', [param_data, id], function (err, rows) {
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
        db.get().query('DELETE FROM biller_hosts WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.bulkDelete = function (biller_hosts_id, deleted_at) {
    return new Promise (function (resolve, reject) {
        db.get().query('UPDATE biller_hosts SET deleted_at = ? WHERE id IN (?)', [deleted_at, biller_hosts_id], function (err, rows) {
            if (err) {
                reject (err)
            } else {
                resolve (rows)
            }
        })
    })
}
