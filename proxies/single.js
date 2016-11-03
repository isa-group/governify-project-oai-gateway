'use strict';

var request   = require('request'),
    http      = require('http'),
    url       = require('url'),
    services  = require('../database').data.services;

var config    = require('../config'),
    services  = require('../database').data.services,
    logger    = config.logger;

module.exports = function (req, res, next) {

  if( req.originalUrl.indexOf('plans') !== -1 || req.originalUrl.indexOf('docs') !== -1 ) return next();

  var proxiedServer = services[req.serviceProxied].url;
  var path = req.originalUrl;

  logger.info("Sending to server: " + proxiedServer + path + "...");

  try {
      var renameHost = services[req.serviceProxied].url.split('//')[1];
      res.setHeader("host", renameHost);
      req.pipe(request({ url: proxiedServer + path, headers: { host: renameHost } }, function (err, response) {
        if (err) {
          res.sendStatus(503);
        }
        logger.info("Response from server: " + response.statusCode);
      })).pipe(res);

  } catch (e) {

      res.status(503)
      res.send("Proxied server unreachable:" + e);

  }

}
