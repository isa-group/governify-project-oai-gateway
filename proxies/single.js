'use strict';

var request = require('request');
var services = require('../database').data.services;

var config = require('../config');
var services = require('../database').data.services;
var logger = config.logger;

module.exports = function(singleProxyRequest, singleProxyResponse, next) {

    if (singleProxyRequest.originalUrl.indexOf('plans') !== -1 || singleProxyRequest.originalUrl.indexOf('docs') !== -1)
        return next();

    var proxiedServer = services[singleProxyRequest.serviceProxied].url;
    var path = singleProxyRequest.originalUrl;

    var builtURL = proxiedServer.replace(/\/?$/, '/') + path.replace(/^\/|\/$/g, '');

    logger.info("Sending to server: " + builtURL + "...");

    try {
        var renameHost = services[singleProxyRequest.serviceProxied].url.split('//')[1];
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
        }

        if (realServerRequestOptions.method === 'HEAD') delete realServerRequestOptions.body;
        var requestToRealServer = request(realServerRequestOptions, function(err, realServerResponse) {
            if (err) {
                logger.info("error from proxy: " + err);
                singleProxyResponse.status(503).send(err);
            } else {
                logger.debug("Response from server: " + JSON.stringify(realServerResponse));
                singleProxyResponse.setHeader("content-type", realServerResponse.headers["content-type"]);
                singleProxyResponse.send(realServerResponse.body);
            }
        });


        //        singleProxyRequest.pipe(requestToRealServer);

    } catch (e) {
        console.log(e);
        singleProxyResponse.status(503);
        singleProxyResponse.send("Proxied server unreachable:" + e);

    }

};
