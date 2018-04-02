/*!
governify-project-oai-gateway 1.0.0, built on: 2018-03-27
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

const request = require('request');

const services = require('../database');
const logger = require('../logger');

module.exports = function (originalRequest, originalResponse, next) {
    logger.multiProxy("Initializing proxy for the path '%s'", originalRequest.originalUrl);
    if (false || originalRequest.originalUrl.indexOf('gateway') !== -1) {
        logger.multiProxy("It is not necessary to proxy the path '%s'", originalRequest.originalUrl);
        return next();
    }

    var refererFrom = originalRequest.headers.referer ? originalRequest.headers.referer.split('/')[3] : 'No referer';
    logger.multiProxy("Referer: '%s'", refererFrom);

    var servicePath = originalRequest.originalUrl.split('/')[1];

    logger.multiProxy("Searching service: '%s'", servicePath);
    services.getServiceById(servicePath, function (err, service) {
        if (err || !service) {
            logger.multiProxy("Service not found. Using 'refererFrom: %s'", refererFrom);
            services.getServiceById(refererFrom, function (err, service) {
                if (err) {
                    logger.multiProxy("There is no registered service for the name '%s'", servicePath);
                    return originalResponse.status(405).end("Method Not Allowed");
                } else {
                    var serviceInfo = service;
                    if (!serviceInfo) {
                        logger.multiProxy("There is no registered service for the name '%s'", servicePath);
                        return originalResponse.status(405).end("Method Not Allowed");
                    }
                    doProxy(serviceInfo, originalRequest, originalResponse, next);
                }
            });
        } else {
            var serviceInfo = service;
            if (!serviceInfo) {
                logger.multiProxy('There is not service registered for name %s', servicePath);
                return originalResponse.status(405).end("Method Not Allowed");
            }
            doProxy(serviceInfo, originalRequest, originalResponse, next);
        }
    });

};

function doProxy(serviceInfo, originalRequest, originalResponse, next) {
    logger.multiProxy("Proxying from originalRequest to singleProxy for: '%s'", serviceInfo.name);
    try {

        var originalRequestBody = JSON.stringify(originalRequest.body);
        var requestToSingleProxyOptions = {
            followRedirect: false,
            method: originalRequest.method,
            url: "http" + "://" + "localhost" + ":" + serviceInfo.port + (originalRequest.originalUrl.replace('/' + serviceInfo.name, '')).replace(/([^:]\/)\/+/g, "$1"),
            body: originalRequestBody
        };
        logger.debug("requestToSingleProxyOptions for: '%s'", serviceInfo.name, JSON.stringify(requestToSingleProxyOptions, null, 2));
        if (requestToSingleProxyOptions.method === 'HEAD') {
            delete requestToSingleProxyOptions.body;
        }
        //originalResponse.setHeader("host", originalRequest.headers.host);
        var newHeaders = {};
        for (var originalRequestHeader in originalRequest.headers) {
            var hlower = originalRequestHeader.toLowerCase();
            if (hlower === 'authorization' || hlower === 'content-type' || hlower === 'user-agent' ||
                hlower === 'accept' || hlower === 'connection' || hlower === 'cache-control' ||
                hlower === 'pragma') {
                newHeaders[originalRequestHeader] = originalRequest.headers[originalRequestHeader];
            }
        }

        requestToSingleProxyOptions.headers = newHeaders;

        logger.debug("Sending to SingleProxy: %s", JSON.stringify(requestToSingleProxyOptions, null, 2));
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        request(requestToSingleProxyOptions, function (err, singleProxyResponse) {
            if (!err) {
                if (singleProxyResponse.statusCode === 404) {
                    return next();
                }

                for (var singleProxyResponseHeader in singleProxyResponse.headers) {
                    originalResponse.setHeader(singleProxyResponseHeader, singleProxyResponse.headers[singleProxyResponseHeader]);
                }

                logger.multiProxy('Status from proxied server: %s', singleProxyResponse.statusCode);
                if (singleProxyResponse.statusCode === 302 || singleProxyResponse.statusCode === 301) {
                    logger.multiProxy('Redirecting: %s', '/' + serviceInfo.name + singleProxyResponse.headers.location);
                    originalResponse.redirect('/' + serviceInfo.name + singleProxyResponse.headers.location);
                } else {
                    logger.multiProxy("Piping response from '%s'", singleProxyResponse.request.href);
                    var newHeaders = singleProxyResponse.headers;
                    for (var singleProxyResponseHeader2 in singleProxyResponse.headers) {
                        // if (singleProxyResponseHeader2 === 'authorization' || singleProxyResponseHeader2 === 'content-type') {
                        newHeaders[singleProxyResponseHeader2] = singleProxyResponse.headers[singleProxyResponseHeader2];
                        // }
                    }
                    originalResponse.headers = newHeaders;
                    originalResponse.send(singleProxyResponse.body);
                }
            } else {
                logger.error("Error in request: '%s'. Options: '%s'", err, requestToSingleProxyOptions);
                originalResponse.status(500).end(err.toString());
            }
        }).on('error', function (err) {
            logger.error("Error in request: '%s'. Options: '%s'", err, requestToSingleProxyOptions);
            originalResponse.status(500).end(err.toString());
        });

    } catch (e) {
        console.log(e);
        originalResponse.status(503).send("Proxied server unreachable:" + e);
    }
}