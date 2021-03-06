/*!
governify-project-oai-gateway 1.0.2, built on: 2018-04-03
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
/* jshint expr: true */

var expect = require('chai').expect;
var lib = require('../src/backend');

/*
 * USE MOCHA AND CHAI for testing your code
 */

describe('First Level test', function () {
    this.timeout(10000);
    it('Execute', (done) => {
        var result = lib.server;
        expect(result).to.not.be.null;
        done();
    });
});