'use strict';

var express = require('express');
var swaggerTools = require('swagger-tools');
var bodyParser = require('body-parser');
var jsyaml = require('js-yaml');
var request = require('request');
var Promise = require('bluebird');
var slaManager = require('sla4oai-tools');

var singleProxy = require('../proxies/single');
var config = require('../config');
var logger = config.logger;

slaManager.winston.transports.console.level = config.slaManager.loggerLevel;

module.exports.runningPipes = {};

module.exports.generate = function (newServiceInfo, callback) {
    //create the new serverWith express
    var app = express();
    config.pipePorts++;
    newServiceInfo.port = config.pipePorts;

    app.use(bodyParser.json());
    app.use(function (req, res, next) {
        req.serviceProxied = newServiceInfo.name;
        req.userID = newServiceInfo.userID;
        next();
    });
    // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
    request.get({
        url: newServiceInfo.swagger_url,
        rejectUnauthorized: false
    }, function (err, response, body) {

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
            }, function () {

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
                        callback(null, toSave);
                    });

                    logger.debug("runningPipes has been updated.");
                    logger.debug(Object.keys(module.exports.runningPipes));
                });

            });

        } else {
            logger.error("Error while it was retrieving swaggerDoc from %s. %s", newServiceInfo.swagger_url, JSON.stringify(err, null, 2));
            return callback(err, null);
        }

    });
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
        }).then(function (success) {}, function (error) {});
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
        }).then(function (success) {}, function (error) {
            logger.pipeBuilder("Error with one serviceInfo: %s", JSON.stringify(serviceInfo, null, 2));
        });
    }).then(function (success) {
        callback(null);
        logger.pipeBuilder("All serviceInfos, that already exist in db, have been created");
    }, function (error) {
        callback(error);
        logger.pipeBuilder("Error in regeneration of serviceInfos that already exist in db");
    });
};
