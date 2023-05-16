var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    return new Promise(function (resolve, reject) {        
        if(field.length === 0){
            db.get().query('SELECT * FROM groups WHERE deleted_at IS NULL' + orderBy, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.get().query('SELECT * FROM groups WHERE deleted_at IS NULL AND ' + field + orderBy, value, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }
    });
};

exports.searchReplacementName = function (oldName, newName) {
    return new Promise(function (resolve, reject) {
        db.get().query(`SELECT * FROM groups WHERE name NOT IN ('${ oldName }') AND name = '${ newName }' AND deleted_at IS NULL`, function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.getRoleRights = function (id) {
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

exports.getPageRights = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT groups_roles.*, menu_page_react.page_id, menu_page_react.page_name, menu_page_react.page_url, menu_page_react.menu_id, menu_react.display_name, menu_react.icon_class, menu_page_react.page_order, menu_page_react.class_icon FROM groups INNER JOIN groups_roles ON groups.id = groups_roles.group_id INNER JOIN menu_page_react ON groups_roles.menu_id = menu_page_react.page_id INNER JOIN menu_react ON menu_page_react.menu_id = menu_react.menu_id WHERE groups.id = ? AND menu_page_react.hide = 0 ORDER BY menu_page_react.menu_id, menu_page_react.page_order', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.insertRoleRights = function (id,data) {
    return new Promise(function (resolve, reject) {
        db.get().beginTransaction(function (err){
            if(err) {
                db.get().rollback(function (){
                    reject(err);
                })
            }
            else{
                db.get().query('DELETE FROM groups_roles WHERE group_id = ?', [id], function (del_err, del_rows) {
                    if (del_err) {
                        db.get().rollback(function (){
                            reject(del_err);
                        })
                    } else {
                        db.get().query('INSERT INTO groups_roles (`group_id`, `menu_id`, `create`, `read`, `update`, `delete`, `approve`) VALUES ?', [data], function (ins_err, ins_rows) {
                            if (ins_err) {
                                db.get().rollback(function (){
                                    reject(ins_err);
                                })
                            } else {
                                db.get().commit(function (commit_errors){
                                    if(commit_errors){
                                       db.get().rollback(function (){
                                            reject(commit_errors);
                                        }) 
                                    }
                                    resolve(ins_rows);
                                });
                            }
                        });
                    }
                });
            }
        })
    });
};

exports.checkUsedRole = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('SELECT groups.id, users.username FROM groups, users WHERE groups.id = users.role AND groups.id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

exports.createRole = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO groups SET ?', [data], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

exports.updateRole = function (param_data, id) {
    return new Promise(function (resolve, reject) {
        db.get().query('UPDATE groups SET ? WHERE id = ?', [param_data, id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

exports.deleteRole = function (id) {
    return new Promise(function (resolve, reject) {
        db.get().query('DELETE FROM groups WHERE id = ?', [id], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.affectedRows);
            }
        });
    });
};

