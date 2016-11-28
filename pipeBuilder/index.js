'use strict';

var database = require('../database'),
        express = require('express'),
        swaggerTools = require('swagger-tools'),
        bodyParser = require('body-parser'),
        jsyaml = require('js-yaml'),
        request = require('request'),
        slaManager = require('sla4oai-tools');

var config = require('../config'),
        logger = config.logger,
        singleProxy = require('../proxies/single');

module.exports.generate = function (newServiceInfo, callback) {
    //create the new serverWith express
    var app = express();
    config.port++;
    newServiceInfo.port = config.port;

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
            logger.info("Initialize slaManager from: %s", JSON.stringify(swaggerDoc.info['x-sla']));
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

                    app.listen(newServiceInfo.port, function () {
                        logger.info("Create %s", JSON.stringify(newServiceInfo, null, 2));
                        database.addService(newServiceInfo);
                        return callback(null);
                    });
                });

            });




        } else {
            logger.info("Error while it was retrieving swaggerDoc from %s. %s", newServiceInfo.swagger_url, JSON.stringify(err, null, 2));
            return callback(err, null);
        }

        //return callback({err, response}, null);
    });
}
