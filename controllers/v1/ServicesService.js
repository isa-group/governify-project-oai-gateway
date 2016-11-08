'use strict';

var config = require('../../config');
var logger = require('../../config').logger;
var pipeBuilder = require('../../pipeBuilder');

exports.servicesPOST = function (req, res, next) {
    /**
     * parameters expected in the args:
     *  ServiceInfo (RequestInfo)
     **/

    var args = req.swagger.params;

    pipeBuilder.generate(args.serviceInfo.value, function (err, data) {
        if (!err)
            return res.status(201).end("Created.");

        return res.json(err);
    });
}
