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

var express = require('express');
var swaggerTools = require('swagger-tools');
var bodyParser = require('body-parser');
var jsyaml = require('js-yaml');
var request = require('request');
var Promise = require('bluebird');
var sla4oaiTools = require('sla4oai-tools');

var singleProxy = require('../proxies/single');
var config = require('../config');
var logger = config.logger;

var usedPorts = [];
module.exports.runningPipes = {};

module.exports.generate = function (newServiceInfo, callback) {

    var app = express();
    config.pipePorts++;
    while (usedPorts.indexOf(config.pipePorts) !== -1) {
        config.pipePorts++;
    }
    if (!newServiceInfo.port) {
        newServiceInfo.port = config.pipePorts;
    }

    app.use(bodyParser.json());
    app.use(function (req, res, next) {
        req.serviceProxied = newServiceInfo.name;
        req.userID = newServiceInfo.userID;
        next();
    });
    // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
    try {
        request.get({
            url: newServiceInfo.swagger_url,
            rejectUnauthorized: false
        }, function (err, response, body) {
            //create the new serverWith express
            var slaManager = new sla4oaiTools();
            slaManager.winston.transports.console.level = config.slaManager.loggerLevel;

            if (!err && response.statusCode === 200) {
                var swaggerDoc = jsyaml.safeLoad(body);
                //prepend the service pathName
                var docsPath = (swaggerDoc.basePath ? swaggerDoc.basePath : '') + '/docs'; //"/" + newServiceInfo.name +
                var apidocsPath = (swaggerDoc.basePath ? swaggerDoc.basePath : '') + '/api-docs'; // "/" + newServiceInfo.name +
                logger.pipeBuilder("Initialize slaManager from: %s", JSON.stringify(swaggerDoc.info['x-sla']));
                slaManager.initialize(app, {
                    sla4oai: swaggerDoc.info['x-sla'],
                    sla4oaiUI: {
                        portalSuccessRedirect: docsPath
                    }
                }, function (slaManager, error) {

                    if (error) {
                        logger.error("sla4oai-tools error: %s", error.toString());
                        return callback(error, null);
                    } else {
                        app.use(singleProxy);

                        // Initialize the Swagger middleware
                        swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

                            // Serve the Swagger documents and Swagger UI
                            app.use(middleware.swaggerUi({
                                apiDocs: apidocsPath,
                                swaggerUi: docsPath
                            }));

                            var toSave = newServiceInfo;

                            module.exports.runningPipes[toSave.name] = app.listen(newServiceInfo.port, function () {
                                logger.pipeBuilder("Created %s", JSON.stringify(newServiceInfo, null, 2));
                                usedPorts.push(newServiceInfo.port);
                                callback(null, toSave);
                            });

                            logger.debug("runningPipes has been updated.");
                            logger.debug(Object.keys(module.exports.runningPipes));
                        });
                    }

                });

            } else {
                var error = "Error while it was retrieving swaggerDoc from " + newServiceInfo.swagger_url;
                if (err) {
                    logger.error(error + " " + JSON.stringify(err, null, 2));
                    return callback(error + " " + JSON.stringify(err, null, 2), null);
                } else if (response) {
                    logger.error(error + " HTTPcode=" + response.statusCode);
                    return callback(error + " HTTPcode=" + response.statusCode, null);
                } else {
                    logger.error(error);
                    return callback(error, null);
                }
            }

        });
    } catch (e) {
        logger.error(e);
        callback(e, null);
    }

};

module.exports.deletePipe = function (name, callback) {
    var runningPipes = this.runningPipes;
    try {
        logger.pipeBuilder("removing pipe for %s", name);
        runningPipes[name].close(function () {
            delete runningPipes[name];
            callback(null);
        });
    } catch (e) {
        logger.pipeBuilder("Error while removing pipe with name: '%s': %s ", name, e.toString());
        callback(e);
    }
};

module.exports.deleteAllPipe = function (callback) {
    var runningPipes = this.runningPipes;
    var promiseArray = [];
    logger.debug("runningPipes before deleteAllPipe");
    //console.log(runningPipes);
    for (var p in runningPipes) {
        runningPipes[p].name = p;
        promiseArray.push(runningPipes[p]);
    }
    Promise.each(promiseArray, function (pipe) {
        return new Promise(function (resolve, reject) {
            try {
                logger.pipeBuilder("removing pipe for %s", pipe.name);
                runningPipes[pipe.name].close(function () {
                    delete runningPipes[pipe.name];
                    return resolve(pipe);
                });
            } catch (e) {
                logger.pipeBuilder("Error while removing pipe with name: '%s' over deleteAll:  %s ", pipe.name, e.toString());
                return reject(e);
            }
        }).then(function (success) { }, function (error) { });
    }).then(function (success) {
        logger.pipeBuilder("deleteAllPipe has finished");
        //console.log(module.exports.runningPipes);
        callback(null);
        //delete runningPipes = {};
    }, function (error) {
        logger.pipeBuilder("Error while removing all pipes: %s", error.toString());
        callback(error);
    });
};

module.exports.regenerate = function (serviceInfos, callback) {
    logger.pipeBuilder("Creating pipe for serviceInfos that already exist in db");
    Promise.each(serviceInfos, function (serviceInfo) {
        return new Promise(function (resolve, reject) {
            module.exports.generate(serviceInfo, function (err, data) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(data);
                }
            });
        }).then(function (success) { }, function (error) {
            logger.pipeBuilder("Error with one serviceInfo: %s", JSON.stringify(serviceInfo, null, 2));
            serviceInfo.status = "ERROR";
            serviceInfo.message = JSON.stringify(error);
            serviceInfo.save();
        });
    }).then(function (success) {
        callback(null);
        logger.pipeBuilder("All serviceInfos, that already exist in db, have been created");
    }, function (error) {
        callback(error);
        logger.pipeBuilder("Error in regeneration of serviceInfos that already exist in db");
    });
};