'use strict';

var url = require('url');


var Services = require('./ServicesService');


module.exports.servicesPOST = function servicesPOST(req, res, next) {
    Services.servicesPOST(req, res, next);
};

module.exports.servicesGET = function servicesGET(req, res, next) {
    Services.servicesGET(req, res, next);
};

module.exports.servicesDELETE = function servicesDELETE(req, res, next) {
    Services.servicesDELETE(req, res, next);
};

module.exports.servicesIdGET = function servicesIdGET(req, res, next) {
    Services.servicesIdGET(req, res, next);
};

module.exports.servicesIdDELETE = function servicesIdDELETE(req, res, next) {
    Services.servicesIdDELETE(req, res, next);
};

module.exports.servicesIdPUT = function servicesIdPUT(req, res, next) {
    Services.servicesIdPUT(req, res, next);
};
