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
import * as h from './helper/ui';

describe('sign up terms agreement', function() {
  before(h.stubWebApis);
  after(h.restoreWebApis);

  describe('without a mustAcceptTerms opt', function() {
    beforeEach(function(done) {
      const opts = {
        initialScreen: 'signUp',
        rememberLastLogin: false
      };

      this.lock = h.displayLock('single database', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('should not ask the user to accept terms', function() {
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
      expect(h.isSubmitButtonDisabled(this.lock)).to.not.be.ok();
      expect(h.hasTermsCheckbox(this.lock)).to.not.be.ok();
    });
  });

  describe('with a mustAcceptTerms opt', function() {
    beforeEach(function(done) {
      const opts = {
        initialScreen: 'signUp',
        mustAcceptTerms: true,
        rememberLastLogin: false
      };

      this.lock = h.displayLock('single database', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('asks the user to accept terms before sumbitting', function() {
      expect(h.isSubmitButtonDisabled(this.lock)).to.be.ok();
      expect(h.hasTermsCheckbox(this.lock)).to.be.ok();
    });

    describe('when the terms are accepted', function() {
      beforeEach(function() {
        h.clickTermsCheckbox(this.lock);
      });

      it('lets the user sign up', function() {
        expect(h.hasTermsCheckbox(this.lock)).to.be.ok();
        expect(h.hasSubmitButton(this.lock)).to.be.ok();
        expect(h.isSubmitButtonDisabled(this.lock)).to.not.be.ok();
      });

      describe('and then rejected', function() {
        beforeEach(function() {
          h.clickTermsCheckbox(this.lock);
        });

        it('lets the user sign up', function() {
          expect(h.hasTermsCheckbox(this.lock)).to.be.ok();
          expect(h.isSubmitButtonDisabled(this.lock)).to.be.ok();
        });
      });
    });
  });
});
