const tbl_subscription = require('../models/tbl_subscription')
const logger = require('../libraries/logger')
const auth = require('../controllers/auth')
const moment = require("moment");

exports.search = function(req, res) {

    let token = (req.headers.token) ? (req.headers.token) : (null)
    let field = ''
    let value = []
    let result = {}
    let size = (req.query.size) ? (req.query.size) : (5)
    let page = (req.query.page) ? (req.query.page) : 1

    // Verify JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== '200') {
        res.json(auth_resp)
        return false
    }

    // Search only active subscription models
    field += ' status = 1'

    if (req.query.id || req.query.name || req.query.periode || req.query.role) {
        field += ' AND '
    }

    // CONDITION MANAGEMENT

    if (req.query.id) {
        field += 'id = ?'
        value.push(req.query.id)

        if (req.query.name || req.query.periode || req.query.role) {
            field += ' AND '
        }
    }

    if (req.query.name) {
        field += 'name like ?'
        value.push(`%${ req.query.name }%`)

        if (req.query.periode || req.query.role) {
            field += ' AND '
        }
    }

    if (req.query.periode) {
        field += 'periode like ?'
        value.push(`%${ req.query.periode }%`)

        if (req.query.role) {
            field += ' AND '
        }
    }

    if (req.query.role) {
        field += 'role like ?'
        value.push(`%${ req.query.role }%`)
    }

    // SORT MANAGEMENT
    if (req.query.orderName) {
        field += ` ORDER BY ${req.query.orderName}`

        if (req.query.orderBy) {
            field += ` ${ req.query.orderBy }`
        } else {
            field += " ASC"
        }
    }

    tbl_subscription.getSubscriptions(field, value)
    .then((responseSubscriptions) => {

        if (responseSubscriptions.length == 0) {
            return Promise.reject('No rows')
        } else {
            totalRows = responseSubscriptions.length

            if (page !== 'all') {
                let index = (page - 1) * size
                let maxIndex = (page * size)

                responseSubscriptions = responseSubscriptions.slice(index, maxIndex)
            }

            result.ResponseCode = auth_resp.status
            result.ResponseDesc = 'Search Subscription Model Successful'
            result.ResponseData = responseSubscriptions
            result.ResponseTotalData = totalRows

            logger.info('\n Subscription Model Response : ', JSON.stringify(result))
            
            res.json(result)
        }
    })
    .catch((errSubscriptions) => {
        result.ResponseCode = '400'
        result.ResponseDesc = errSubscriptions
        
        logger.info('\n Subscription Model Response (error) : ', JSON.stringify(result))

        res.json(result)
    })
}

exports.delete = function(req, res) {
    
    let token = (req.headers.token) ? (req.headers.token) : (null)

    // Verify JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== '200') {
        res.json(auth_resp)
        return false
    }

    let result = {}
    let subscriptionId = req.query.id
    let field = 'id = ?'
    let value = subscriptionId

    tbl_subscription.getSubscriptions(field, value)
    .then((resSubscriptionSearch) => {
        if (resSubscriptionSearch.length == 0) {
            return Promise.reject("Subscription Model Not Found")
        } else {
            return tbl_subscription.deleteSubscription(subscriptionId)
        }
    })
    .then((responseSubscriptionDelete) => {
        result.ResponseCode = '200'
        result.ResponseDesc = 'Delete Subscription Model Successful'
        result.ResponseData = responseSubscriptionDelete

        logger.info('\n Subscription Model Response Delete : ', JSON.stringify(result))
        
        res.json(result)
    })
    .catch((errSubscriptionDelete) => {
        result.ResponseCode = '400'
        result.ResponseDesc = errSubscriptionDelete
        
        logger.info('\n Subscription Model Response Delete (error) : ', JSON.stringify(result))

        res.json(result)
    })

}

exports.add = function(req, res) {
    
    let token = (req.headers.token) ? (req.headers.token) : (null)

    // VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== '200') {
        res.json(auth_resp)
        return false
    }

    let result = {}
    let field = ''
    let value = []
    let validPrice = (req.body.jpx_fee + req.body.network_fee + req.body.agent_fee + req.body.upline_fee) === req.body.price
    
    if (!validPrice) {
        result.ResponseCode = '400'
        result.ResponseDesc = "Unmatch Price with it's Component"

        logger.info("\n Insert Subscription Model Response : ", JSON.stringify(result))

        res.json(result)
    }

    let data = {
        name : req.body.name,
        description : req.body.description,
        status : req.body.status,
        price : req.body.price,
        periode : (req.body.periode) ? (req.body.periode) : ('Daily'),
        role : (req.body.role) ? (req.body.role) : ('Agent'),
        jpx_fee : (req.body.jpx_fee) ? (req.body.jpx_fee) : (0),
        network_fee : (req.body.network_fee) ? (req.body.network_fee) : (0),
        agent_fee : (req.body.agent_fee) ? (req.body.agent_fee) : (0),
        upline_fee : (req.body.upline_fee) ? (req.body.upline_fee) : (0),
        created_at : moment().format("YYYY-MM-DD HH:mm:ss")
    }

    field = 'name = ?'
    value.push(data.name)

    tbl_subscription.getSubscriptions(field, value)
    .then((resFindSubscription) => {
        if (resFindSubscription.length > 0) {
            return Promise.reject('Duplicate value on field Name')
        } else {
            return tbl_subscription.insertSubscription(data)
        }
    })
    .then((resInsertSubscription) => {
        result.ResponseCode = '200'
        result.ResponseDesc = 'Create New Subscription Model Sucessfull'
        result.ResponseData = resInsertSubscription

        logger.info("\n Insert Subscription Model Response : ", JSON.stringify(result))

        res.json(result)
    })
    .catch((err) => {
        result.ResponseCode = '400'
        result.ResponseDesc = err

        logger.info("\n Insert Subscription Model Failed : ", JSON.stringify(result))
        
        res.json(result)
    })
}

exports.edit = function(req, res) {
    let token = (req.headers.token) ? (req.headers.token) : (null)

    // VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== '200') {
        res.json(auth_resp)
        return false
    }

    let result = {}
    let field = ''
    let value = []
    let validPrice = (req.body.jpx_fee + req.body.network_fee + req.body.agent_fee + req.body.upline_fee) === req.body.price
    
    if (!validPrice) {
        result.ResponseCode = '400'
        result.ResponseDesc = "Unmatch Price with it's Component"

        logger.info("\n Insert Subscription Model Response : ", JSON.stringify(result))

        res.json(result)
    }

    let data = {
        name : req.body.name,
        description : req.body.description,
        status : req.body.status,
        price : req.body.price,
        periode : (req.body.periode) ? (req.body.periode) : ('Daily'),
        role : (req.body.role) ? (req.body.role) : ('Agent'),
        jpx_fee : (req.body.jpx_fee) ? (req.body.jpx_fee) : (0),
        network_fee : (req.body.network_fee) ? (req.body.network_fee) : (0),
        agent_fee : (req.body.agent_fee) ? (req.body.agent_fee) : (0),
        upline_fee : (req.body.upline_fee) ? (req.body.upline_fee) : (0),
        updated_at : moment().format("YYYY-MM-DD HH:mm:ss")
    }

    field = 'id = ?'
    value.push(req.body.id)

    tbl_subscription.getSubscriptions(field, value)
    .then((resFindSubscription) => {
        if (resFindSubscription.length === 1) {
            let oldName = resFindSubscription[0].name
            let newName = data.name

            return tbl_subscription.getUnusedSubscriptionModelEdit(oldName, newName)
        } else {
            return Promise.reject('Cannot Find Subscription Model Detail')
        }
    })
    .then((resUnusedSubsModel) => {
        console.log('-----> resUnusedSubsModel : ', resUnusedSubsModel)
        if (resUnusedSubsModel.length > 0) {
            return Promise.reject('Subscription Name already exists!')
        } else {
            return tbl_subscription.updateSubscription(data, req.body.id)
        }
    })
    .then(function (rows) {
        result.ResponseCode = '200'
        result.ResponseDesc = 'Edit Subscription Model Sucessfull'
        result.ResponseData = rows

        logger.info("\n Update Subscription Model Response : ", JSON.stringify(result))

        res.json(result)
    })
    .catch((err) => {
        result.ResponseCode = '400'
        result.ResponseDesc = err

        logger.info("\n Update Subscription Model Failed : ", JSON.stringify(result))

        res.json(result)
    })
}

exports.getLogs = function (req, res) {
    let token = (req.headers.token) ? (req.headers.token) : (null)

    // VERIFY JWT
    let auth_resp = auth.verify(token)

    if (auth_resp.status !== '200') {
        res.json(auth_resp)
        return false
    }

    let result = {}
    let field = ''
    let sortField = ''
    let value = []
    let size = (req.query.size) ? (req.query.size) : (5)
    let page = (req.query.page) ? (req.query.page) : 1
    
    // FILTER MANAGEMENT
    // query filter : Subscription Name, Network, Amount Range, Date Range, Status
    
    if (req.query.id) {
        field += 'subscription_logs.id = ?'
        value.push(req.query.id)

        if (req.query.subscription_name || req.query.network || req.query.price || req.query.created_at || req.query.trans_status || req.query.invoice || req.query.user_name) {
            field += ' AND '
        }
    }

    if (req.query.subscription_name) {
        field += 'subscription_models.name like ?'
        value.push('%' + req.query.subscription_name + '%')

        if (req.query.network || req.query.price || req.query.created_at || req.query.trans_status || req.query.invoice || req.query.user_name) {
            field += ' AND '
        }
    }

    if (req.query.network) {
        field += 'network.network like ?'
        value.push('%' + req.query.network + '%')

        if (req.query.price || req.query.created_at || req.query.trans_status || req.query.invoice || req.query.user_name) {
            field += ' AND '
        }
    }

    if (req.query.created_at) {
        // parsing created_at value from string back to object literalls
        req.query.created_at = JSON.parse(req.query.created_at)

        field += "DATE(subscription_logs.created_at) "+req.query.created_at.comparator+" ?"
        value.push(moment(req.query.created_at.date, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"))

        if (req.query.trans_status || req.query.invoice || req.query.user_name) {
            field += ' AND '
        }
    }

    if (req.query.trans_status) {
        field += 'trans_status = ?'
        value.push(req.query.trans_status)

        if (req.query.invoice || req.query.user_name) {
            field += ' AND '
        }
    }

    if (req.query.invoice) {
        field += 'invoice like ?'
        value.push('%' + req.query.invoice + '%')

        if (req.query.user_name) {
            field += ' AND '
        }
    }

    if (req.query.user_name) {
        field += 'users.name like ?'
        value.push('%' + req.query.user_name + '%')
    }

    // SORT MANAGEMENT
    if (req.query.orderName) {
        sortField += ` ORDER BY ${ req.query.orderName }`

        if (req.query.orderBy) {
            sortField += ` ${ req.query.orderBy }`
        } else {
            sortField += ` ASC`
        }
    } else {
        sortField += ` ORDER BY id DESC`
    }

    // PAGINATION MANAGEMENT

    // if (page !== 'all') {
    //     sortField += ` LIMIT ${ size } OFFSET ${ page }`
    // }

    tbl_subscription.getSubscriptionLogs(field, value, sortField)
    .then((response) => {
        
        if (response.length === 0) {
            return Promise.reject('No Rows')
        } else {
            let rows = []

            if (page !== 'all') {
                let index = (page - 1) * size
                let maxIndex = page * size
                rows = response.slice(index, maxIndex)
            }

            result.ResponseCode = '200'
            result.ResponseDesc = 'Search Subscription Logs Successful'
            result.ResponseData = rows
            result.ResponseTotalData = response.length
    
            logger.info("\n Subscription Logs Response : ", JSON.stringify(response))
            
            res.json(result)
        }
    })
    .catch((err) => {
        result.ResponseCode = '400'
        result.ResponseDesc = err

        logger.info("\n Subscription Logs Response Error : ", JSON.stringify(err))

        res.json(result)
    })
}