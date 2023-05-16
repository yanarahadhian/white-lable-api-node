var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT bt.*, us.network as network_id, us.name as user_name, us.id as user_id, ar.area as city, net.network FROM bantuans bt INNER JOIN users us ON bt.user = us.username LEFT JOIN areas ar ON us.area = ar.id LEFT JOIN network net ON us.network = net.id WHERE bt.deleted_at IS NULL' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT bt.*, us.network as network_id, us.name as user_name, us.id as user_id, ar.area as city, net.network FROM bantuans bt INNER JOIN users us ON bt.user = us.username LEFT JOIN areas ar ON us.area = ar.id LEFT JOIN network net ON us.network = net.id WHERE bt.deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }
    });
};

exports.searchDetails = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM bantuan_details WHERE deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

exports.createDetail = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO bantuan_details SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE bantuans SET ? WHERE id = ?', [param_data, id], function (err, rows) {
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
        db.get().query('DELETE FROM bantuans WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};