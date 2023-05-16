const chai = require('chai')
const chaiHttp = require('chai-http')
// const { base_url } = require('../config/config')
const base_url = 'http://127.0.0.1:3002'
const should = chai.should()

chai.use(chaiHttp)

describe('App server', function() {
    it('should running on environment smoothly', function(done) {
        chai.request(base_url)
            .get('/api/')
            .end(function(err, res) {
                res.should.have.status(200)
                res.body.should.have.own.property('ResponseCode')
                res.body.ResponseCode.should.equal('200')
                done()
            })
    })
})