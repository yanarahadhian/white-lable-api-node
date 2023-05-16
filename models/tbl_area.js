var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    let querySearch = 'SELECT areas.*, provinces.province_name FROM areas LEFT JOIN provinces ON areas.province_id = provinces.id WHERE areas.deleted_at IS NULL'

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

exports.checkUsedArea = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT areas.id, users.username FROM areas, users WHERE areas.id = users.area AND areas.id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.create = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO areas SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE areas SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.bulkAdd = function(bulkInsertData) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO areas (province_id, area, created_at) VALUES ?', [bulkInsertData] , function(err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}