'use strict';

module.exports.data = {
    services: {},

};

module.exports.addService = function (newServiceInfo){
    this.data.services[newServiceInfo.name] = newServiceInfo;
}
