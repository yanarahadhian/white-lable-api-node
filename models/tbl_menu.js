var db = require('../config/database.js');

exports.getAllMenu = function (orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM menu_react ' + orderBy, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getAllPage = function (field, value, orderBy) {
    if (field) {
        field = ' WHERE' + field
    }

    return new Promise(function (resolve, reject) {
        db.get().query('SELECT menu_page_react.*, menu_react.display_name as menu_name FROM menu_page_react LEFT JOIN menu_react ON menu_page_react.menu_id = menu_react.menu_id' + field + orderBy, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.searchMenu = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM menu_react WHERE ' + field + orderBy, value, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getMenuDetails = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT * FROM menu_react WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.getRoleMenu = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT groups_roles.* FROM groups INNER JOIN groups_roles ON groups.id = groups_roles.group_id WHERE groups.id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.createMenu = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO menu_react SET ?', [data], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

exports.updateMenu = function (param_data, id) {
    return new Promise(function (resolve, reject) {
        db.get().query('UPDATE menu_react SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.deleteMenu = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('DELETE FROM menu_react WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.createMenuPage = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO menu_page_react SET ?', [data], function (err, rows) {
            if (err) {
                reject (err)
            } else {
                resolve (rows)
            }
        })
    })
}

exports.updateMenuPage = function (data, page_id) {
    return new Promise(function (resolve, reject) {
        db.get().query('UPDATE menu_page_react SET ? WHERE page_id = ?', [data, page_id], function (err, rows) {
            if (err) {
                reject (err)
            } else {
                resolve (rows)
            }
        })
    })
}

exports.removeMenuPage = function (page_id) {
    return new Promise(function (resolve, reject) {

        db.get().beginTransaction(function (transaction_err) {
            if (transaction_err) {
                db.get().rollback(function() {
                    reject(transaction_err)
                })
            } else {
                // PERFORM DELETE PAGE
                db.get().query('DELETE FROM menu_page_react WHERE page_id = ?', page_id, function (remove_page_err, page_rows) {
                    if (remove_page_err) {
                        db.get().rollback(function() {
                            reject (remove_page_err)
                        })
                    } else {
                        // PERFORM DELETE 
                        db.get().query('DELETE FROM groups_roles WHERE menu_id = ?', page_id, function (remove_groups_err, groups_rows) {
                            if (remove_groups_err) {
                                db.get().rollback(function() {
                                    reject (remove_groups_err)
                                })
                            } else {
                                db.get().commit(function(commit_err) {
                                    if (commit_err) {
                                        db.get().rollback(function() {
                                            reject(commit_err)
                                        })
                                    } else {
                                        resolve({ page_rows, groups_rows })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}