const moment = require('moment')

var db = require('../config/database.js');

exports.getProductUploadLogsByFileId = function (file_id) {
    return new Promise(function (resolve, reject) {
        db.get().query(`SELECT 	logs.*, 
                                files.filename, 
                                files.product_type_id, 
                                types.product_type, 
                                files.biller_host_id, 
                                biller_hosts.account_id,
                                biller_hosts.name as biller_name, 
                                biller_hosts.host_name, 
                                biller_hosts.host_ip,
                                files.network_id, 
                                network.network,
                                files.area_id, 
                                areas.area, 
                                files.agent_id, 
                                agent.name as agent_name, 
                                files.uploaded_by, 
                                uploader.name as uploader_name, 
                                files.uploaded_at
                        FROM product_upload_logs logs
                        LEFT JOIN product_upload_files files
                            ON logs.file_id = files.id
                        LEFT JOIN product_types types
                            ON files.product_type_id = types.id
                        LEFT JOIN biller_hosts
                            ON files.biller_host_id = biller_hosts.id
                        LEFT JOIN areas
                            ON files.area_id = areas.id
                        LEFT JOIN network
                            ON files.network_id = network.id
                        LEFT JOIN users agent
                            ON files.agent_id = agent.id
                        LEFT JOIN users uploader
                            ON files.uploaded_by = uploader.id
                            WHERE file_id = ? AND logs.deleted_at IS NULL`, [file_id], function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve (rows)
            }
        })
    })
}

exports.delete = function (file_id) {
    let deleteTime = moment().format("YYYY-MM-DD HH:mm:ss")

    return new Promise(function (resolve, reject) {
        db.get().beginTransaction(function (transaction_err) {
            if (transaction_err) {
                db.get().rollback(function () {
                    reject(transaction_err)
                })
            } else {
                db.get().query(`UPDATE product_upload_files SET deleted_at = ? WHERE id = ?`, [deleteTime, file_id] , function (deleteFileError, deleteFileRows) {
                    if (deleteFileError) {
                        db.get().rollback(function () {
                            reject(deleteFileError)
                        })
                    } else {
                        db.get().query(`UPDATE product_upload_logs SET deleted_at = ? WHERE file_id = ?`, [deleteTime, file_id], function (deleteProductLogsError, deleteProductLogsRows) {
                            if (deleteProductLogsError) {
                                db.get().rollback(function () {
                                    reject(deleteProductLogsError)
                                })
                            } else {
                               db.get().commit(function (commit_errors) {
                                   if (commit_errors) {
                                       db.get().rollback(function () {
                                           reject(commit_errors)
                                       })
                                   }

                                   resolve({ deleteFileRows, deleteProductLogsRows })
                               })
                            }
                        })
                    }
                })
            }
        })
    })
}

exports.create = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO product_upload_logs SET ?', [data], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}