const AWS = require('aws-sdk')
const bluebird = require('bluebird')
const config = require('../config/config')

// Config for AWS access & secret key
AWS.config.update({
    accessKeyId : config.aws.accessKeyId,
    secretAccessKey : config.aws.secretAccessKey
})

// Configure AWS response to be promise based
AWS.config.setPromisesDependency(bluebird)

const s3 = new AWS.S3()

exports.uploadFile = (buffer, name, type) => {
    const params = {
        ACL : 'public-read',
        Body : buffer,
        Bucket : config.aws.bucket,
        ContentType : type.mime,
        Key : `${name}`
    }

    return s3.upload(params).promise()
}

exports.deleteFile = (objectKey) => {
    const params = {
        Bucket : config.aws.bucket,
        Key : objectKey
    }

    return s3.deleteObject(params).promise()
}