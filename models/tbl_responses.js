var db = require('../config/database.js');

exports.search = function (status) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM responses WHERE status_code = ?', [status], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};