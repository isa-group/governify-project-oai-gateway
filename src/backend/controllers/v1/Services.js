/*!
governify-gateway 1.0.0, built on: 2018-03-27
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

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

const Services = require('./ServicesService');


module.exports.servicesPOST = function servicesPOST(req, res, next) {
    Services.servicesPOST(req, res, next);
};

module.exports.servicesGET = function servicesGET(req, res, next) {
    Services.servicesGET(req, res, next);
};

module.exports.servicesDELETE = function servicesDELETE(req, res, next) {
    Services.servicesDELETE(req, res, next);
};

module.exports.servicesIdGET = function servicesIdGET(req, res, next) {
    Services.servicesIdGET(req, res, next);
};

module.exports.servicesIdDELETE = function servicesIdDELETE(req, res, next) {
    Services.servicesIdDELETE(req, res, next);
};

module.exports.servicesIdPUT = function servicesIdPUT(req, res, next) {
    Services.servicesIdPUT(req, res, next);
};
