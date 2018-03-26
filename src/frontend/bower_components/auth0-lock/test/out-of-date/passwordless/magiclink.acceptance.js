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
import * as u from '../acceptance_test_utils';

describe('.magiclink acceptance', function() {
  before(u.stubWebApis);
  after(u.restoreWebApis);

  describe('constructing a Lock', function() {
    before(function() {
      this.lock = u.constructLock();
    });

    it("doesn't render a thing", function() {
      expect(u.isRendered(this.lock)).to.not.be.ok();
    });
  });

  describe('opening a Lock', function() {
    before(function() {
      this.lock = u.constructLock();
    });

    after(function() {
      u.closeLock(this.lock);
    });

    it("doesn't open the Lock immediately", function() {
      u.openLock(this.lock, 'emailcode');

      expect(u.isRendered(this.lock)).to.be.ok();
      expect(u.isOpened(this.lock)).to.not.be.ok();
    });

    it('opens it after a few ms', function(done) {
      setTimeout(() => {
        expect(u.isOpened(this.lock)).to.be.ok();
        done();
      }, 17);
    });

    it('displays an empty input for the email', function() {
      expect(u.qInputValue(this.lock, 'email')).to.be('');
    });
  });

  describe('entering an invalid email', function() {
    before(function() {
      this.lock = u.constructLock();
      u.openLock(this.lock, 'magiclink');
      u.fillInput(this.lock, 'email', 'invalid email');
    });

    after(function() {
      u.closeLock(this.lock);
    });

    it("doesn't mark the input as invalid", function() {
      expect(u.isInputInvalid(this.lock, 'email')).to.not.be.ok();
    });

    describe('when attempting a submit', function() {
      before(function() {
        u.submit(this.lock);
      });

      it('marks the input as invalid', function() {
        expect(u.isInputInvalid(this.lock, 'email')).to.be.ok();
      });

      it("doesn't perform any request", function() {
        expect(u.hasStartedPasswordless(false)).to.be.ok();
        expect(u.isInputInvalid(this.lock, 'email')).to.be.ok();
        expect(u.isLoading(this.lock)).to.not.be.ok();
      });

      describe('when fixing the email', function() {
        before(function() {
          u.fillInput(this.lock, 'email', 'someone@auth0.com');
        });

        it('clears the input error', function() {
          expect(u.isInputInvalid(this.lock, 'email')).to.not.be.ok();
        });

        describe('and entering an invalid email again', function() {
          before(function() {
            u.fillInput(this.lock, 'email', 'invalid email');
          });

          it("doesn't mark the input as invalid", function() {
            expect(u.isInputInvalid(this.lock, 'email')).to.not.be.ok();
          });
        });
      });
    });
  });

  describe('successfully submitting an email', function() {
    before(function() {
      this.lock = u.constructLock();
      this.cb = u.openLock(this.lock, 'magiclink');
      u.fillInput(this.lock, 'email', 'someone@auth0.com');
      u.submit(this.lock);
    });

    after(function() {
      u.closeLock(this.lock);
    });

    it('shows a loading indicator until a response is obtained', function() {
      expect(u.isLoading(this.lock)).to.be.ok();
    });

    it('starts the passwordless flow', function() {
      const params = {
        authParams: {},
        callbackURL: undefined,
        email: 'someone@auth0.com',
        forceJSONP: undefined,
        responseType: 'token',
        send: 'link',
        sso: true
      };
      expect(u.hasStartedPasswordless(params)).to.be.ok();
    });

    describe('when response arrives', function() {
      before(function() {
        u.simulateStartPasswordlessResponse();
      });

      it('hides the loading indicator', function() {
        expect(u.isLoading(this.lock)).to.not.be.ok();
      });

      it.skip("doesn't show an input for the email", function() {
        expect(u.qInput(this.lock, 'email')).to.not.be.ok();
      });

      it('shows a confirmation screen', function() {
        expect(u.isShowingConfirmation(this.lock)).to.be.ok();
      });

      it('invokes the provided callback with the entered email', function() {
        expect(this.cb.calledOnce).to.be.ok();
        expect(this.cb.calledWithExactly(null, 'someone@auth0.com')).to.be.ok();
      });
    });
  });

  describe('unsuccessful attempt to submit an email', function() {
    before(function() {
      this.lock = u.constructLock();
      this.cb = u.openLock(this.lock, 'magiclink');
      u.fillInput(this.lock, 'email', 'someone@auth0.com');
      u.submit(this.lock);
    });

    after(function() {
      u.closeLock(this.lock);
    });

    it('shows a loading indicator until a response is obtained', function() {
      expect(u.isLoading(this.lock)).to.be.ok();
    });

    it('starts the passwordless flow', function() {
      const params = {
        authParams: {},
        callbackURL: undefined,
        email: 'someone@auth0.com',
        forceJSONP: undefined,
        responseType: 'token',
        send: 'link',
        sso: true
      };
      expect(u.hasStartedPasswordless(params)).to.be.ok();
    });

    describe('when response arrives', function() {
      before(function(done) {
        this.error = { error: 'unknown' };
        u.simulateStartPasswordlessResponse(this.error);
        setTimeout(done, 300);
      });

      it('hides the loading indicator', function() {
        expect(u.isLoading(this.lock)).to.not.be.ok();
      });

      it('still shows an input for the email', function() {
        expect(u.qInput(this.lock, 'email')).to.be.ok();
      });

      it("doesn't show a confirmation screen", function() {
        expect(u.isShowingConfirmation(this.lock)).to.not.be.ok();
      });

      it('invokes the provided callback with the error', function() {
        expect(this.cb.calledOnce).to.be.ok();
        expect(this.cb.calledWithExactly(this.error)).to.be.ok();
      });

      it('shows a generic error', function() {
        const errorMessage = "We're sorry, something went wrong when sending the email";
        expect(u.isSomethingWrong(this.lock, errorMessage)).to.be.ok();
      });
    });
  });

  describe.skip('successfully resending the email', function() {
    before(function() {
      this.lock = u.constructLock();
      this.cb = u.openLock(this.lock, 'magiclink');
      u.fillInput(this.lock, 'email', 'someone@auth0.com');
      u.submit(this.lock);
      u.simulateStartPasswordlessResponse();
      this.cb.reset();
      u.clickResendLink(this.lock);
    });

    after(function() {
      u.closeLock(this.lock);
    });

    it('shows a loading indicator until a response is obtained', function() {
      expect(u.isResendingLink(this.lock)).to.be.ok();
    });

    it('starts the passwordless flow', function() {
      const params = {
        authParams: {},
        email: 'someone@auth0.com',
        send: 'link',
        responseType: 'token',
        callbackURL: undefined,
        forceJSONP: undefined,
        sso: true
      };
      expect(u.hasStartedPasswordless(params)).to.be.ok();
    });

    describe('when response arrives', function() {
      before(function() {
        u.simulateStartPasswordlessResponse();
      });

      it('hides the loading indicator', function() {
        expect(u.isResendingLink(this.lock)).to.not.be.ok();
      });

      it('informs the link has been successfully resent', function() {
        expect(u.hasLinkBeenResent(this.lock)).to.be.ok();
      });

      it('invokes the provided callback with the entered email', function() {
        expect(this.cb.calledOnce).to.be.ok();
        expect(this.cb.calledWithExactly(null, 'someone@auth0.com')).to.be.ok();
      });
    });
  });

  describe('unsuccessful attempt to resend a link', function() {
    before(function() {
      this.lock = u.constructLock();
      this.cb = u.openLock(this.lock, 'magiclink');
      u.fillInput(this.lock, 'email', 'someone@auth0.com');
      u.submit(this.lock);
      u.simulateStartPasswordlessResponse();
      this.cb.reset();
      u.clickResendLink(this.lock);
    });

    after(function() {
      u.closeLock(this.lock);
    });

    it('shows a loading indicator until a response is obtained', function() {
      expect(u.isResendingLink(this.lock)).to.be.ok();
    });

    it('starts the passwordless flow', function() {
      const params = {
        authParams: {},
        email: 'someone@auth0.com',
        send: 'link',
        responseType: 'token',
        callbackURL: undefined,
        forceJSONP: undefined,
        sso: true
      };
      expect(u.hasStartedPasswordless(params)).to.be.ok();
    });

    describe('when response arrives', function() {
      before(function() {
        this.error = {};
        u.simulateStartPasswordlessResponse(this.error);
      });

      it('hides the loading indicator', function() {
        expect(u.isResendingLink(this.lock)).to.not.be.ok();
      });

      it('informs something went wrong', function() {
        expect(u.hasResendingFailed(this.lock)).to.be.ok();
      });

      it('allows to retry', function() {
        expect(u.isRetryAvailable(this.lock)).to.be.ok();
      });

      it('invokes the provided callback with the error', function() {
        expect(this.cb.calledOnce).to.be.ok();
        expect(this.cb.calledWithExactly(this.error)).to.be.ok();
      });
    });
  });

  describe('successfully retrying to send a link', function() {
    before(function() {
      this.lock = u.constructLock();
      this.cb = u.openLock(this.lock, 'magiclink');
      u.fillInput(this.lock, 'email', 'someone@auth0.com');
      u.submit(this.lock);
      u.simulateStartPasswordlessResponse();
      u.clickResendLink(this.lock);
      u.simulateStartPasswordlessResponse({});
      this.cb.reset();
      u.clickResendLink(this.lock);
    });

    after(function() {
      u.closeLock(this.lock);
    });

    it('shows a loading indicator until a response is obtained', function() {
      expect(u.isResendingLink(this.lock)).to.be.ok();
    });

    it('starts the passwordless flow', function() {
      const params = {
        authParams: {},
        email: 'someone@auth0.com',
        send: 'link',
        responseType: 'token',
        callbackURL: undefined,
        forceJSONP: undefined,
        sso: true
      };
      expect(u.hasStartedPasswordless(params)).to.be.ok();
    });

    describe('when response arrives', function() {
      before(function() {
        u.simulateStartPasswordlessResponse();
      });

      it('hides the loading indicator', function() {
        expect(u.isResendingLink(this.lock)).to.not.be.ok();
      });

      it('informs the link has been successfully resent', function() {
        expect(u.hasLinkBeenResent(this.lock)).to.be.ok();
      });

      it('invokes the provided callback with the entered email', function() {
        expect(this.cb.calledOnce).to.be.ok();
        expect(this.cb.calledWithExactly(null, 'someone@auth0.com')).to.be.ok();
      });
    });
  });

  describe('unsuccessful attempt to retry to send a link', function() {
    before(function() {
      this.lock = u.constructLock();
      this.cb = u.openLock(this.lock, 'magiclink');
      u.fillInput(this.lock, 'email', 'someone@auth0.com');
      u.submit(this.lock);
      u.simulateStartPasswordlessResponse();
      u.clickResendLink(this.lock);
      u.simulateStartPasswordlessResponse({});
      this.cb.reset();
      u.clickResendLink(this.lock);
    });

    after(function() {
      u.closeLock(this.lock);
    });

    it('shows a loading indicator until a response is obtained', function() {
      expect(u.isResendingLink(this.lock)).to.be.ok();
    });

    it('starts the passwordless flow', function() {
      const params = {
        authParams: {},
        email: 'someone@auth0.com',
        send: 'link',
        responseType: 'token',
        callbackURL: undefined,
        forceJSONP: undefined,
        sso: true
      };
      expect(u.hasStartedPasswordless(params)).to.be.ok();
    });

    describe('when response arrives', function() {
      before(function() {
        this.error = {};
        u.simulateStartPasswordlessResponse(this.error);
      });

      it('hides the loading indicator', function() {
        expect(u.isResendingLink(this.lock)).to.not.be.ok();
      });

      it('informs something went wrong', function() {
        expect(u.hasResendingFailed(this.lock)).to.be.ok();
      });

      it('allows to retry', function() {
        expect(u.isRetryAvailable(this.lock)).to.be.ok();
      });

      it('invokes the provided callback with the error', function() {
        expect(this.cb.calledOnce).to.be.ok();
        expect(this.cb.calledWithExactly(this.error)).to.be.ok();
      });
    });
  });
});
