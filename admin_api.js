var express = require('express');
var cors = require('cors');
var app = module.exports = express();
var bodyParser = require('body-parser');
var config = require('./config/config');
var db = require('./config/database');
var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

// set cross origin true
app.use(cors({origin: true}));

//make the server run at port defined port
app.set('port', process.env.PORT || 3002);
app.set('mode', process.env.NODE_ENV || db.MODE_TEST);

//=================== INDEX =====================//

app.use(config.base_url +'/', require('./routes/index'));

//=================== LOGIN =====================//

app.use(config.base_url +'/auth', require('./routes/auth'));

//=================== AGENT MANAGEMENT =====================//

app.use(config.base_url +'/loper', require('./routes/loper'));
app.use(config.base_url +'/va', require('./routes/virtual_account'));
app.use(config.base_url +'/wallet', require('./routes/wallet'));
app.use(config.base_url +'/agent', require('./routes/agent'));
app.use(config.base_url +'/customer', require('./routes/customer'));
app.use(config.base_url +'/topup_wallet', require('./routes/wallet_topup'));

//=================== PRODUCT MANAGEMENT =====================//

app.use(config.base_url +'/recent_product', require('./routes/recent_products'));
app.use(config.base_url +'/product', require('./routes/product'));
app.use(config.base_url +'/product_upload', require('./routes/product_upload'));
app.use(config.base_url +'/product_assignment', require('./routes/product_assignment'));
app.use(config.base_url +'/recent_product_upload', require('./routes/recent_product_uploads'));

//=================== REPORTS =====================//

app.use(config.base_url +'/transaction_log', require('./routes/transaction_logs'));
app.use(config.base_url +'/wallet_log', require('./routes/wallet_logs'));
app.use(config.base_url +'/va_log', require('./routes/virtual_account_logs'));
app.use(config.base_url +'/product_upload_log', require('./routes/product_upload_logs'));
app.use(config.base_url +'/recent_product_upload_log', require('./routes/recent_product_upload_logs'));

//=================== AREA MANAGEMENT =====================//

app.use(config.base_url +'/area', require('./routes/area'));
app.use(config.base_url +'/province', require('./routes/province'));
app.use(config.base_url +'/district', require('./routes/district'));
app.use(config.base_url +'/mosque', require('./routes/mosque'));

//=================== SETTINGS ====================//

app.use(config.base_url +'/users', require('./routes/users'));
app.use(config.base_url +'/network', require('./routes/network'));
app.use(config.base_url +'/role', require('./routes/role'));
app.use(config.base_url +'/menu', require('./routes/menu'));
app.use(config.base_url +'/biller', require('./routes/biller'));
app.use(config.base_url +'/bank', require('./routes/bank'))
app.use(config.base_url +'/senders', require('./routes/senders'))
app.use(config.base_url +'/help', require('./routes/help'))

//=================== NETWORK MANAGEMENT ====================//

app.use(config.base_url +'/network', require('./routes/network'));
app.use(config.base_url +'/subscription', require('./routes/subscription'));

//=================== ASSET MANAGEMENT ====================//

app.use(config.base_url +'/asset', require('./routes/asset'))

//=================== HMI MANAGEMENT =====================//

app.use(config.base_url +'/hmi/badko', require('./routes/badko'));
app.use(config.base_url +'/hmi/komisariat', require('./routes/komisariat'));
app.use(config.base_url +'/hmi/universitas', require('./routes/universitas'));

//=================== STATISTICS ====================//

app.use(config.base_url +'/user_statistics', require('./routes/user_statistic'));

//access to static content
app.use(express.static('/var/www/html/jpx-web-admin-react/public'));

//set swagger path
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

db.connect(app.get('mode'), function (err) {
  if (err) {
    console.log('Unable to connect to MySQL.');
    process.exit(1);
  } else {
    app.listen(app.get('port'), function (req, res) {
      console.log('Admin API mode : ' + app.get('mode') +' listening on port ' + app.get('port'));
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.send(err);
});

module.exports = app;