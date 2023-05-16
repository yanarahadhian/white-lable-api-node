var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    console.log(field, value, orderBy)
    let querySearch = 'SELECT kom.*, cab.cabang_name, bad.badko_name FROM komisariats kom LEFT JOIN cabangs cab ON cab.id = kom.cabang_id LEFT JOIN badkos bad ON bad.id = kom.badko_id WHERE kom.deleted_at IS NULL'

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