'use strict';

var database = require('../database'),
    express = require('express'),
    swaggerTools = require('swagger-tools'),
    bodyParser = require('body-parser'),
    jsyaml = require('js-yaml'),
    request = require('request'),
    Promise = require('bluebird'),
    slaManager = require('sla4oai-tools');

var config = require('../config'),
    logger = config.logger,
    singleProxy = require('../proxies/single');

module.exports.runningPipes = {};
module.exports.generate = function (newServiceInfo, callback) {
    //create the new serverWith express
    var app = express();
    config.pipePorts++;
    newServiceInfo.port = config.pipePorts;

    app.use(bodyParser.json());
    app.use(function (req, res, next) {
        req.serviceProxied = newServiceInfo.name;
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
}

module.exports.deletePipe = function (name, callback) {
    var runningPipes = this.runningPipes;
    try {
        logger.pipeBuilder("removing pipe for %s", name);
        runningPipes[name].close(() => {
            delete runningPipes[name];
            callback(null);
        });
    } catch (e) {
        logger.pipeBuilder("Error while removing pipe with name: '%s': %s ", name, e.toString());
        callback(e);
    }
}

module.exports.deleteAllPipe = function (callback) {
    var runningPipes = this.runningPipes;
    var promiseArray = [];
    logger.debug("runningPipes before deleteAllPipe");
    //console.log(runningPipes);
    for (var p in runningPipes) {
        runningPipes[p].name = p;
        promiseArray.push(runningPipes[p]);
    }
    Promise.each(promiseArray, (pipe) => {
        return new Promise((resolve, reject) => {
            try {
                logger.pipeBuilder("removing pipe for %s", pipe.name);
                runningPipes[pipe.name].close(() => {
                    delete runningPipes[pipe.name];
                    return resolve(pipe);
                });
            } catch (e) {
                logger.pipeBuilder("Error while removing pipe with name: '%s' over deleteAll:  %s ", pipe.name, e.toString());
                return reject(e);
            }
        }).then((success) => {}, (error) => {});
    }).then((success) => {
        logger.pipeBuilder("deleteAllPipe has finished");
        //console.log(module.exports.runningPipes);
        callback(null);
        //delete runningPipes = {};
    }, (error) => {
        logger.pipeBuilder("Error while removing all pipes: %s", error.toString());
        callback(error);
    });
}

module.exports.regenerate = function (serviceInfos, callback) {
    logger.pipeBuilder("Creating pipe for serviceInfos that already exist in db");
    Promise.each(serviceInfos, (serviceInfo) => {
        return new Promise((resolve, reject) => {
            module.exports.generate(serviceInfo, (err, data) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(data);
                }
            });
        }).then((success) => {}, (error) => {
            logger.pipeBuilder("Error with one serviceInfo: %s", JSON.stringify(serviceInfo, null, 2));
        });
    }).then((success) => {
        callback(null);
        logger.pipeBuilder("All serviceInfos, that already exist in db, have been created");
    }, (error) => {
        callback(error);
        logger.pipeBuilder("Error in regeneration of serviceInfos that already exist in db");
    });
}
