'use strict';

var request   = require('request'),
    http      = require('http'),
    services  = require('../database').data.services;

var config = require('../config'),
    logger = config.logger;

module.exports = function (req, res, next) {
    //(req.originalUrl.indexOf('docs') !== -1 && req.headers['referer'] && req.headers['referer'].indexOf('plans') === -1)
    if( false || req.originalUrl.indexOf('gateway') !== -1 ) return next();

    logger.info("Referer from: %s as service: %s ",
      req.headers['referer'], (req.headers['referer'] ? req.headers['referer'].split('/')[3] : 'No referer'));

    logger.info("Proxing internal %s ...", req.originalUrl );
    var servicePath = req.originalUrl.split('/')[1];
    var serviceInfo = services[servicePath] ||
                      services[(req.headers['referer'] ? req.headers['referer'].split('/')[3] : 'No referer')];

    if(!serviceInfo){
        logger.info('There is not service registered for name %s', servicePath);
        return res.status(405).end("Method Not Allowed");
    }

    try{
      var proxiedServer = {
        hostname: 'localhost',
        port: serviceInfo.port,
        path: req.originalUrl.replace('/'+serviceInfo.name, '')
      }

      logger.info("Sending to: %s",  JSON.stringify(proxiedServer));
      res.setHeader("host", req.headers.host);
      var proxiedRequest = http.request(proxiedServer, function(response){
        if(response.statusCode === 404){
            return next();
        }

        for (var h in response.headers){
            res.setHeader(h, response.headers[h]);
        }

        logger.info('Status from proxied server: %s' , response.statusCode);
        if (response.statusCode === 302 || response.statusCode === 301 ) {
            logger.info('Redirecting: %s' , '/' + serviceInfo.name + response.headers['location']);
            res.redirect('/' + serviceInfo.name + response.headers['location']);
        }else{
            logger.info("Piping response...");
            response.pipe(res);
        }

      }).on('error', (err, ress) => {
          logger.info(err, ress);
          res.status(500).end(err.toString());
      });

      req.pipe(proxiedRequest);

    }catch(e){

      res.status(503)
      res.send("Proxied server unreachable:" + e);

    }

}
