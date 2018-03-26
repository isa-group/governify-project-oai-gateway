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

import expect from 'expect.js';
import webApi from '../src/core/web_api';
import * as h from './helper/ui';

describe('regression', function() {
  before(h.stubWebApis);
  after(h.restoreWebApis);

  beforeEach(function(done) {
    const opts = {
      rememberLastLogin: false
    };

    this.lock = h.displayLock('all', opts, done);
  });

  afterEach(function() {
    this.lock.hide();
  });

  it('does not attempt to log in with an empty email input', function() {
    h.fillEmailInput(this.lock, 'test@test.te');
    h.fillEmailInput(this.lock, '');
    h.fillPasswordInput(this.lock, 'anypass');

    h.submit(this.lock);

    expect(webApi.logIn.callCount).to.equal(0);
  });
});
