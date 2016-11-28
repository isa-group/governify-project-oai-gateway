'use strict'
var jsyaml = require('js-yaml');
var fs = require('fs');
var winston = require('winston');


var configString = fs.readFileSync('./config/config.yaml', 'utf8');
module.exports = jsyaml.safeLoad(configString)[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];

// CHECKING ENV VARS
// multiproxy
process.env.MULTIPROXY ? module.exports.multiproxy = process.env.MULTIPROXY :
    null;


// WINSTON CONFIGURATION
winston.emitErrs = true;

var logConfig = {
    levels: {
        error: 7,
        warning: 8,
        pipeBuilder: 9,
        servicesCtl: 9,
        db: 9,
        info: 10,
        debug: 11
    },
    colors: {
        error: 'red',
        warning: 'yellow',
        pipeBuilder: 'green',
        servicesCtl: 'cyan',
        db: 'magenta',
        info: 'white',
        debug: 'grey'
    }
};

module.exports.logger = new winston.Logger({
    levels: logConfig.levels,
    colors: logConfig.colors,
    transports: [
        new winston.transports.File({
            level: module.exports.logger,
            filename: 'logs.log',
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: module.exports.logger,
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: true
        })
    ],
    exitOnError: false
});
