var db = require('../config/database.js');

exports.search = function (field, value, orderBy) {
    let condition = ''
    
    if (field) {
        condition = ` AND ${ field }`
    }

    if (orderBy) {
        condition += orderBy
    }

    return new Promise(function (resolve, reject) {
        db.get().query(`SELECT	product_upload_files.*, 
                                product_types.product_type,
                                biller_hosts.name as biller_name,
                                network.network,
                                areas.area,
                                agent.name as agent_name,
                                uploader.name as uploader_name
                        FROM product_upload_files 
                        LEFT JOIN product_types ON product_upload_files.product_type_id = product_types.id 
                        LEFT JOIN biller_hosts ON product_upload_files.biller_host_id = biller_hosts.id
                        LEFT JOIN network ON product_upload_files.network_id = network.id
                        LEFT JOIN areas ON product_upload_files.area_id = areas.id
                        LEFT JOIN users agent ON product_upload_files.agent_id = agent.id
                        LEFT JOIN users uploader ON product_upload_files.uploaded_by = uploader.id WHERE product_upload_files.deleted_at IS NULL${ condition }`, value, function (err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.create = function (data) {
    return new Promise(function (resolve, reject) {
        db.get().query('INSERT INTO product_upload_files SET ?', [data], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}