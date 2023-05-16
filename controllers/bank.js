let tbl_bank = require('../models/tbl_bank')
let logger = require('../libraries/logger')
var auth = require('../controllers/auth')

exports.list = function (req, res) {

    var token = (req.headers.token) ? req.headers.token : null

    //VERIFY JWT
    let auth_resp = auth.verify(token)
    if (auth_resp.status !== "200") {
        res.send(auth_resp)
        return false
    }
    var result = {}

    tbl_bank.getAllBanks()
    .then(function (rows) {
        if (rows === null) {
            result.ResponseCode = "404";
            result.ResponseDesc = "Data not found";
        }
        else{
            result.ResponseCode = auth_resp.status;
            result.ResponseDesc = "Search Bank Success";
            result.ResponseData = rows;
        }

        logger.info('\n Bank Response : ', JSON.stringify(result))
        res.json(result)
        
    }).catch(function (errors) {

        result.ResponseCode = "500";
        result.ResponseDesc = errors;

        logger.info("\n Area Response : ", JSON.stringify(result));
        res.send(result)
   
    })
}