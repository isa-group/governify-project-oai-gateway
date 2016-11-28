'use strict';

var config = require('../../config');
var logger = require('../../config').logger;
var pipeBuilder = require('../../pipeBuilder');
var db = require('../../database');

exports.servicesPOST = function (req, res, next) {
    /**
     * parameters expected in the args:
     *  ServiceInfo (RequestInfo)
     **/

    var args = req.swagger.params;
    var serviceInfo = args.serviceInfo.value;
    logger.servicesCtl('New request to create Service: %s', JSON.stringify(serviceInfo, null, 2));
    logger.servicesCtl('Generating Service single proxy');
    pipeBuilder.generate(serviceInfo, function (err, data) {
        if (err) {
            logger.error('Erro creating Service single proxy: %s', err.toString());
            return res.json(err);
        }
        logger.servicesCtl('Single Proxy for %s has been created successfully', serviceInfo.name);
        logger.servicesCtl('Persisting serviceInfo', serviceInfo.name);
        db.addService(data, (err, result) => {
            if (!err)
                return res.json(err);
            else
                return res.status(200).end();
        });

    });

}

exports.servicesGET = function (req, res, next) {

    var args = req.swagger.params;
    logger.servicesCtl('New request to retrieve all services.');
    db.getServices((err, services) => {
        if (err) res.json(err);
        else res.json(services);
    });

}

exports.servicesIdGET = function (req, res, next) {

    var args = req.swagger.params;
    var name = args.id.value;
    logger.servicesCtl('New request to retrieve service with name: %s', name);

    db.getServiceById(name, (err, service) => {
        if (service) {
            res.json(service);
        } else {
            res.json({
                code: 404,
                message: 'Service with this id not found'
            });
        }
    });

}

exports.servicesIdDELETE = function (req, res, next) {

    var args = req.swagger.params;
    var name = args.id.value;
    logger.servicesCtl('New request to delete service with name: %s', name);

    db.deleteServiceById(name, (err) => {
        if (err) {
            res.json(err);
        } else {
            res.end();
        }
    });

}

exports.servicesDELETE = function (req, res, next) {

    logger.servicesCtl('New request to delete all services.');
    db.deleteAllServices((err) => {
        if (err) {
            res.json(err);
        } else {
            res.end();
        }
    });

}

exports.servicesIdPUT = function (req, res, next) {

    var args = req.swagger.params;
    var name = args.id.value;
    var serviceInfo = args.serviceInfo.value;
    logger.servicesCtl('New request to delete service with name: %s and content: %s', name, serviceInfo);

    db.updateServiceById(name, serviceInfo, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });

}
