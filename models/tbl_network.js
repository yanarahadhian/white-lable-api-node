var db = require('../config/database.js');

exports.getAllNetwork = function () {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM network', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getNetworks = function (field, value) {
    let SQLQuery = 'SELECT network.*, senders.sender as sender_name FROM network LEFT JOIN senders ON network.sender_id = senders.id'

    if (field) {
        SQLQuery += ` WHERE ${field}`
    }

    return new Promise(function (resolve, reject) {
        db.get().query(SQLQuery, value, function (err, rows) {
            if (err) {
                reject (err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.getNetworkDetails = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM network WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getNetworkDetailsByName = function (network) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM network WHERE network = ?', [network], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getUnusedNetworkEdit = function (oldNetworkName, newNetworkName) {
    return new Promise(function (resolve, reject) {
        db.get().query(`SELECT * FROM network WHERE network NOT IN ('${ oldNetworkName }') AND network = '${ newNetworkName }' AND deleted_at IS NULL`, function(err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.checkUsedNetwork = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT network.id, users.username FROM network, users WHERE network.id = users.network AND network.id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.createNetwork = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO network SET ?', [data], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

exports.updateNetwork = function (param_data, id) {
    return new Promise(function (resolve, reject) {
        db.get().query('UPDATE network SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.deleteNetwork = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('DELETE FROM users WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.checkAssetOnAWS = function (asset_url) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT COUNT(*) as file_count FROM network WHERE ? IN (logo, banner, splash_screen, dashboard_logo, favicon)', asset_url, function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}
