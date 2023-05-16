var db = require('../config/database.js');
var moment = require('moment');

exports.search = function (value) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT universities.id, universities.nama_universitas FROM universities WHERE universities.nama_universitas LIKE ?', '%' + value + '%', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.createUniversitas = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO universities SET ?', [data], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}
