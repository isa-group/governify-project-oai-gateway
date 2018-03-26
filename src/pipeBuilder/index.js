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

const express = require('express');
const swaggerTools = require('swagger-tools');
const bodyParser = require('body-parser');
const jsyaml = require('js-yaml');
const request = require('request');
const Promise = require('bluebird');
const sla4oaiTools = require('sla4oai-tools');

const singleProxy = require('../proxies/single');
const config = require('../configurations');
const logger = require('../logger');

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
            //create the new server using express and sla4oai-tools
            var slaManager = new sla4oaiTools();
            slaManager.winston.transports.console.level = config.slaManager.loggerLevel;

            if (!err && response.statusCode === 200) {
                var swaggerDoc = jsyaml.safeLoad(body);
                var swaggerDocOld = swaggerDoc;
                //prepend the service pathName

                var docsPath = (swaggerDoc.basePath ? swaggerDoc.basePath : '') + '/docs'; //"/" + newServiceInfo.name +
                var apiDocsPath = (swaggerDoc.basePath ? swaggerDoc.basePath : '') + '/api-docs'; // "/" + newServiceInfo.name +

                if (!swaggerDoc.info || (swaggerDoc.info && !swaggerDoc.info['x-sla'])) {
                    var error = "Error in swagger specification. The object 'info[x-sla]' is required. Check your OAS document.";
                    logger.error(error);
                    return callback(error, null);
                }

                logger.pipeBuilder("Initializing slaManager for the service '%s' using: %s", newServiceInfo.name, JSON.stringify(swaggerDoc.info['x-sla']));

                var slaManagerConfig = {
                    sla4oai: swaggerDoc.info['x-sla'],
                    sla4oaiUI: {
                        portalSuccessRedirect: docsPath
                    }
                };

                swaggerDoc = tweakOAS(swaggerDoc, newServiceInfo.name);


                slaManager.initialize(app, slaManagerConfig, function (slaManager, error) {
                    if (error) {
                        logger.error("sla4oai-tools error: %s", error.toString());
                        return callback(error, null);
                    } else {
                        app.use(singleProxy);

                        // Initialize the Swagger middleware
                        swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

                            // Serve the Swagger documents and Swagger UI
                            app.use(middleware.swaggerUi({
                                apiDocs: apiDocsPath,
                                swaggerUi: docsPath
                            }));

                            var toSave = newServiceInfo;

                            module.exports.runningPipes[toSave.name] = app.listen(newServiceInfo.port, function () {
                                logger.pipeBuilder("Service '%s' has been created", newServiceInfo.name);
                                // logger.debug("Service '%s' has been created with data: '%s'", newServiceInfo.name, JSON.stringify(newServiceInfo, null, 2));
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
                    logger.error(error + " HTTP code=" + response.statusCode);
                    return callback(error + " HTTP code=" + response.statusCode, null);
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
        logger.pipeBuilder("Removing pipe for '%s'", name);
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
        callback(null);
    }, function (error) {
        logger.pipeBuilder("Error while removing all pipes: %s", error.toString());
        callback(error);
    });
};

module.exports.regenerate = function (serviceInfos, callback) {
    logger.pipeBuilder("Creating pipe for the services that already exist in the database");
    Promise.each(serviceInfos,
        function (serviceInfo) {
            return new Promise(function (resolve, reject) {
                module.exports.generate(serviceInfo, function (err, data) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(data);
                    }
                });
            }).then(function (success) {
                serviceInfo.status = "OK";
                serviceInfo.message = null;
                serviceInfo.save();
            }, function (error) {
                logger.pipeBuilder("Error with 'serviceInfo': %s", JSON.stringify(serviceInfo, null, 2));
                serviceInfo.status = "ERROR";
                serviceInfo.message = JSON.stringify(error);
                serviceInfo.save();
            });
        }).then(function (success) {
            callback(null);
            logger.pipeBuilder("All the existing services have been created");
        }, function (error) {
            callback(error);
            logger.pipeBuilder("Error in recreation of the services that already exist in the database");
        });
};

/**
 * Changes paths (adding serviceName) to display them properly in swagger docs;
 * also adds an "apikey" parameter in case it was not present.
 * @param {Object} swaggerDoc 
 * @param {String} serviceName 
 */
function tweakOAS(swaggerDoc, serviceName) {
    Object.keys(swaggerDoc.paths).forEach(old_key => {
        Object.keys(swaggerDoc.paths[old_key]).forEach((method) => {

            // Adding "apikey" query param
            var parameters = swaggerDoc.paths[old_key][method].parameters;
            let existsApikeyParam = parameters.find(parameter => {
                return parameter.name === "apikey";
            });

            if (existsApikeyParam < 1) {
                let apikeyParam = {
                    description: "apikey",
                    in: "query",
                    name: "apikey",
                    required: true,
                    type: "string",
                };
                swaggerDoc.paths[old_key][method].parameters.push(apikeyParam);
            }
        });

        // Adding serviceName to every path
        let new_key = "/" + serviceName + old_key;
        if (old_key !== new_key) {
            logger.debug("Modifying OAS ", new_key)
            Object.defineProperty(swaggerDoc.paths, new_key, Object.getOwnPropertyDescriptor(swaggerDoc.paths, old_key));
            delete swaggerDoc.paths[old_key];
        }

    });

    return swaggerDoc;
}