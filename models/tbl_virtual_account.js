var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT va.*, us.name, us.network FROM virtual_accounts va INNER JOIN users us ON us.username = va.user_id WHERE va.deleted_at IS NULL' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT va.*, us.name, us.network FROM virtual_accounts va INNER JOIN users us ON us.username = va.user_id WHERE va.deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }
    });
};

