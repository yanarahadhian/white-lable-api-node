var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT val.*, va.virtual_account_id, users.network FROM virtual_account_logs val INNER JOIN virtual_accounts va ON val.user_id = va.user_id INNER JOIN users ON users.username = val.user_id' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT val.*, va.virtual_account_id, users.network FROM virtual_account_logs val INNER JOIN virtual_accounts va ON val.user_id = va.user_id INNER JOIN users ON users.username = val.user_id WHERE ' + field + orderBy, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }
    });
};