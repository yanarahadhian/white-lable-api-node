var tbl_recent_product_upload = require('../models/tbl_recent_product_upload');
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
    let { id, product_type, biller_host, network, area, agent, filename, created_by, created_at } = req.query
 
    let size = (reqParams.size) ? reqParams.size : 5
    let page = (reqParams.page) ? reqParams.page : 1
    
    let index = ''
    let maxIndex = ''
    let orderName = ''

    let result = {}

    // WHERE QUERY PARAMETERS

    if (id) {
        field += 'pu.id = ?'
        value.push(id)

        if (product_type || biller_host || network || area || agent || filename || created_by || created_at) {
            field += ' AND '
        }
    }

    if (product_type) {
        field += 'pt.product_type like ?'
        value.push('%' + product_type + '%')

        if (biller_host || network || area || agent || filename || created_by || created_at) {
            field += ' AND '
        }
    }

    if (biller_host) {
        field += 'bl.name like ?'
        value.push('%' + biller_host + '%')

        if (network || area || agent || filename || created_by || created_at) {
            field += ' AND '
        }
    }

    if (network) {
        field += 'net.network like ?'
        value.push('%' + network + '%')

        if (area || agent || filename || created_by || created_at) {
            field += ' AND '
        }
    }

    if (area) {
        field += 'ar.area like ?'
        value.push('%' + area+ '%')

        if (agent || filename || created_by || created_at) {
            field += ' AND '
        }
    }

    if (agent) {
        field += 'us.name like ?'
        value.push('%' + agent + '%')

        if (filename || created_by || created_at) {
            field += ' AND '
        }
    }

    if (filename) {
        field += 'pu.filename like ?'
        value.push('%' + filename + '%')

        if (created_by || created_at) {
            field += ' AND '
        }
    }

    if (created_by) {
        field += 'pu.created_by like ?'
        value.push('%' + created_by + '%')

        if (created_at) {
            field += ' AND '
        }
    }

    if (created_at) {
        created_at = JSON.parse(created_at)
        field += "DATE(pu.created_at) "+created_at.comparator+" ?"
        value.push(moment(created_at.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"))
    }

    // QUERY ORDER BY

    if (reqParams.orderName) {
        orderBy = ' ORDER BY ' + reqParams.orderName

        if (reqParams.orderBy) {
            orderBy += ` ${ reqParams.orderBy }`
        } else {
            orderBy += ` ASC`
        }
    } else {
        orderBy = "";
    }

    tbl_recent_product_upload.search(field, value, orderBy)
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
        product_type_id: req.body.product_type_id,
        biller_host_id: req.body.biller_host_id,
        user_id: (req.body.user_id) ? (req.body.user_id) : (null),
        filename: req.body.filename,
        file_url: req.body.file_url,
        status: req.body.status,
        created_by: req.body.created_by,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }

    logger.info("\n Request Upload Product : ", JSON.stringify(uploadFiles));

    tbl_recent_product_upload.create(uploadFiles)
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
        if (data.template == '' || data.scheme == '' || data.sku == '' || data.product_name == '' || data.operator == '' || data.start_date_time == '' || data.end_date_time == '' || data.harga_biller == '' || data.fee_jpx == '' || data.fee_agent == '' || data.fee_loper == '' || data.selling_price == '' || data.max_admin == '' || data.point_loper == '' || data.point_agent == ''){
            errorCsv.push(count)
            return false
        }else{ 
            return true
        }
    })
    .on('data', (data) => {
        var dataUpload = {
            row_number: count,
            template: data.template,
            scheme: data.scheme,
            sku: data.sku,
            product_name: data.product_name,
            operator: data.operator,
            start_date_time: moment(data.start_date_time, 'DD/MM/YY HH:mm').format("YYYY-MM-DD HH:mm:ss"),
            end_date_time: moment(data.end_date_time, 'DD/MM/YY HH:mm').format("YYYY-MM-DD HH:mm:ss"),
            harga_biller: data.harga_biller,
            fee_jpx: data.fee_jpx,
            fee_agent: data.fee_agent,
            fee_loper: data.fee_loper,
            selling_price: data.selling_price,
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
        logger.info("\n validationCsv Product Response : ", JSON.stringify(result));
        res.send(result);

        fs.unlinkSync(req.file.path);
    }).on('error', function(errors) {
        result.ResponseCode = "500";
        result.ResponseDesc = errors;
        logger.info("\n validationCsv Product Response : ", JSON.stringify(result));
        res.send(result)

        fs.unlinkSync(req.file.path);
    });
    stream.pipe(streamCsv)

}

