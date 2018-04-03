/*!
governify-project-oai-gateway 1.0.1, built on: 2018-04-03
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

const mongoose = require('mongoose');
const bluebird = require('bluebird');

const serviceSchema = require('./serviceSchema.json');
const config = require('../configurations');
const logger = require('../logger');

mongoose.Promise = bluebird;
module.exports = {
    connectDB: _connectDB
};

function _connectDB(callback) {
    var database = this;
    let mongoURI = "mongodb://" + config.database.host + ":" + config.database.port + "/" + config.database.name;
    mongoose.connect(mongoURI, function (err) {
        if (err) {
            callback(err);
            logger.error(err.toString());
        } else {
            logger.info("Database connection has been established at '%s'", mongoURI);
            var mongooseServiceSchema = new mongoose.Schema(serviceSchema, {
                minimize: false,
                versionKey: false,
                timestamps: {
                    createdAt: 'created_at',
                    updatedAt: 'updated_at'
                }
            });
            database.serviceModel = mongoose.model('Service', mongooseServiceSchema);
            callback(null);
        }
    });
}

module.exports.addService = function (newServiceInfo, callback) {
    new this.serviceModel(newServiceInfo).save(function (err, result) {
        if (err) {
            logger.db("Error while saving service: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            logger.db("Service has been saved successfully");
            callback(null, result);
        }
    });
};

module.exports.getServices = function (callback, userID, isAdmin) {
    var query = {};
    if (userID && !isAdmin) {
        query.userID = userID;
    }
    this.serviceModel.find(query, function (err, services) {
        if (err) {
            logger.db("Error while retrieving services: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            logger.db("%d services have been found.", services.length);
            callback(null, services);
        }
    });
};

module.exports.getServiceById = function (id, callback, userID, isAdmin) {
    var query = {
        name: id
    };
    if (userID && !isAdmin) {
        query.userID = userID;
    }
    this.serviceModel.findOne(query, function (err, service) {
        if (err) {
            logger.db("Error while retrieving services: %s", JSON.stringify(err.toString(), null, 2));
            callback(err, null);
        } else if (service) {
            logger.db("Service '%s' found", service.name);
            callback(null, service);
        } else {
            logger.db("Service not found for query '%s'", JSON.stringify(query, null, 2));
            callback(null, null);
        }
    });
};

module.exports.deleteAllServices = function (callback, userID, isAdmin) {
    var query = {};
    if (userID && !isAdmin) {
        query.userID = userID;
    }
    this.serviceModel.remove(query, function (err) {
        if (err) {
            logger.db("Error while removing services: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            callback(null);
        }
    });

};

module.exports.deleteServiceById = function (id, callback, userID, isAdmin) {
    var query = {
        name: id
    };
    if (userID && !isAdmin) {
        query.userID = userID;
    }
    this.serviceModel.remove(query, function (err) {
        if (err) {
            logger.db("Error while removing a service: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            callback(null);
        }
    });
};

module.exports.updateServiceById = function (id, serviceInfo, callback, userID, isAdmin) {
    var query = {
        name: id
    };
    if (userID && !isAdmin) {
        query.userID = userID;
    }
    this.serviceModel.update(query, serviceInfo, function (err, result) {
        if (err) {
            logger.db("Error while updating services: %s", JSON.stringify(err.toString()));
            callback(err, null);
        } else {
            callback(result);
        }
    });
};
