var db = require('../config/database.js');
var moment = require('moment');

exports.searchByDistricts = function (id_district) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT mosques.id, mosques.nama_masjid, mosques.alamat_masjid FROM mosques WHERE mosques.district_id = ? AND mosques.deleted_at IS NULL',[id_district], function (err, rows) {
        // db.get().query('SELECT id, name AS nama_masjid, alamat AS alamat_masjid, id AS user_id, role, area, upline FROM users WHERE district_id = ? AND deleted_at IS NULL AND network = ?',[id_district, id_network], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.searchBeta = function(field, fieldLimit) {
    return new Promise(function (resolve, reject) {
        db.get().beginTransaction(function (transactErr) {
            if (transactErr) {
                console.log({transactErr})
                db.get().rollback(function () {
                    reject(transactErr)
                })
            } else {
                db.get().query('SELECT COUNT(*) as totalRows FROM mosques', function (countErr, countRes) {
                    if (countErr) {
                        db.get().rollback(function () {
                            console.log({countErr})
                            reject(countErr)
                        })
                    } else {
                        db.get().query('SELECT * FROM mosques' + fieldLimit, function (fetchErr, fetchRes) {
                            if (fetchErr) {
                                db.get().rollback(function () {
                                    console.log({fetchErr})
                                    reject(fetchErr)
                                })
                            } else {
                                db.get().commit(function (commitErr) {
                                    if (commitErr) {
                                        db.get().rollback(function () {
                                            console.log({commitErr})
                                            reject(commitErr)
                                        })
                                    }

                                    resolve({ countRes, fetchRes })
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}

exports.add = function(data){
    return new Promise(function(resolve, reject){
        db.get().query('INSERT INTO mosques SET ?', [data], function(err, rows){
            if(err){
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

exports.search = function(field, value){
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM mosques WHERE ' + field, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.bulk = function(bulkInsertData) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO mosques (district_id, created_at, nama_masjid, alamat_masjid, approved, registrant) VALUES ?', [bulkInsertData] , function (err, rows) {
            if (err) {
                reject (err)
            } else {
                resolve (rows)
            }
        })
    })

}