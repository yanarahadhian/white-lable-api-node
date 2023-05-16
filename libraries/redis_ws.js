var config = require('../config/config');
var request = require('superagent');
var logger = require('../libraries/logger');

exports.post_method = function (param, url) {

    return new Promise(function (resolve, reject) {

        var redis_url = config.redis_ws.base_url + url;
        console.log(redis_url)

        logger.info("REQUEST TO REDIS WS --> " + JSON.stringify(param));
        
        request.post(redis_url)
            .send(param)
            .timeout({
                response: 10000,
                deadline: 20000,
            })
            .then(function (res) {
                logger.info("RESPONSE FROM DERIS WS --> " + JSON.stringify(res.body));
                resolve(res.body);
            })
            .catch(function (err) {
                logger.info("RESPONSE FROM DERIS WS --> " + JSON.stringify(err.status + " " + err.message));
                reject(err);
            });
    });
};