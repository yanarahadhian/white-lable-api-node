var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    let walletQuery = 'SELECT us.name, us.network as network_id, nw.network as network_name, wl.* FROM wallets wl INNER JOIN users us ON wl.user_id = us.id LEFT JOIN network nw ON us.network = nw.id WHERE wl.deleted_at IS NULL'

    if (field) { walletQuery += ` AND ${ field }` }

    walletQuery += orderBy

    return new Promise(function (resolve, reject) { 
            db.get().query(walletQuery, value, function (err, rows) { 
                if (err) { 
                    reject(err) 
                } else { 
                    resolve(rows) 
                } 
            }) 
    }) 
} 

// exports.getWalletDetailsProperties = function (user_id, username, account_id) {
//     return new Promise(function (resolve, reject) {
//         db.get().query('SELECT * FROM wallets WHERE user_id = ? and username = ? and account_id = ?', [user_id, username, account_id], function (err, rows) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//         });
//     });
// };

exports.update = function (params, id) {
    return new Promise(function (resolve, reject) {
        db.get().query('UPDATE wallets SET ? WHERE id = ?', [params, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};