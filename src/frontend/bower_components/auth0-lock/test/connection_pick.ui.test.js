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

describe('connection pick', function() {
  before(h.stubWebApis);
  after(h.restoreWebApis);

  describe('with several connections of all types', function() {
    beforeEach(function(done) {
      const opts = {
        rememberLastLogin: false
      };

      this.lock = h.displayLock('all', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('logs in with the first database connection in the client settings', function() {
      h.logInWithEmailAndPassword(this.lock);
      expect(h.wasLoginAttemptedWith({ connection: 'db' })).to.be.ok();
    });
  });

  describe('with single database connection', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['db'],
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('logs in with the only one available', function() {
      h.logInWithEmailAndPassword(this.lock);
      expect(h.wasLoginAttemptedWith({ connection: 'db' })).to.be.ok();
    });
  });

  describe('with multiple database connections', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['db', 'db1'],
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('logins with first one', function() {
      h.logInWithEmailAndPassword(this.lock);
      expect(h.wasLoginAttemptedWith({ connection: 'db' })).to.be.ok();
    });
  });

  describe('with multiple database connections, providing a default', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['db', 'db1'],
        defaultDatabaseConnection: 'db1',
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    it('logins with the default one', function() {
      h.logInWithEmailAndPassword(this.lock);
      expect(h.wasLoginAttemptedWith({ connection: 'db1' })).to.be.ok();
    });
  });

  describe('with enterprise and database connection', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['db', 'auth0.com'],
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email matches the enterprise connection', function() {
      beforeEach(function() {
        h.fillEmailInput(this.lock, 'someone@auth0.com');
      });

      it('logins with the enterprise connection', function() {
        expect(h.hasSSONotice(this.lock)).to.be.ok();
        h.submit(this.lock);
        expect(h.wasLoginAttemptedWith({ connection: 'auth0.com' })).to.be.ok();
      });
    });

    describe("when the email doesn't match the enterprise connection", function() {
      beforeEach(function() {
        h.logInWithEmailAndPassword(this.lock);
      });

      it('logins with the database connection', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'db' })).to.be.ok();
      });
    });
  });

  describe('with an enterprise and a corporate connection', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['auth0.com', 'rolodato.com'],
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email matches the enterprise connection', function() {
      beforeEach(function() {
        h.fillEmailInput(this.lock, 'someone@auth0.com');
      });

      it('logins with the enterprise connection', function() {
        expect(h.hasSSONotice(this.lock)).to.be.ok();
        h.submit(this.lock);
        expect(h.wasLoginAttemptedWith({ connection: 'auth0.com' })).to.be.ok();
      });
    });

    describe('when the email matches the corporate connection', function() {
      beforeEach(function() {
        h.fillEmailInput(this.lock, 'someone@rolodato.com');
      });

      it('ask for the corporte credentials', function() {
        expect(h.hasSSONotice(this.lock)).to.be.ok();
        h.submit(this.lock);
        expect(h.hasUsernameInput(this.lock, 'someone'));
        expect(h.hasPasswordInput(this.lock));
      });

      describe('and logins with corporate credentials', function() {
        beforeEach(function() {
          h.submit(this.lock);
          h.logInWithUsernameAndPassword(this.lock);
        });

        it('uses the proper corporate connection', function() {
          expect(h.wasLoginAttemptedWith({ connection: 'rolodato.com' })).to.be.ok();
        });
      });
    });

    describe("when the email doesn't match any connection", function() {
      beforeEach(function() {
        h.fillEmailInput(this.lock, 'someone@example.com');
      });

      it.skip('shows an error', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        h.submit(this.lock);
        // TODO: an error should be displayed
        expect(false).to.be.ok();
      });
    });
  });

  describe('with multiple corporate connections, one without domain', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['corporate-no-domain', 'rolodato.com'],
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email matches a corporate connection', function() {
      beforeEach(function() {
        h.fillUsernameInput(this.lock, 'someone@rolodato.com');
      });

      it('ask for the corporte credentials', function() {
        expect(h.hasSSONotice(this.lock)).to.be.ok();
        h.submit(this.lock);
        expect(h.hasUsernameInput(this.lock, 'someone'));
        expect(h.hasPasswordInput(this.lock));
      });

      describe('and logins with corporate credentials', function() {
        beforeEach(function() {
          h.submit(this.lock);
          h.logInWithUsernameAndPassword(this.lock);
        });

        it('uses the proper corporate connection', function() {
          expect(h.wasLoginAttemptedWith({ connection: 'rolodato.com' })).to.be.ok();
        });
      });
    });

    describe("when the email doesn't match a corporate connection", function() {
      beforeEach(function() {
        h.logInWithUsernameAndPassword(this.lock);
      });

      it('logins with the one without domain', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'corporate-no-domain' })).to.be.ok();
      });
    });
  });

  describe('with multiple corporate connections without domain', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['corporate-no-domain', 'corporate-no-domain1'],
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email and password inputs are filled', function() {
      beforeEach(function() {
        h.logInWithUsernameAndPassword(this.lock);
      });

      it('logins with the first one', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'corporate-no-domain' })).to.be.ok();
      });
    });
  });

  describe('with multiple corporate connections without domain, providing a default', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['corporate-no-domain', 'corporate-no-domain1'],
        defaultEnterpriseConnection: 'corporate-no-domain1',
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email and password inputs are filled', function() {
      beforeEach(function() {
        h.logInWithUsernameAndPassword(this.lock);
      });

      it('logins with the default one', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'corporate-no-domain1' })).to.be.ok();
      });
    });
  });

  describe('with a database and a corporate connection without domain', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['corporate-no-domain', 'db'],
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email and password inputs are filled', function() {
      beforeEach(function() {
        h.logInWithEmailAndPassword(this.lock);
      });

      it('logins with the database connection', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'db' })).to.be.ok();
      });
    });
  });

  describe('with a database and a corporate connection without domain, providing a default database', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['corporate-no-domain', 'db'],
        defaultDatabaseConnection: 'db',
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email and password inputs are filled', function() {
      beforeEach(function() {
        h.logInWithEmailAndPassword(this.lock);
      });

      it('logins with the database connection', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'db' })).to.be.ok();
      });
    });
  });

  describe('with a database and a corporate connection without domain, providing a default corporate', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['corporate-no-domain', 'db'],
        defaultEnterpriseConnection: 'corporate-no-domain',
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email and password inputs are filled', function() {
      beforeEach(function() {
        h.logInWithEmailAndPassword(this.lock);
      });

      it('logins with the corporate connection', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'corporate-no-domain' })).to.be.ok();
      });
    });
  });

  describe('with a database and a corporate connection without domain, providing database and corporate defaults', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['corporate-no-domain', 'db'],
        defaultDatabaseConnection: 'db',
        defaultEnterpriseConnection: 'corporate-no-domain',
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email and password inputs are filled', function() {
      beforeEach(function() {
        h.logInWithEmailAndPassword(this.lock);
      });

      it('logins with the database connection', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'db' })).to.be.ok();
      });
    });
  });

  describe('with a single corporate connection', function() {
    beforeEach(function(done) {
      const opts = {
        allowedConnections: ['corporate'],
        rememberLastLogin: false
      };

      this.lock = h.displayLock('', opts, done);
    });

    afterEach(function() {
      this.lock.hide();
    });

    describe('when the email and password inputs are filled', function() {
      beforeEach(function() {
        h.logInWithUsernameAndPassword(this.lock);
      });

      it('logins with the database connection', function() {
        expect(h.hasSSONotice(this.lock)).to.not.be.ok();
        expect(h.wasLoginAttemptedWith({ connection: 'corporate' })).to.be.ok();
      });
    });
  });
});
