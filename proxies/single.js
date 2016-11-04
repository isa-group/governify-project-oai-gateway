'use strict';

var request = require('request'),
        http = require('http'),
        url = require('url'),
        services = require('../database').data.services;

var config = require('../config'),
        services = require('../database').data.services,
        logger = config.logger;

module.exports = function (req, res, next) {
logger.debug("New income request",JSON.stringify()  (req))
    if (req.originalUrl.indexOf('plans') !== -1 || req.originalUrl.indexOf('docs') !== -1)
        return next();

    var proxiedServer = services[req.serviceProxied].url;
    var path = req.originalUrl;

    logger.info("Sending to server: " + proxiedServer + path + "...");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
        var renameHost = services[req.serviceProxied].url.split('//')[1];
        res.setHeader("host", renameHost);
        var newHeaders = req.headers;
        newHeaders["host"] = renameHost;
        logger.info("Headers bypassed (single) to new request: " + JSON.stringify(newHeaders));
        
        req.pipe(request({url: proxiedServer + path, headers: newHeaders}, function (err, response) {
            if (err) {
                res.status(503).send(err);
                logger.warning(err);
            }
            if (response)
                logger.info("Response from server: " + response.status);
        })).pipe(res);

    } catch (e) {

        res.status(503)
        res.send("Proxied server (single) unreachable: " + e);

    }

}
