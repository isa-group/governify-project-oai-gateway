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
import { stub } from 'sinon';
import webApi from '../src/core/web_api';

describe('mfa ro', function() {
  beforeEach(h.stubWebApis);
  afterEach(h.restoreWebApis);

  describe('for sign in', function() {
    describe('when mfa is required', function() {
      describe('and when mfa code is valid', function() {
        beforeEach(function(done) {
          const error = new Error();
          error.error = 'a0.mfa_required';

          webApi.logIn.yields(error);

          const opts = {
            allowedConnections: ['db'],
            rememberLastLogin: false
          };

          this.lock = h.displayLock('', opts, done);
        });

        afterEach(function() {
          this.lock.hide();
        });

        it('logs in using mfa screen', function(done) {
          h.fillEmailInput(this.lock, 'someone@example.com');
          h.fillPasswordInput(this.lock, 'mypass');
          h.submitForm(this.lock);

          h.waitUntilInputExists(this.lock, 'mfa_code', () =>
            h.testAsync(() => {
              h.fillMFACodeInput(this.lock, '123456');
              h.submit(this.lock);

              expect(
                h.wasLoginAttemptedWith({
                  connection: 'db',
                  username: 'someone@example.com',
                  password: 'mypass',
                  mfa_code: '123456'
                })
              ).to.be.ok();
            }, done)
          );
        });
      });

      describe('and when mfa code is invalid', function() {
        beforeEach(function(done) {
          const mfaRequireError = new Error();
          mfaRequireError.error = 'a0.mfa_required';

          const invalidCodeError = new Error();
          invalidCodeError.error = 'a0.mfa_invalid_code';

          webApi.logIn
            .onFirstCall()
            .yields(mfaRequireError)
            .onSecondCall()
            .yields(invalidCodeError);

          const opts = {
            allowedConnections: ['db'],
            rememberLastLogin: false
          };

          this.lock = h.displayLock('', opts, done);
        });

        afterEach(function() {
          this.lock.hide();
        });

        it('shows wrong code error', function(done) {
          h.fillEmailInput(this.lock, 'someone@example.com');
          h.fillPasswordInput(this.lock, 'mypass');
          h.submitForm(this.lock);

          h.waitUntilInputExists(this.lock, 'mfa_code', () => {
            h.fillMFACodeInput(this.lock, '123456');
            h.submitForm(this.lock);

            h.waitUntilErrorExists(this.lock, () => {
              h.testAsync(() => {
                expect(h.haveShownError(this.lock, 'Wrong code. Please try again.')).to.be.ok();
              }, done);
            });
          });
        });
      });
    });

    describe('when mfa enrollment is required', function() {
      beforeEach(function(done) {
        const error = new Error();
        error.error = 'a0.mfa_registration_required';

        webApi.logIn.yields(error);

        const opts = {
          allowedConnections: ['db'],
          rememberLastLogin: false
        };

        this.lock = h.displayLock('', opts, done);
      });

      afterEach(function() {
        this.lock.hide();
      });

      it('show an error', function(done) {
        h.fillEmailInput(this.lock, 'someone@example.com');
        h.fillPasswordInput(this.lock, 'mypass');
        h.submitForm(this.lock);

        h.waitUntilErrorExists(this.lock, () =>
          h.testAsync(() => {
            expect(
              h.haveShownError(
                this.lock,
                'Multifactor authentication is required but your ' +
                  'device is not enrolled. Please enroll it before moving on.'
              )
            ).to.be.ok();
          }, done)
        );
      });
    });
  });

  describe('for sign up', function() {
    describe('when mfa enrollment is required', function() {
      beforeEach(function(done) {
        const opts = {
          initialScreen: 'signUp',
          rememberLastLogin: false
        };

        const error = new Error();
        error.error = 'a0.mfa_registration_required';

        webApi.logIn.yields(error);
        stub(webApi, 'signUp').yields();

        this.lock = h.displayLock('single database', opts, done);
      });

      afterEach(function() {
        webApi.signUp.restore();
        this.lock.hide();
      });

      it('show an error', function(done) {
        h.fillEmailInput(this.lock, 'someone@example.com');
        h.fillPasswordInput(this.lock, 'mYpass123');
        h.submitForm(this.lock);

        h.waitUntilErrorExists(this.lock, () =>
          h.testAsync(() => {
            expect(
              h.haveShownError(
                this.lock,
                'Multifactor authentication is required but your device ' +
                  'is not enrolled. Please enroll it before moving on.'
              )
            ).to.be.ok();
          }, done)
        );
      });
    });
  });
});
