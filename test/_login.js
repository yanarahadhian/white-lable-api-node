const chai = require('chai')
const chaiHttp = require('chai-http')
// const { base_url } = require('../config/config')
const base_url = 'http://127.0.0.1:3002'
const should = chai.should()

chai.use(chaiHttp)

describe('/login - authentication', function() {
    it('should return login response data when succesfully login with right credentials', function(done) {
        const registeredAccount = {
            username : '090519141516',
            password : '123456789'
        }

        chai.request(base_url)
            .post('/api/auth/login')
            .send(registeredAccount)
            .end(function (err, result) {
                result.should.have.status(200)
                result.body.should.haveOwnProperty('ResponseCode', '200')
                
                result.body.should.haveOwnProperty('ResponseData')
                
                    result.body.ResponseData.should.haveOwnProperty('token_id')
                    Boolean(result.body.ResponseData.token_id).should.be.true
                    
                    result.body.ResponseData.should.haveOwnProperty('token_exp')
                    Boolean(result.body.ResponseData.token_exp).should.be.true
                    
                    result.body.ResponseData.should.haveOwnProperty('data')
                    result.body.ResponseData.data.should.be.an('object')
                    
                        result.body.ResponseData.data.should.haveOwnProperty('rights')
                        result.body.ResponseData.data.should.haveOwnProperty('username')
                        
                        result.body.ResponseData.data.should.haveOwnProperty('role')
                        Boolean(result.body.ResponseData.data.role).should.be.true
                        
                        result.body.ResponseData.data.should.haveOwnProperty('role_level')
                        Boolean(result.body.ResponseData.data.role_level).should.be.true
                        
                        result.body.ResponseData.data.should.haveOwnProperty('network')
                        Boolean(result.body.ResponseData.data.network).should.be.true
                        
                        result.body.ResponseData.data.should.haveOwnProperty('favicon')
                        result.body.ResponseData.data.should.haveOwnProperty('url_website')
                        result.body.ResponseData.data.should.haveOwnProperty('sender_email')
                        result.body.ResponseData.data.should.haveOwnProperty('dashboard_logo')
            })
        
            done()
    })

    it('should return error response data on account not found when tried to login with unregistered user', function(done) {
        const unregisteredAccount = {
            username : 'unregisteredUser01',
            password : '123456789'
        }

        chai.request(base_url)
            .post('/api/auth/login')
            .send(unregisteredAccount)
            .end(function (err, result) {
                result.should.have.status(200)
                result.body.should.haveOwnProperty('ResponseCode', '500')
                result.body.should.haveOwnProperty('ResponseDesc', 'This account is not found')
                done()
            })
    })

    it('should return error response data on wrong credentials when tried to login with wrong credentials', function(done) {
        const wrongCredentialsAccount = {
            username : '090519141516',
            password : '123'
        }

        chai.request(base_url)
            .post('/api/auth/login')
            .send(wrongCredentialsAccount)
            .end(function (err, result) {
                result.should.have.status(200)
                result.body.should.haveOwnProperty('ResponseCode', '400')
                result.body.should.haveOwnProperty('ResponseDesc', 'Username/ Password is invalid. Please enter a valid Username/ Password.')
                done()
            })
    })

    it('should return error response data on deleted account when tried to login with deleted account', function(done) {
        const deletedAccount = {
            username : '140519114500',
            password : '123'
        }

        chai.request(base_url)
            .post('/api/auth/login')
            .send(deletedAccount)
            .end(function (err, result) {
                result.should.have.status(200)
                result.body.should.haveOwnProperty('ResponseCode', '401')
                result.body.should.haveOwnProperty('ResponseDesc', 'This account has been deleted. Contact Administrator for more details.')
                done()
            })
    })

    it('should return error on suspended account when tried to login with inactive status account', function (done) {
        const inactiveAccount = {
            username : '140519133500',
            password : '140519133500'
        }

        chai.request(base_url)
            .post('/api/auth/login')
            .send(inactiveAccount)
            .end(function (err, result) {
                result.should.have.status(200)
                result.body.should.haveOwnProperty('ResponseCode', '401')
                result.body.should.haveOwnProperty('ResponseDesc', 'This account has been temporary suspended. Contact Administrator for more details.')
                done()
            })
    })
})


