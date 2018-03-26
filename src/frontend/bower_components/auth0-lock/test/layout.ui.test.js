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

describe('layout', function() {
  before(h.stubWebApis);
  after(h.restoreWebApis);

  describe('with all connection types', function() {
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('all', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.be.ok();
      expect(h.isLoginTabCurrent(this.lock)).to.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with all connection types, starting on sign up', function() {
    beforeEach(function(done) {
      const opts = {
        initialScreen: 'signUp',
        rememberLastLogin: false
      };

      this.lock = h.displayLock('all', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the sign up screen with the right controls', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.be.ok();
      expect(h.isSignUpTabCurrent(this.lock)).to.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok();
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with all connection types, starting on forgot password', function() {
    beforeEach(function(done) {
      const opts = {
        initialScreen: 'forgotPassword',
        rememberLastLogin: false
      };
      this.lock = h.displayLock('all', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the forgot password screen with the right controls', function() {
      expect(h.hasBackButton(this.lock)).to.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.not.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok();
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with all connection types, not allowing sign up', function() {
    beforeEach(function(done) {
      const opts = {
        allowSignUp: false,
        rememberLastLogin: false
      };

      this.lock = h.displayLock('all', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with all connection types, not allowing forgot password', function() {
    beforeEach(function(done) {
      const opts = {
        allowForgotPassword: false,
        rememberLastLogin: false
      };

      this.lock = h.displayLock('all', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.be.ok();
      expect(h.isLoginTabCurrent(this.lock)).to.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with all connection types, only allowing login', function() {
    beforeEach(function(done) {
      const opts = {
        allowForgotPassword: false,
        allowSignUp: false,
        rememberLastLogin: false
      };

      this.lock = h.displayLock('all', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with a single enterprise connection', function() {
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('single enterprise', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasOneSocialBigButton(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.not.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.not.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.not.be.ok();
    });
  });

  describe('with multiple enterprise connections', function() {
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('multiple enterprise', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.not.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with an enterprise and a corporate connections', function() {
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('enterprise and corporate', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.not.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with a single corporate connection', function() {
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('single corporate', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the quick auth screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasOneSocialBigButton(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.not.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok();
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with multiple corporate connections, one without domain', function() {
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('multiple corporate, one without domain', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasOneSocialBigButton(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.not.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with a single database connection', function() {
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('single database', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.be.ok();
      expect(h.isLoginTabCurrent(this.lock)).to.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with a single database connection, starting on sign up', function() {
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

    it('renders the sign up screen with the right controls', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.be.ok();
      expect(h.isSignUpTabCurrent(this.lock)).to.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok();
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with a single database connection, starting on forgot password', function() {
    beforeEach(function(done) {
      const opts = {
        initialScreen: 'forgotPassword',
        rememberLastLogin: false
      };
      this.lock = h.displayLock('single database', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the forgot password screen with the right controls', function() {
      expect(h.hasBackButton(this.lock)).to.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.not.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok();
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with a single database connection, not allowing sign up', function() {
    beforeEach(function(done) {
      const opts = {
        allowSignUp: false,
        rememberLastLogin: false
      };

      this.lock = h.displayLock('single database', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with a single database connection, not allowing forgot password', function() {
    beforeEach(function(done) {
      const opts = {
        allowForgotPassword: false,
        rememberLastLogin: false
      };

      this.lock = h.displayLock('single database', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.be.ok();
      expect(h.isLoginTabCurrent(this.lock)).to.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('with a single database connection, only allowing login', function() {
    beforeEach(function(done) {
      const opts = {
        allowForgotPassword: false,
        allowSignUp: false,
        rememberLastLogin: false
      };

      this.lock = h.displayLock('single database', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.not.be.ok();
      expect(h.hasEmailInput(this.lock)).to.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.be.ok();
    });
  });

  describe('already logged in with a database connection', function() {
    beforeEach(function(done) {
      const opts = {};

      this.lock = h.displayLock('single database', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the quick auth screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasOneSocialBigButton(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.not.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.not.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.be.ok(); // not my account
      expect(h.hasSubmitButton(this.lock)).to.not.be.ok();
    });
  });

  describe('in a corporate network', function() {
    beforeEach(h.stubWebApisForKerberos);
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('kerberos', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });
    beforeEach(h.unStubWebApisForKerberos);

    it('renders the quick auth screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasOneSocialBigButton(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.not.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.not.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.be.ok(); // not your account
      expect(h.hasSubmitButton(this.lock)).to.not.be.ok();
    });
  });

  describe('with multiple social connections', function() {
    beforeEach(function(done) {
      const opts = {
        allowForgotPassword: false,
        allowSignUp: false,
        rememberLastLogin: false
      };

      this.lock = h.displayLock('multiple social', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('renders the login screen with the right contols', function() {
      expect(h.hasBackButton(this.lock)).to.not.be.ok();
      expect(h.hasLoginSignUpTabs(this.lock)).to.not.be.ok();
      expect(h.hasSocialButtons(this.lock)).to.be.ok();
      expect(h.hasEmailInput(this.lock)).to.not.be.ok();
      expect(h.hasUsernameInput(this.lock)).to.not.be.ok();
      expect(h.hasPasswordInput(this.lock)).to.not.be.ok();
      expect(h.hasAlternativeLink(this.lock)).to.not.be.ok(); // forgot password
      expect(h.hasSubmitButton(this.lock)).to.not.be.ok();
    });
  });
});

// TODO: besides of diplaying diffrent lock by customizing the allowed
// connections we should consider when those connections come from the
// client settings given the code paths are different.
