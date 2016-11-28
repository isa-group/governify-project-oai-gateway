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
                singleProxyResponse.setHeader("host", renameHost);
                var newHeaders = {};
                //console.log(singleProxyRequest.body);
                //logger.debug("preheader (single): " + JSON.stringify(singleProxyRequest.headers));
                for (var h in singleProxyRequest.headers) {
                    if (h === 'authorization' || h === 'content-type') {
                        newHeaders[h] = singleProxyRequest.headers[h];
                    }
                }
                var requestBody = JSON.stringify(singleProxyRequest.body);
                //logger.debug("Bypassed headers from (single): " + JSON.stringify(newHeaders));
                // logger.debug("Bypassed body from (single): " + requestBody);
                var realServerRequestOptions = {
                    method: singleProxyRequest.method,
                    url: builtURL,
                    headers: newHeaders,
                    body: requestBody
                };

                if (realServerRequestOptions.method === 'HEAD')
                    delete realServerRequestOptions.body;
                var requestToRealServer = request(realServerRequestOptions, function (err, realServerResponse) {
                    if (err) {
                        logger.error("Error from realServer: " + err);
                        singleProxyResponse.status(503).send(err);
                    } else {
                        logger.debug("Response from realServer: " + JSON.stringify(realServerResponse, null, 2));
                        for (var h in realServerResponse.headers) {
                            if (h === 'authorization' || h === 'content-type') {
                                singleProxyResponse.setHeader("content-type", realServerResponse.headers["content-type"]);
                            }
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
