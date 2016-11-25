'use strict';
// Dependencies
var express = require('express'),
    swaggerTools = require('swagger-tools'),
    jsyaml = require('js-yaml'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    cors = require('cors');
// configuration and parametrization
var config = require('./config');
var logger = config.logger;
var serverPort = (process.env.PORT || config.port);
var app = express();
var proxy = require('./proxies/multi');

app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
    req._app = app;
    next();
});

app.use(proxy);

// swaggerRouter configuration
var optionsV1 = {
    swaggerUi: '/swagger/v1.json',
    controllers: './controllers/v1',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var specV1 = fs.readFileSync('./api/swagger/v1.yaml', 'utf8');
var swaggerDocV1 = jsyaml.safeLoad(specV1);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDocV1, function(middleware) {
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

    // Start the server
    app.listen(serverPort, function() {
        logger.info('Your server is listening  on port %d (http://localhost:%d/gateway/api/v1/services)', serverPort, serverPort);
        logger.info('Swagger-ui is available on http://localhost:%d/gateway/api/v1/docs', serverPort);
    });
});
