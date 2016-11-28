'use strict';
var mongoose = require('mongoose'),
    config = require('../config'),
    bluebird = require('bluebird'),
    logger = config.logger;

mongoose.Promise = bluebird;
module.exports = {
    connectDB: _connectDB
}

function _connectDB(callback) {
    var database = this;
    mongoose.connect(config.database.url + "/" + config.database.db_name, (err) => {
        if (err) {
            callback(err);
            logger.error(err.toString());
        } else {
            logger.info("Database connection has been stablished!!");
            database.serviceModel = mongoose.model('Service', new mongoose.Schema(require('./serviceSchema.json'), {
                minimize: false,
                versionKey: false,
                timestamps: {
                    createdAt: 'created_at',
                    updatedAt: 'updated_at'
                }
            }));
            callback(null);
        }
    });
}

module.exports.addService = function (newServiceInfo, callback) {
    new this.serviceModel(newServiceInfo).save((err, result) => {
        if (err) {
            logger.db("Error while saving service: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            logger.db("Service has been saved successfully");
            callback(null, result);
        }
    });
};

module.exports.getServices = function (callback, userID) {
    var query = {};
    if (userID) {
        query.userID = userID;
    }
    this.serviceModel.find(query, (err, services) => {
        if (err) {
            logger.db("Error while retrieving services: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            logger.db("%d have been found.", services.length);
            callback(null, services);
        }
    });
};

module.exports.getServiceById = function (id, callback, userID) {
    var query = {
        name: id
    };
    if (userID) {
        query.userID = userID;
    }
    this.serviceModel.findOne(query, (err, service) => {
        if (err) {
            logger.db("Error while retrieving services: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            logger.db("Found: %s", JSON.stringify(service, null, 2));
            callback(null, service);
        }
    });
};

module.exports.deleteAllServices = function (callback, userID) {
    this.serviceModel.remove({
        userID: userID
    }, (err, result) => {
        if (err) {
            logger.db("Error while removing services: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            callback(null);
        }
    });
};

module.exports.deleteServiceById = function (id, callback, userID) {
    this.serviceModel.remove({
        name: id,
        userID: userID
    }, (err, result) => {
        if (err) {
            logger.db("Error while removing a service: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            callback(null);
        }
    });
};

module.exports.updateServiceById = function (id, serviceInfo, callback, userID) {
    this.serviceModel.update({
        name: id,
        userID: userID
    }, serviceInfo, (err, result) => {
        if (err) {
            logger.db("Error while updating services: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            callback(result);
        }
    });
};
