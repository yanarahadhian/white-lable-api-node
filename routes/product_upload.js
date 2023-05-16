var express = require('express');
var productUploadRouter = express.Router();
var product_upload = require('../controllers/product_upload');
var multer = require('multer');
var path = require('path');
var upload = multer({
    dest: 'tmp/csv/',
    limits: { fileSize: 1024 * 1024 },
    fileFilter: function (req, file, cb) {
         let ext = path.extname(file.originalname);
         if (ext !== '.csv') {
              req.fileValidationError = 'Only CSV are allowed';
              return cb(null, false, req.fileValidationError);
        }
        cb(null, true);
    }
});

productUploadRouter.get('/', function(req, res) {
	product_upload.search(req, res)
})

productUploadRouter.post('/validationCsv', upload.single('file'), function(req, res) {
    var result = {}
    if (req.fileValidationError) {
        result.ResponseCode = "99";
        result.ResponseDesc = req.fileValidationError;
        return res.send(result)
    }else{
        product_upload.validationCsv(req, res);
    }
})

productUploadRouter.post('/', function(req, res) {
    product_upload.add(req, res);
})

module.exports = productUploadRouter;