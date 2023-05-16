var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT products.*, network.network, areas.area FROM products LEFT JOIN users ON products.agen = users.id LEFT JOIN network ON users.network = network.id LEFT JOIN areas ON products.area = areas.id WHERE ' + field + orderBy, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.checkDuplicateProduct = function (sku,agen) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM products WHERE sku = ? AND agen = ?', [sku, agen], function (err, rows) {
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
        db.get().query('INSERT INTO products SET ?', [data], function (err, rows) {
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
        db.get().query('UPDATE products SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.delete = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('DELETE FROM products WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.getAllProductType = function () {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM product_types', function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};