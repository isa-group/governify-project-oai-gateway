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

var config = require('../../config');
var logger = config.logger;
var pipeBuilder = require('../../pipeBuilder');
var db = require('../../database');

exports.servicesPOST = function (req, res, next) {
    /**
     * parameters expected in the args:
     *  ServiceInfo (RequestInfo)
     **/

    var args = req.swagger.params;
    var serviceInfo = args.serviceInfo.value;
    serviceInfo.userID = serviceInfo.userID || req.userID;
    logger.servicesCtl('New request to create Service: %s', JSON.stringify(serviceInfo, null, 2));
    logger.servicesCtl('Generating Service single proxy');
    pipeBuilder.generate(serviceInfo, function (err, data) {
        if (err) {
            logger.error('Erro creating Service single proxy: %s', err.toString());
            return res.status(500).json(err);
        }
        logger.servicesCtl('Single Proxy for %s has been created successfully', serviceInfo.name);
        logger.servicesCtl('Persisting serviceInfo', serviceInfo.name);
        db.addService(data, function (err, result) {
            if (err)
                return res.status(400).json(err);
            else
                return res.status(200).end();
        });

    });

};

exports.servicesGET = function (req, res, next) {

    var args = req.swagger.params;
    logger.servicesCtl('New request to retrieve all services.');
    db.getServices(function (err, services) {
        if (err)
            res.status(500).json(err);
        else
            res.json(services);
    }, req.userID, req.isAdmin);

};

exports.servicesIdGET = function (req, res, next) {

    var args = req.swagger.params;
    var name = args.id.value;
    logger.servicesCtl('New request to retrieve service with name: %s', name);

    db.getServiceById(name, function (err, service) {
        if (service) {
            res.json(service);
        } else {
            res.json({
                code: 404,
                message: 'Service with this id not found'
            });
        }
    }, req.userID, req.isAdmin);

};

exports.servicesIdDELETE = function (req, res, next) {

    var args = req.swagger.params;
    var name = args.id.value;
    logger.servicesCtl('New request to delete service with name: %s', name);

    pipeBuilder.deletePipe(name, function (err, data) {
        if (err) {
            res.status(500).json({
                code: 500,
                message: "Unexpected error: " + err.toString()
            });
        } else {
            db.deleteServiceById(name, function (err) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.end();
                }
            });
        }
    }, req.userID, req.isAdmin);

};

exports.servicesDELETE = function (req, res, next) {

    logger.servicesCtl('New request to delete all services.');
    pipeBuilder.deleteAllPipe(function (err, data) {
        if (err) {
            res.status(500).json({
                code: 500,
                message: "Unexpected error: " + err.toString()
            });
        } else {
            db.deleteAllServices(function (err) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.end();
                }
            });
        }
    }, req.userID, req.isAdmin);

};

exports.servicesIdPUT = function (req, res, next) {

    var args = req.swagger.params;
    var name = args.id.value;
    var serviceInfo = args.serviceInfo.value;
    logger.servicesCtl('New request to delete service with name: %s and content: %s', name, serviceInfo);

    db.updateServiceById(name, serviceInfo, function (err, result) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    }, req.userID, req.isAdmin);

};
