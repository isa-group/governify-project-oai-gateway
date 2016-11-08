'use strict';

var url = require('url');


var Services = require('./ServicesService');


module.exports.servicesPOST = function servicesPOST(req, res, next) {
    Services.servicesPOST(req, res, next);
};
