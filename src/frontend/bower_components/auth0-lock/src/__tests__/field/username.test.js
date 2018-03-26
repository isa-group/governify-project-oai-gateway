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

import Immutable from 'immutable';

describe('field/username', () => {
  let username;
  let dbConnection;
  beforeEach(() => {
    jest.resetModules();

    jest.mock('field/index', () => ({
      setField: jest.fn()
    }));

    jest.mock('field/email', () => ({
      validateEmail: s => s
    }));

    jest.mock('connection/database', () => ({
      databaseConnection: m => m
    }));

    username = require('field/username');
    dbConnection = Immutable.fromJS({
      validation: null
    });
  });
  describe('usernameLooksLikeEmail()', () => {
    it('checks for @', () => {
      expect(username.usernameLooksLikeEmail('t@t.com')).toBe(true);
      expect(username.usernameLooksLikeEmail('tt.com')).toBe(false);
    });
  });
  describe('getUsernameValidation()', () => {
    it(`returns database connection's username validation`, () => {
      expect(
        username.getUsernameValidation(
          Immutable.fromJS({
            validation: {
              username: { min: 1, max: 2 }
            }
          })
        )
      ).toMatchSnapshot();
    });
    it(`returns null there's no db connection username validation`, () => {
      expect(username.getUsernameValidation(dbConnection)).toBe(null);
    });
  });
  describe('setUsername()', () => {
    it(`calls setField`, () => {
      username.setUsername(dbConnection, 'a-username', 'username', true);
      const { mock } = require('field/index').setField;
      expect(mock.calls.length).toBe(1);
      expect(mock.calls[0]).toMatchSnapshot();
    });
    describe('field validation', () => {
      it('validates when usernameStyle is `email`', () => {
        const email = 'a@a.com';
        username.setUsername(dbConnection, email, 'email', true);
        const { mock } = require('field/index').setField;
        expect(mock.calls[0][3](email)).toBe(email);
      });
      it('validates when usernameStyle is `username`', () => {
        const theUsername = 'the_user';
        username.setUsername(dbConnection, theUsername, 'username', true);
        const { mock } = require('field/index').setField;
        expect(mock.calls[0][3](theUsername)).toBe(true);
      });
      it('validates when username looks like an email', () => {
        const email = 'a@a.com';
        username.setUsername(dbConnection, email, null, true);
        const { mock } = require('field/index').setField;
        expect(mock.calls[0][3](email)).toBe(email);
      });
      it('validates when username does not look like an email', () => {
        const theUsername = 'the_user';
        username.setUsername(dbConnection, theUsername, null, true);
        const { mock } = require('field/index').setField;
        expect(mock.calls[0][3](theUsername)).toBe(true);
      });
      it('defaults usernameStyle to `username`', () => {
        const theUsername = 'the_user';
        username.setUsername(dbConnection, theUsername, undefined, true);
        const { mock } = require('field/index').setField;
        expect(mock.calls[0][3](theUsername)).toBe(true);
      });
      it('defaults validateUsernameFormat to `true`', () => {
        const theUsername = 'the_user';
        username.setUsername(dbConnection, theUsername, 'username', undefined);
        const { mock } = require('field/index').setField;
        expect(mock.calls[0][3](theUsername)).toBe(true);
      });
      describe('when in username mode', () => {
        const expectToFailWith = theUsername => {
          username.setUsername(dbConnection, theUsername, 'username', true);
          const { mock } = require('field/index').setField;
          expect(mock.calls[0][3](theUsername)).toBe(false);
        };
        const expectToSuccedWith = theUsername => {
          username.setUsername(dbConnection, theUsername, 'username', true);
          const { mock } = require('field/index').setField;
          expect(mock.calls[0][3](theUsername)).toBe(true);
        };
        describe('validates if the username is not empty', () => {
          it('when `validateUsernameFormat` is true but there is no db connection validation', () => {
            const theUsername = '';
            username.setUsername(dbConnection, theUsername, 'username', true);
            const { mock } = require('field/index').setField;
            expect(mock.calls[0][3](theUsername)).toBe(false);
          });
          it('when `validateUsernameFormat` is false and there is db connection validation', () => {
            const theUsername = '';
            const customDbConnection = Immutable.fromJS({
              validation: {
                username: { min: 1, max: 2 }
              }
            });
            username.setUsername(customDbConnection, theUsername, 'username', false);
            const { mock } = require('field/index').setField;
            expect(mock.calls[0][3](theUsername)).toBe(false);
          });
        });
        describe('with a db connection validation', () => {
          beforeEach(() => {
            dbConnection = Immutable.fromJS({
              validation: {
                username: { min: 3, max: 5 }
              }
            });
          });
          it('validates min length', () => {
            expectToFailWith('aa');
          });
          it('validates max length', () => {
            expectToFailWith('aaaaaa');
          });
          it('validates invalid chars', () => {
            const invalidChars = `{}[],;?/\\!@#$%¨&*()¹²³\`~^´ªº§£¢¬<>|"' `.split('');
            invalidChars.forEach(i => expectToFailWith(`aa${i}`));
          });
          it('accepts letters, numbers, `_`, `-`, `+` and `.`', () => {
            const validChars = `_-+.`.split('');
            validChars.forEach(i => expectToSuccedWith(`aa${i}`));
          });
        });
      });
    });
  });
});
