const db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    let querySearch = 'SELECT dis.*, ar.area, pro.province_name FROM districts dis LEFT JOIN areas ar ON ar.id = dis.area_id LEFT JOIN provinces pro ON pro.id = dis.province_id WHERE dis.deleted_at IS NULL'

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

exports.checkUsedDistrict = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT districts.id, users.name FROM districts, users WHERE districts.id = users.district_id AND districts.id = ?', [id], function (err, rows) {
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
        db.get().query('INSERT INTO districts SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE districts SET ? WHERE id = ?', [param_data, id], function (err, rows) {
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
        db.get().query('INSERT INTO districts (district_name, province_id, area_id, created_at) VALUES ?', [bulkInsertData], function(err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

// exports.getAreaByIdProvinsi = function(idProvinsi){
//     return new Promise(function (resolve, reject) {
//         db.get().query('SELECT areas.id, areas.area FROM areas INNER JOIN districts ON districts.province_id = ? WHERE areas.id = districts.area_id AND areas.deleted_at IS NULL',[idProvinsi], function (err, rows) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//         });
//     });
// };

// exports.getDistrictByIdArea = function(idArea){
//     return new Promise(function (resolve, reject) {
//         db.get().query('SELECT districts.id, districts.nama_kecamatan FROM districts WHERE districts.id_area = ?',[idArea], function (err, rows) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//         });
//     });
// };