'use strict';

var http = require('http');
var services = require('../database');
var request = require('request');

var config = require('../config');
var logger = config.logger;

module.exports = function (originalRequest, originalResponse, next) {
    logger.multiproxy("Initialize proxing for: %s", originalRequest.originalUrl);
    if (false || originalRequest.originalUrl.indexOf('gateway') !== -1) {
        logger.multiproxy("Is not need to do proxy for this path", originalRequest.originalUrl);
        return next();
    }

    var refererFrom = originalRequest.headers['referer'] ? originalRequest.headers['referer'].split('/')[3] : 'No referer';
    logger.multiproxy("Referer as service: %s ", refererFrom);

    logger.multiproxy("Finding service with name");
    var servicePath = originalRequest.originalUrl.split('/')[1];

    logger.multiproxy("Using path: %s", servicePath);
    services.getServiceById(servicePath, (err, service) => {
        if (err) {
            logger.multiproxy("Not found service. Using refererFrom: %s", refererFrom);
            services.getServiceById(refererFrom, (err, service) => {
                if (err) {
                    logger.multiproxy('There is not service registered for name %s', servicePath);
                    return originalResponse.status(405).end("Method Not Allowed");
                } else {
                    var serviceInfo = service;
                    doProxy(serviceInfo, originalRequest, originalResponse, next);
                }
            });
        } else {
            var serviceInfo = service;
            doProxy(serviceInfo, originalRequest, originalResponse, next);
        }
    });

};

function doProxy(serviceInfo, originalRequest, originalResponse, next) {
    logger.multiproxy("Proxing from originalRequest to singleProxy for: %s", serviceInfo.name);
    try {

        var originalRequestBody = JSON.stringify(originalRequest.body);
        var requestToSingleProxyOptions = {
            followRedirect: false,
            method: originalRequest.method,
            url: "http://localhost:" + serviceInfo.port + (originalRequest.originalUrl.replace('/' + serviceInfo.name, '')).replace(/([^:]\/)\/+/g, "$1"),
            body: originalRequestBody
        };
        if (requestToSingleProxyOptions.method === 'HEAD') delete requestToSingleProxyOptions.body;

        originalResponse.setHeader("host", originalRequest.headers.host);
        var newHeaders = {};
        for (var h in originalRequest.headers) {
            if (h === 'authorization' || h === 'content-type') {
                newHeaders[h] = originalRequest.headers[h];
            }
        }

        requestToSingleProxyOptions.headers = newHeaders;

        logger.debug("Sending to: %s", JSON.stringify(requestToSingleProxyOptions, null, 2));
        var requestToSingleProxy = request(requestToSingleProxyOptions, function (err, singleProxyResponse) {
            if (singleProxyResponse.statusCode === 404) {
                return next();
            }

            for (var h in singleProxyResponse.headers) {
                originalResponse.setHeader(h, singleProxyResponse.headers[h]);
            }

            logger.multiproxy('Status from proxied server: %s', singleProxyResponse.statusCode);
            if (singleProxyResponse.statusCode === 302 || singleProxyResponse.statusCode === 301) {
                logger.multiproxy('Redirecting: %s', '/' + serviceInfo.name + singleProxyResponse.headers['location']);
                originalResponse.redirect('/' + serviceInfo.name + singleProxyResponse.headers['location']);
            } else {
                logger.multiproxy("Piping response...");
                var newHeaders = singleProxyResponse.headers;
                for (var h in singleProxyResponse.headers) {
                    if (h === 'authorization' || h === 'content-type') {
                        newHeaders[h] = singleProxyResponse.headers[h];
                    }
                }
                originalResponse.headers = newHeaders;
                originalResponse.send(singleProxyResponse.body);
            }

        }).on('error', function (err) {
            logger.error("Error in request", requestToSingleProxyOptions);
            originalResponse.status(500).end(err.toString());
        });

    } catch (e) {
        console.log(e);
        originalResponse.status(503).send("Proxied server unreachable:" + e);
    }
}
