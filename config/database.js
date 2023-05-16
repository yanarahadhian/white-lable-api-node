var mysql = require('mysql');
var config = require('./config');

var PRODUCTION_DB = "jpx_db";
var STAGING_DB = "jpx_db";
var TEST_DB = "jpx_db";

exports.MODE_PRODUCTION = 'mode_production'
exports.MODE_STAGING = 'mode_staging'
exports.MODE_TEST = 'mode_test'


var state = {
  pool: null,
  mode: null,
}

exports.connect = function(mode, done) {
  state.pool = mysql.createConnection({
    host: (mode === exports.MODE_PRODUCTION) ? config.db_host_prod : ((mode === exports.MODE_STAGING) ? (config.db_host_staging) : (config.db_host_dev)),
    user: (mode === exports.MODE_PRODUCTION) ? config.db_user_prod : ((mode === exports.MODE_STAGING) ? (config.db_user_staging) : (config.db_user_dev)),
    password: (mode === exports.MODE_PRODUCTION) ? config.db_password_prod : ((mode === exports.MODE_STAGING) ? (config.db_password_staging) : (config.db_password_dev)),
    database: (mode === exports.MODE_PRODUCTION) ? PRODUCTION_DB : ((mode === exports.MODE_STAGING) ? (STAGING_DB) : (TEST_DB)),
    timezone: 'UTC',
    multipleStatements : true,
  })

  state.mode = mode;
  done();
}

exports.get = function() {
  return state.pool;
}