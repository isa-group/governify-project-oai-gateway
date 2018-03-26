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
import Auth0Lock from '../src/index';
import * as h from './helper/ui';

describe('show lock with flash message', function() {
  before(h.stubWebApis);
  after(h.restoreWebApis);

  describe('with invalid options', function() {
    beforeEach(function(done) {
      this.lock = new Auth0Lock('cid', 'domain');
      done();
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('should fail if type is not provided', function(done) {
      this.lock.on('unrecoverable_error', function(err) {
        done();
      });

      this.lock.show({
        flashMessage: {
          text: 'error'
        }
      });
    });

    it('should fail if type value is not valid', function(done) {
      this.lock.on('unrecoverable_error', function(err) {
        done();
      });

      this.lock.show({
        flashMessage: {
          type: 'not-valid',
          text: 'error'
        }
      });
    });

    it('should fail if text is not provided', function(done) {
      this.lock.on('unrecoverable_error', function(err) {
        done();
      });

      this.lock.show({
        flashMessage: {
          type: 'error'
        }
      });
    });
  });

  describe('with valid options', function() {
    it('should show an error flash message', function(done) {
      const lock = new Auth0Lock('cid', 'domain');

      lock.on('show', () => {
        var hasErrorMessage = h.hasErrorMessage(lock, 'error message');
        expect(hasErrorMessage).to.be.ok();
        lock.hide();
        done();
      });

      lock.show({
        flashMessage: {
          type: 'error',
          text: 'error message'
        }
      });
    });

    it('should show a success flash message', function(done) {
      const lock = new Auth0Lock('cid', 'domain');

      lock.on('show', () => {
        var hasSuccessMessage = h.hasSuccessMessage(lock, 'success message');
        expect(hasSuccessMessage).to.be.ok();
        lock.hide();
        done();
      });

      lock.show({
        flashMessage: {
          type: 'success',
          text: 'success message'
        }
      });
    });
  });
});
