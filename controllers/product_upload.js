var tbl_product_upload = require('../models/tbl_product_upload');
var logger = require('../libraries/logger');
var moment = require("moment");
var fs = require('fs');
var csv = require('fast-csv');
var auth = require('../controllers/auth');

exports.search = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    let field = ''
    let value = []
    let reqParams = req.query
    let file_id = req.query.file_id
    let { product_type, biller_name, network, area, agent_name, filename, uploader_name } = req.query
 
    let size = (reqParams.size) ? reqParams.size : 5
    let page = (reqParams.page) ? reqParams.page : 1
    
    let index = ''
    let maxIndex = ''
    let orderName = ''

    let result = {}

    // WHERE QUERY PARAMETERS

    if (file_id) {
        field += 'product_upload_files.id = ?'
        value.push(file_id)

        if (product_type || biller_name || network || area || agent_name || filename || uploader_name) {
            field += ' AND '
        }
    }

    if (product_type) {
        field += 'product_types.product_type like ?'
        value.push('%' + product_type + '%')

        if (biller_name || network || area || agent_name || filename || uploader_name) {
            field += ' AND '
        }
    }

    if (biller_name) {
        field += 'biller_hosts.name like ?'
        value.push('%' + biller_name + '%')

        if (network || area || agent_name || filename || uploader_name) {
            field += ' AND '
        }
    }

    if (network) {
        field += 'network.network like ?'
        value.push('%' + network + '%')

        if (area || agent_name || filename || uploader_name) {
            field += ' AND '
        }
    }

    if (area) {
        field += 'areas.area like ?'
        value.push('%' + area+ '%')

        if (agent_name || filename || uploader_name) {
            field += ' AND '
        }
    }

    if (agent_name) {
        field += 'agent.name like ?'
        value.push('%' + agent_name + '%')

        if (filename || uploader_name) {
            field += ' AND '
        }
    }

    if (filename) {
        field += 'product_upload_files.filename like ?'
        value.push('%' + filename + '%')

        if (uploader_name) {
            field += ' AND '
        }
    }

    if (uploader_name) {
        field += 'uploader.name like ?'
        value.push('%' + uploader_name + '%')
    }

    // QUERY ORDER BY

    if (reqParams.orderName) {
        orderBy = ' ORDER BY ' + reqParams.orderName

        if (reqParams.orderBy) {
            orderBy += ` ${ reqParams.orderBy }`
        } else {
            orderBy += ` ASC`
        }
    }

    tbl_product_upload.search(field, value, orderBy)
    .then(function(rows) {
        if (rows <= 0) {
            return Promise.reject('No Rows')
        } else {

            let totalRowsLength = rows.length

            if (page !== 'all') {
                index = (page - 1) * size
                maxIndex = page * size
                rows = rows.slice(index, maxIndex)
            }

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Get All Product Uploads Successful"
            result.ResponseData = rows
            result.ResponseTotalResult = totalRowsLength

            logger.info('\n Product Uploads Response : ', JSON.stringify(result))

            res
                .status(200)
                .send(result)
        }
    })
    .catch(function (error) {
            result.ResponseCode = '500'
            result.ResponseDesc = error

            logger.info('\n Product Uploads Response : ', JSON.stringify(result))

            res.send(result)
    })
}

exports.validationCsv = function(req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var result = {}
    var filename = req.file.originalname;
    
    logger.info("\n Request Validation CSV file : ", JSON.stringify(filename));

    const stream = fs.createReadStream(req.file.path);
    var csvData = [];
    let count = 0;
    var errorCsv = [];
    const streamCsv = csv({
        headers: true,
        delimiter: ';',
        ignoreEmpty: true
    })
    .validate(function(data){
        count += 1
        if (data.sku == '' || data.product_name == '' || data.operator == '' || data.start_date_time == '' || data.end_date_time == '' || data.harga_biller == '' || data.fee_jpx == '' || data.harga_agent == '' || data.fee_agent == '' || data.harga_jual == '' || data.fee_loper == '' || data.max_admin == '' || data.point_loper == '' || data.point_agent == ''){
            errorCsv.push(count)
            return false
        }else{ 
            return true
        }
    })
    .on('data', (data) => {
        var dataUpload = {
            row_number: count,
            file: filename,
            sku: data.sku,
            product_name: data.product_name,
            operator: data.operator,
            start_date_time: moment(data.start_date_time, 'DD/MM/YY HH:mm').format("YYYY-MM-DD HH:mm:ss"),
            end_date_time: moment(data.end_date_time, 'DD/MM/YY HH:mm').format("YYYY-MM-DD HH:mm:ss"),
            harga_biller: data.harga_biller,
            fee_jpx: data.fee_jpx,
            harga_agent: data.harga_agent,
            fee_agent: data.fee_agent,
            harga_jual: data.harga_jual,
            fee_loper: data.fee_loper,
            max_admin: data.max_admin,
            point_loper: data.point_loper,
            point_agent: data.point_agent,
            description: data.description
        }
        csvData.push(dataUpload)

    }).on('end', () => {
        msg = []
        let totRow = count
        let totUpRow = csvData.length
        let errRow = (errorCsv.length > 0) ? errorCsv.toString() : 0
        msg.push(totRow, totUpRow, errRow)

        
        result.ResponseCode = auth_resp.status;
        result.ResponseDesc = msg
        result.ResponseData = csvData;
        logger.info("\n Upload Product Response : ", JSON.stringify(result));
        res.send(result);

        fs.unlinkSync(req.file.path);
    }).on('error', function(errors) {
        result.ResponseCode = "500";
        result.ResponseDesc = errors;
        logger.info("\n Upload Product Response : ", JSON.stringify(result));
        res.send(result)

        fs.unlinkSync(req.file.path);
    });
    stream.pipe(streamCsv)

}

exports.add = function(req, res) {
    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if(auth_resp.status!=="200"){
        res.send(auth_resp)
        return false
    }

    var result = {}

    var uploadFiles = {
        filename: req.body.filename,
        product_type_id: req.body.product_type_id,
        biller_host_id: req.body.biller_host_id,
        network_id: req.body.network_id,
        area_id: req.body.area_id,
        agent_id: req.body.agent_id,
        uploaded_by: req.body.uploaded_by,
        uploaded_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Upload Product : ", JSON.stringify(uploadFiles));

    tbl_product_upload.create(uploadFiles)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Create Upload Product Success";
            result.ResponseData = rows;
            logger.info("\n Upload Product Response : ", JSON.stringify(result));

            res.send(result);

        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Upload Product Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}