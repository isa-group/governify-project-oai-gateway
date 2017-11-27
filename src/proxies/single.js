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

var request = require('request');
var services = require('../database');

var config = require('../config');
var logger = config.logger;

module.exports = function (singleProxyRequest, singleProxyResponse, next) {

    if (singleProxyRequest.originalUrl.indexOf('plans') !== -1 || singleProxyRequest.originalUrl.indexOf('docs') !== -1)
        return next();

    services.getServiceById(singleProxyRequest.serviceProxied, function (err, serviceInfo) {
        if (err) {
            singleProxyResponse.json({
                code: 500,
                message: err.toString()
            });
        } else {
            var proxiedServer = serviceInfo.url;
            var path = singleProxyRequest.originalUrl;

            var builtURL = proxiedServer.replace(/\/?$/, '/') + path.replace(/^\/|\/$/g, '');

            logger.singleproxy("Sending to server: " + builtURL + "...");

            try {
                var renameHost = proxiedServer.split('//')[1];
                //singleProxyResponse.setHeader("host", renameHost);
                var newHeaders = {};
                newHeaders.host = renameHost.split('/')[0];
                //console.log(singleProxyRequest.body);
                //logger.debug("preheader (single): " + JSON.stringify(singleProxyRequest.headers));
                for (var h in singleProxyRequest.headers) {
                    var hlower = h.toLowerCase();
                    if (hlower === 'authorization' || hlower === 'content-type' || hlower === 'user-agent' ||
                        hlower === 'accept' || hlower === 'connection' || hlower === 'cache-control' ||
                        hlower === 'pragma') {
                        newHeaders[h] = singleProxyRequest.headers[h];
                    }
                }
                newHeaders['upgrade-insecure-requests'] = 1;
                var requestBody = JSON.stringify(singleProxyRequest.body);
                logger.debug("Bypassed headers from (single): " + JSON.stringify(newHeaders));
                // logger.debug("Bypassed body from (single): " + requestBody);
                var realServerRequestOptions = {
                    method: singleProxyRequest.method,
                    url: builtURL,
                    headers: newHeaders,
                    body: requestBody
                };

                if (realServerRequestOptions.method === 'HEAD' || realServerRequestOptions.method === 'GET')
                    delete realServerRequestOptions.body;
                logger.debug("Sending to RealServer: %s", JSON.stringify(realServerRequestOptions, null, 2));
                var requestToRealServer = request(realServerRequestOptions, function (err, realServerResponse) {
                    if (err) {
                        logger.error("Error from realServer: " + err);
                        singleProxyResponse.status(503).send(err);
                    } else {
                        logger.debug("Response from realServer: " + JSON.stringify(realServerResponse, null, 2));
                        for (var h in realServerResponse.headers) {
                            // if (h === 'authorization' || h === 'content-type') {
                            singleProxyResponse.setHeader(h, realServerResponse.headers[h]);
                            // }
                        }
                        singleProxyResponse.send(realServerResponse.body);
                    }
                });

            } catch (e) {
                logger.error("Error in singleProxy: " + e.toString());
                singleProxyResponse.status(503);
                singleProxyResponse.send("Proxied server unreachable:" + e);
            }
        }
    });
};