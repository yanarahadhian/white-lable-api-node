let db = require('../config/database.js')

exports.getAllBanks = function () {
    return new Promise( function (resolve, reject) {
        db.get().query('SELECT * FROM banks WHERE deleted_at IS NULL', function (err, rows) {
            if (err) {
                reject (err)
            } else {
                resolve (rows)
            }
        })
    })
}