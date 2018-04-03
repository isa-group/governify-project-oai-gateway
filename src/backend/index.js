/*!
governify-project-oai-gateway 1.0.2, built on: 2018-04-03
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-project-oai-gateway

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

// Dependencies
const express = require('express');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsonwebtoken = require('jsonwebtoken');
const errorhandler = require('errorhandler');
const compression = require('compression');
const requestModule = require('request');
const helmet = require('helmet');
const http = require('http');

const config = require('./configurations');
const proxy = require('./proxies/multi');
const logger = require('./logger');
const database = require('./database');
const pipeBuilder = require('./pipeBuilder');

const serverPort = process.env.PORT || config.server.port;
const app = express();


if (config.server.bypassCORS) {
    logger.info("Adding 'Access-Control-Allow-Origin: *' header to every path.");
    app.use(cors());
}
if (config.server.useHelmet) {
    logger.info("Adding Helmet related headers.");
    app.use(helmet());
}

app.use(compression());
app.use(errorhandler());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const frontendPath = __dirname + '/../frontend';
logger.info("Serving '%s' as static folder", frontendPath);
app.use(express.static(frontendPath));

app.use("/gateway", function (request, response, next) {
    function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }

    var token = fromHeaderOrQuerystring(request);

    logger.debug('Received token:', token);
    if (token) {
        try {
            var secret = Buffer.from(config.auth0.AUTH0_SECRET, 'base64');
            var verified = jsonwebtoken.verify(token, secret);
            if (verified) {
                if (verified.aud === config.auth0.AUTH0_CLIENT_ID) {
                    requestModule({
                        method: 'POST',
                        uri: 'https://' + config.auth0.AUTH0_DOMAIN + '/tokeninfo',
                        headers: [{
                            name: 'content-type',
                            value: 'application/x-www-form-urlencoded'
                        }],
                        form: {
                            id_token: token
                        }

                    },
                        function (err, res, stringProfile) {

                            if (err) {
                                logger.warning('err', err);
                                response.status(401).send("You shall not pass. Error while getting user profile");
                            } else {
                                var profile = JSON.parse(stringProfile);
                                var isAdmin = profile.roles.find(function (role) {
                                    if (role === "admin") {
                                        return true;
                                    }
                                });
                                if (isAdmin) {
                                    logger.info("An ADMIN request to '" + response.req.url + "' from '" + profile.name + "' is being served");
                                    request.isAdmin = true;
                                } else {
                                    logger.info("A request to '" + response.req.url + "' from '" + profile.name + "' is being served");
                                }
                                logger.debug("Setting request.userID to: " + verified.sub);
                                request.userID = verified.sub;
                                next();
                            }
                        });
                } else {
                    logger.warning("Invalid JWT payload", verified);
                    response.status(401).send("You shall not pass. Invalid JWT payload");
                }
            } else {
                logger.warning("Invalid JWT signature");
                response.status(401).send("You shall not pass. Invalid JWT signature");
            }
        } catch (err) {
            logger.warning("WARNING: invalid JWT signature");
        }
    } else {
        logger.warning("No token was given");
        response.status(401).send("You shall not pass. No token was given");
    }
});

app.use(proxy);

app.use(function (req, res, next) {
    res.setHeader('charset', 'utf-8');
    next();
});

app.use(function (req, res, next) {
    req._app = app;
    //delete in the future
    //req.userID = "google-oauth2|109969872687666085481";
    next();
});



// swaggerRouter configuration
var optionsV1 = {
    swaggerUi: '/swagger/v1.json',
    controllers: './src/backend/controllers/v1',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var specV1 = fs.readFileSync('./src/backend/api/swagger/v1.yaml', 'utf8');
var swaggerDocV1 = jsyaml.safeLoad(specV1);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDocV1, function (middleware) {
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(optionsV1));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi({
        apiDocs: swaggerDocV1.basePath + '/api-docs',
        swaggerUi: swaggerDocV1.basePath + '/docs'
    }));


    var server = http.createServer(app);
    exports.server = server;
    database.connectDB(function (err) {
        if (err) {
            logger.error("Database connection cannot be established. A MongoDB persistence layer is needed to run this app. This error is not recoverable: exiting now");
            process.exitCode = 1;
            process.exit();
        } else {
            // Start the server
            database.getServices(function (err, services) {
                pipeBuilder.regenerate(services, function (err) {
                    if (err) {
                        logger.info("Error regenerating pipe for services.");
                    }
                    server.listen(serverPort, function () {
                        logger.info("The Server is listening on port %d. Useful paths:", serverPort);
                        logger.info("1) API documentation: http://localhost:%d/gateway/api/v1/docs", serverPort);
                        logger.info("2) Services frontend: http://localhost:%d/#!/home", serverPort);
                        logger.info("3) Services API: http://localhost:%d/gateway/api/v1/services?token=xxx", serverPort);

                    });
                });
            });
        }
    });

    exports.close = function (callback) {
        if (server.listening) {
            server.close(callback);
        } else {
            callback();
        }
    };

});