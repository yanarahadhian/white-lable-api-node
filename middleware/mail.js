const axios = require('axios')
const config = require('../config/config')
const logger = require('../libraries/logger');

exports.sendMail = function (req) {
    let { name, email } = req.body
    let api_key = config.smtp2go.api_key
    let splittedBody = req.body.message.split(';')
    let body = ''

    let header =  `<p align="center">`;
        header += `<img src="https://s3-ap-southeast-1.amazonaws.com/jpx-whitelabel/assets/logo_agan.png" alt="Agan Dashboard" width="125px"/><br/><br/>`;
        header += `Hi ${ (name) ? (name) : ('< user >') } <br/><br/>`;

    splittedBody.forEach(splittedElement => {
        body = body + splittedElement + '<br/>'
    })

    let footer = `_______________________________________________________________________<br/><br/>`;
        footer += `<i>This email has been generated automatically, please do not reply.</i></p>`;

    let message = header + body + footer

    let requestData = {
        "api_key": api_key,
        "to": [`${ (name) ? (name) : ('< user >') } <${ (email) ? (email) : ('development@jpx.id') }>`],
        "sender": `${ (req.body.networkName) ? (req.body.networkName) : ('Agan') } <${ (req.body.networkSenderMail) ? (req.body.networkSenderMail) : ('do-not-reply@jpx.id') }>`,
        "subject": (req.body.subject) ? (req.body.subject) : ('No Subject'),
        "html_body": message,
    }

    return new Promise(function (resolve, reject) {
        axios({
            url: config.smtp2go.url,
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            data: requestData
        })
        .then(function (response) {
            if (response.data.data.succeeded === 1) {
                resolve({
                    status: '00',
                    message: 'Send email success!',
                    mailLog: response.data.data
                })
            } else {
                reject({
                    status: '99',
                    message: 'Send email failed!',
                    mailLog: response.data.data
                })
            }
        })
        .catch(function (err) {
            reject({
                status: '99',
                message: 'Send email failed!',
                mailLog : err
            })
        })
    })
}