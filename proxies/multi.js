'use strict';

var http = require('http');
var services = require('../database').data.services;

var config = require('../config');
var logger = config.logger;

module.exports = function (originalRequest, originalResponse, next) {
    //(req.originalUrl.indexOf('docs') !== -1 && req.headers['referer'] && req.headers['referer'].indexOf('plans') === -1)
    if (false || originalRequest.originalUrl.indexOf('gateway') !== -1)
        return next();

    logger.info("Referer from: %s as service: %s ",
            originalRequest.headers['referer'], (originalRequest.headers['referer'] ? originalRequest.headers['referer'].split('/')[3] : 'No referer'));

    logger.info("Proxing internal %s ...", originalRequest.originalUrl);
    var servicePath = originalRequest.originalUrl.split('/')[1];
    var serviceInfo = services[servicePath] ||
            services[(originalRequest.headers['referer'] ? originalRequest.headers['referer'].split('/')[3] : 'No referer')];

    if (!serviceInfo) {
        logger.info('There is not service registered for name %s', servicePath);
        return originalResponse.status(405).end("Method Not Allowed");
    }

    try {
        var requestToSingleProxyOptions = {
            hostname: 'localhost',
            port: serviceInfo.port,
            path: (originalRequest.originalUrl.replace('/' + serviceInfo.name, '')).replace(/([^:]\/)\/+/g, "$1"),
            method: originalRequest.method
        };

        originalResponse.setHeader("host", originalRequest.headers.host);
        logger.debug("preheader: (multi) " + JSON.stringify(originalRequest.headers));
        var newHeaders = originalRequest.headers;
        for (var h in originalRequest.headers) {
            if (h === 'authorization' || h === 'content-type') {
                newHeaders[h] = originalRequest.headers[h];
            }
        }

        requestToSingleProxyOptions.headers = newHeaders;

        logger.debug("Bypassed headers from (multi): " + JSON.stringify(newHeaders));

        logger.debug("Sending to: %s", JSON.stringify(requestToSingleProxyOptions));
        var requestToSingleProxy = http.request(requestToSingleProxyOptions, function (singleProxyResponse) {
            if (singleProxyResponse.statusCode === 404) {
                return next();
            }

            for (var h in singleProxyResponse.headers) {
                originalResponse.setHeader(h, singleProxyResponse.headers[h]);
            }

            logger.info('Status from proxied server: %s', singleProxyResponse.statusCode);
            if (singleProxyResponse.statusCode === 302 || singleProxyResponse.statusCode === 301) {
                logger.info('Redirecting: %s', '/' + serviceInfo.name + singleProxyResponse.headers['location']);
                originalResponse.redirect('/' + serviceInfo.name + singleProxyResponse.headers['location']);
            } else {
                logger.info("Piping response...");
                singleProxyResponse.pipe(originalResponse);
            }

        }).on('error', function (err) {
            logger.warning("Error in request", requestToSingleProxyOptions);
            logger.warning("Details: ", err.message);
            logger.warning("Service info: ", serviceInfo);
            originalResponse.status(500).end(err.toString());
        });

        if (!(Object.keys(originalRequest.body).length === 0 && originalRequest.body.constructor === Object) && !/\/docs\/?|\/plans\/?|\/api-docs\/?/.test(originalRequest.originalUrl)) {
            logger.debug("Proxing ", originalRequest.originalUrl);
//            requestToSingleProxy.write(JSON.stringify(originalRequest.body));
        }
        originalRequest.pipe(requestToSingleProxy);

    } catch (e) {
        originalResponse.status(503);
        originalResponse.send("Proxied server unreachable:" + e);
    }

};
