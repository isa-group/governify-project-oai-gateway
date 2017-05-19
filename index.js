'use strict';

// Dependencies
var express = require('express');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var bodyParser = require('body-parser');
var cors = require('cors');
var jsonwebtoken = require('jsonwebtoken');
var errorhandler = require('errorhandler');
var compression = require('compression');
var requestModule = require('request');
var helmet = require('helmet');

var config = require('./src/config');
var proxy = require('./src/proxies/multi');
var logger = config.logger;
var database = require('./src/database');
var pipeBuilder = require('./src/pipeBuilder');

var serverPort = (process.env.PORT || config.port);
var app = express();


app.use(helmet());
app.use(compression());
app.use(errorhandler());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + '/public'));

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
            var secret = Buffer.from(config.AUTH0_SECRET, 'base64');
            var verified = jsonwebtoken.verify(token, secret);
        } catch (err) {
            logger.warning("WARNING: invalid JWT signature");
        }
        if (verified) {
            if (verified.aud === config.AUTH0_CLIENT_ID) {
                requestModule({
                        method: 'POST',
                        uri: 'https://' + config.AUTH0_DOMAIN + '/tokeninfo',
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
                                logger.info("An ADMIN request to '" + response.req.url + "' from '" + profile["name"] + "' is being served");
                                request.isAdmin = true;
                            } else {
                                logger.info("A request to '" + response.req.url + "' from '" + profile["name"] + "' is being served");
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
    controllers: './src/controllers/v1',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var specV1 = fs.readFileSync('./src/api/swagger/v1.yaml', 'utf8');
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

    database.connectDB(function (err) {
        if (err)
            throw new Error("Database connection has been failed.");
        // Start the server
        database.getServices(function (err, services) {
            pipeBuilder.regenerate(services, function (err) {
                if (err)
                    logger.info("Error regenerating pipe for services.");

                app.listen(serverPort, function () {
                    logger.info('Your server is listening  on port %d (http://localhost:%d/gateway/api/v1/services)', serverPort, serverPort);
                    logger.info('Swagger-ui is available on http://localhost:%d/gateway/api/v1/docs', serverPort);
                });
            });
        });
    });
});