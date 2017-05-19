/*!
governify-gateway 0.0.1, built on: 2017-03-30
Copyright (C) 2017 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/


'use strict';

var jsyaml = require('js-yaml');
var fs = require('fs');
var winston = require('winston');

var configString = fs.readFileSync('./src/config/config.yaml', 'utf8');
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
        singleproxy: 9,
        multiproxy: 9,
        pipeBuilder: 9,
        servicesCtl: 9,
        db: 9,
        info: 10,
        debug: 11
    },
    colors: {
        error: 'red',
        warning: 'yellow',
        singleproxy: 'yellow',
        multiproxy: 'cyan',
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