const winston = require("winston");
require('winston-daily-rotate-file');

const dateformat = require("dateformat");

const level = process.env.LOG_LEVEL || 'debug';

const logger = new winston.Logger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            level: level,
            timestamp: function () {
                datenow = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss");
                return datenow;
            },
        }),
        new winston.transports.File({ 
            timestamp: function () {
                datenow = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss");
                return datenow;
            },
            filename: 'logs/access.log'
         }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/access_%DATE%.log',
            datePattern: dateformat(new Date(), "yyyy-mm-dd"),
            prepend: true,
            maxFiles: '31d'
        })
    ]
});

module.exports = logger