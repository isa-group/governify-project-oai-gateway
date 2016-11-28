'use strict';

var config = require('../../config');
var logger = require('../../config').logger;
var pipeBuilder = require('../../pipeBuilder');
var db = require('../../database');

exports.servicesPOST = function(req, res, next) {
    /**
     * parameters expected in the args:
     *  ServiceInfo (RequestInfo)
     **/

    var args = req.swagger.params;

    pipeBuilder.generate(args.serviceInfo.value, function(err, data) {
        if (!err)
            return res.status(201).end("Created.");

        return res.json(err);
    });
}

exports.servicesGET = function(req, res, next) {

    var args = req.swagger.params;

    res.json(db.getServices());

}

exports.servicesIdGET = function(req, res, next) {

    var args = req.swagger.params;

    var service = db.getServiceById(args.id.value);
    if (service) {
        res.json(service);
    } else {
        res.json({
            code: 404,
            message: 'Service with this id not found'
        });
    }

}

exports.servicesIdDELETE = function(req, res, next) {

    var args = req.swagger.params;

    db.deleteServiceById(args.id.value);

    res.end();

}

exports.servicesDELETE = function(req, res, next) {

    var args = req.swagger.params;

    db.deleteAllServices();

    res.end();

}

exports.servicesIdPUT = function(req, res, next) {

    var args = req.swagger.params;

    db.updateServiceById(args.id.value, args.serviceInfo.value);

    res.end();

}
