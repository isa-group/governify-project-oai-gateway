'use strict';

module.exports.data = {
    services: {}
};

module.exports.addService = function(newServiceInfo) {
    this.data.services[newServiceInfo.name] = newServiceInfo;
};

module.exports.getServices = function() {
    var ret = [];
    for (var s in this.data.services) {
        ret.push(this.data.services[s]);
    }
    return ret;
};

module.exports.getServiceById = function(id) {
    return this.data.services[id];
};

module.exports.deleteAllServices = function() {
    this.data.services = {};
    return true;
};

module.exports.deleteServiceById = function(id) {
    delete this.data.services[id];
    return true;
};

module.exports.updateServiceById = function(id, serviceInfo) {
    this.data.services[id] = serviceInfo;
    return true;
};
