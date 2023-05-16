var express = require('express');
var recentPuRoutes = express.Router();
var recentPu = require('../controllers/recent_product_uploads');
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

recentPuRoutes.post('/validationCsv', upload.single('file'), function(req, res) {
    var result = {}
    if (req.fileValidationError) {
        result.ResponseCode = "500";
        result.ResponseDesc = req.fileValidationError;
        return res.send(result)
    }else{
        recentPu.validationCsv(req, res);
    }
})

recentPuRoutes.get('/', function (req, res, next) {
    recentPu.search(req, res);
});

recentPuRoutes.post('/', function (req, res, next) {
    recentPu.add(req, res);
});

module.exports = recentPuRoutes;
