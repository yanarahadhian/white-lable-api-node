var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    let querySearch = 'SELECT * FROM badkos WHERE deleted_at IS NULL'

    if (field) {
        querySearch = querySearch + ' AND ' + field
    }

    querySearch += orderBy

    return new Promise(function (resolve, reject) {        
            db.get().query(querySearch, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
    });
};