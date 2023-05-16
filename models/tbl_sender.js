var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT * FROM senders WHERE senders.deleted_at IS NULL' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT senders.*, network.sender_id, network.network FROM senders LEFT JOIN network ON senders.id = network.sender_id WHERE senders.deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
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
        db.get().query('INSERT INTO senders SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE senders SET ? WHERE id = ?', [param_data, id], function (err, rows) {
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
        db.get().query('DELETE FROM senders WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

