const tbl_menu = require('../models/tbl_menu');
const logger = require('../libraries/logger');
const auth = require('../controllers/auth');
const moment = require("moment");
const indicative = require('indicative');

exports.list = function(req, res) {

    const token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    let result = {}
    let size = (req.query.size) ? req.query.size : 5
    let page = (req.query.page) ? req.query.page : 1
    let index = ""
    let maxindex = ""
    let orderBy = ""
    let orderOption = ["menu_id", "menu_url", "display_name", "icon_class"];

    if (req.query.orderName) {
        element = req.query.orderName.split(",");        
        element.forEach(rows => {
            elementStatus = orderOption.indexOf(rows);
        });

        if (elementStatus == -1) {
            return Promise.reject('Invalid Order format');
        } else {
            orderBy = " ORDER BY " + req.query.orderName;
            if (req.query.orderBy) {
                orderBy += " " + req.query.orderBy;
            } else {
                orderBy += " ASC";
            }
        }
    } 
    
    tbl_menu.getAllMenu(orderBy).then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {
            let total = rows.length
            if (page !== 'all') {
                index = (page-1) * size
                maxindex = (page * size)
                rows = rows.slice(index, maxindex)   
            }

            result.ResponseCode = auth_resp.status
            result.ResponseDesc = "Get All Menu Successful"
            result.ResponseData = rows
            result.ResponseTotalResult = total
            logger.info("\n Menu Response : ", JSON.stringify(result))

            res.json(result)
        }
    }).catch(function (errors) {
        
        result.ResponseCode = "500"
        result.ResponseDesc = errors

        logger.info("\n Menu Response : ", JSON.stringify(result))
        res.send(result)
       
    })
}

exports.pageList = function(req, res) {

    const token = (req.headers.token) ? (req.headers.token) : (null)

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    let result = {}
    let size = (req.query.size) ? req.query.size : 5
    let page = (req.query.page) ? req.query.page : 1
    let index = ""
    let maxindex = ""
    let orderBy = ""
    let field = ""
    let value = []
    let orderOption = ["page_id", "page_name", "page_url", "menu_id", "page_order", "class_icon", "created_at", "updated_at", "deleted_at", "hide"];

    // FILTER MANAGEMENT
    if (req.query.page_id) {
        field += ` menu_page_react.page_id = ?`
        value.push(req.query.page_id)

        if (req.query.menu_name || req.query.page_name || req.query.hide) {
            field += ' AND '
        }
    }
    if (req.query.menu_name) {
        field += ` menu_react.display_name like ?`
        value.push(`%${ req.query.menu_name }%`)

        if (req.query.page_name || req.query.hide) {
            field += ' AND '
        }
    }
    if (req.query.page_name) {
        field += ` menu_page_react.page_name like ?`
        value.push(`%${ req.query.page_name }%`)

        if (req.query.hide) {
            field += ' AND '
        }
    }
    if (req.query.hide) {
        field += ` menu_page_react.hide = ?`
        value.push(req.query.hide)
    }

    // ORDER MANAGEMENT
    if (req.query.orderBy) {
        element = req.query.orderBy.split(",");        
        element.forEach(rows => {
            elementStatus = orderOption.indexOf(rows);
        });

        if (elementStatus == -1) {
            return Promise.reject('Invalid Order format');
        } else {
            orderBy = " ORDER BY " + req.query.orderBy;
            if (req.query.orderDirection) {
                orderBy += " " + req.query.orderDirection;
            } else {
                orderBy += " ASC";
            }
        }
    }

    if (req.query.orderBy) {
        orderBy = " ORDER BY " + req.query.orderBy;
        if (req.query.orderDirection) {
            orderBy += " " + req.query.orderDirection;
        } else {
            orderBy += " ASC";
        }
    } 
    
    tbl_menu.getAllPage(field, value, orderBy)
    .then(function (rows) {
        if (rows.length == 0) {
            return Promise.reject('No rows');
        } else {

            let total = rows.length

            if(page!=="all"){
                index = (page-1)*size
                maxindex = (page*size)
                rows = rows.slice(index,maxindex)   
            }   

            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Get All Page Successful";
            result.ResponseData = rows;
            result.ResponseTotalResult = total;
            logger.info("\n Menu Response : ", JSON.stringify(result));

            res.send(result);
        }
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Menu Response : ", JSON.stringify(result));
        res.send(result)
    })
}

exports.addMenuPage = function (req, res) {
    
    const token = (req.headers.token) ? (req.headers.token) : (null)
    const DEFAULT_HIDE = 0
    const created_at = moment().format("YYYY-MM-DD HH:mm:ss")
    let result = {}

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    validatePageDetails(req)
    .then((responseValidate) => {
        let field = ''
        let value = []

        if (req.body.page_name) {
            field += ` page_name = ?`
            value.push(req.body.page_name)

            if (req.body.page_url) {
                field += `OR `
            }
        }
        if (req.body.page_url) {
            field += ` page_url = ?`
            value.push(req.body.page_url)
        }

        return tbl_menu.getAllPage(field, value, '')
    })
    .then((responseGetDuplicatePage) => {
        if (responseGetDuplicatePage.length > 0) {
            return Promise.reject('Page Name or Page URL already exists')
        } else {
            let data = {
                page_name : req.body.page_name,
                page_url : req.body.page_url,
                menu_id : req.body.menu_id,
                page_order : req.body.page_order,
                class_icon : req.body.class_icon,
                hide : (req.body.hide) ? (req.body.hide) : (DEFAULT_HIDE),
                created_at : created_at
            }

            return tbl_menu.createMenuPage(data)
        }
    })
    .then((responseCreateMenuPage) => {
        result.ResponseCode = '200'
        result.ResponseDesc = 'Create New Menu Page Successful'
        result.ResponseData = responseCreateMenuPage
        
        logger.info("\n Menu Page Create Response : ", JSON.stringify(result))

        res.json(result)
    })
    .catch((err) => {
        result.ResponseCode = '500'
        result.ResponseDesc = err

        logger.info("\n Menu Page Create Response Error : ", JSON.stringify(result))
        
        res.json(result)
    })
}

exports.editMenuPage = function (req, res) {

    const token = (req.headers.token) ? (req.headers.token) : (null)
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss")
    const DEFAULT_HIDE = 0
    const page_id = req.body.page_id
    let result = {}

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    validatePageDetails(req)
    .then((responseValidate) => {
        let field = ''
        let value = []

        if (req.body.page_name) {
            field = ` page_name = ?`
            value.push(req.body.page_name)
        }

        return tbl_menu.getAllPage(field, value, '')
    })
    .then((responseGetPageNameDuplicate) => {

        let pageNameExists = responseGetPageNameDuplicate.length > 0 && responseGetPageNameDuplicate[0].page_id != page_id

        if (pageNameExists) {
            return Promise.reject('Page Name Exists')
        } else {
            let field = ''
            let value = []

            if (req.body.page_url) {
                field = ` page_url = ?`
                value.push(req.body.page_url)
            }

            return tbl_menu.getAllPage(field, value, '')
        }
    })
    .then((responseGetPageUrlDuplicate) => {

        let pageURLExists = responseGetPageUrlDuplicate.length > 0 && responseGetPageUrlDuplicate[0].page_id != page_id

        if (pageURLExists) {
            return Promise.reject('Page URL Exists')
        } else {

            let data = {
                page_name : req.body.page_name,
                page_url : req.body.page_url,
                menu_id : req.body.menu_id,
                page_order : req.body.page_order,
                class_icon : req.body.class_icon,
                hide : (req.body.hide) ? (req.body.hide) : (DEFAULT_HIDE),
                updated_at : updated_at
            }
            
            logger.info('\n Request Update : ', JSON.stringify({data, page_id}))
            
            return tbl_menu.updateMenuPage(data, page_id)
        }
    })
    .then((responseUpdatePageMenu) => {
        result.ResponseCode = '200'
        result.ResponseDesc = 'Update Menu Page Successful'
        result.ResponseData = responseUpdatePageMenu
        
        logger.info("\n Menu Page Update Response : ", JSON.stringify(result))

        res.json(result)
    })
    .catch((err) => {
        result.ResponseCode = '500'
        result.ResponseDesc = err

        logger.info("\n Menu Page Update Response Error : ", JSON.stringify(result))
        
        res.json(result)
    })
}

exports.deleteMenuPage = function(req, res) {
    const token = (req.headers.token) ? (req.headers.token) : (null)
    const page_id = (req.query.page_id) ? (req.query.page_id) : (null)
    let result = {}

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }

    let field = ''
    let value = []
    
    if (page_id) {
        field += ` page_id = ?`
        value.push(page_id)
    } else {
        result.ResponseCode = '400'
        result.ResponseDesc = 'Bad Request'
        
        logger.info("\n Menu Page Delete Response : ", JSON.stringify(result))

        res.json(result)
    }

    tbl_menu.getAllPage(field, value, '')
    .then((responseGetPageDetails) => {
        let pageDetailsFound = responseGetPageDetails.length == 1 && responseGetPageDetails[0].page_id == page_id
        if (!pageDetailsFound) {
            return Promise.reject('Page not found')
        } else {
            return tbl_menu.removeMenuPage(page_id)
        }
    })
    .then((responseRemoveMenuPage) => {
        result.ResponseCode = '200'
        result.ResponseDesc = 'Delete Menu Page Successful'
        result.ResponseData = responseRemoveMenuPage
        
        logger.info("\n Menu Page Delete Response : ", JSON.stringify(result))

        res.json(result)
    })
    .catch((err) => {
        result.ResponseCode = '500'
        result.ResponseDesc = err

        logger.info("\n Menu Page Delete Response Error : ", JSON.stringify(result))
        
        res.json(result)
    })
}

function validatePageDetails(req) {
    // validate required field of Menu Page
    return new Promise(function (resolve, reject) {
        
        const rules = {
            'page_name'       : 'required|string|max:100',
            'page_url'        : 'required|string|max:200',
            'menu_id'         : 'required|number|max:2', 
            'page_order'      : 'required|number|max:2',
            'class_icon'      : 'required|string|max:100', 
            'hide'            : 'required|number|max:4'
        }

        const messages = {
            'required': '{{ field }} is required'
        }

        indicative.validate(req.body, rules, messages)
        .then((response) => {
            resolve(response)
        })
        .catch((err) => {
            reject(err)
        })
    })
}