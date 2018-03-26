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

import auth0 from 'auth0-js';
import Auth0LegacyAPIClient from './web_api/legacy_api';
import Auth0APIClient from './web_api/p2_api';

class Auth0WebAPI {
  constructor() {
    this.clients = {};
  }

  setupClient(lockID, clientID, domain, opts) {
    const hostedLoginPage = window.location.host === domain;
    // when it is used on on the hosted login page, it shouldn't use popup mode
    opts.redirect = hostedLoginPage ? true : opts.redirect;

    opts.oidcConformant = opts.oidcConformant || false;

    // for cordova and electron we should force popup without SSO so it uses
    // /ro or /oauth/token for DB connections
    if (window && (!!window.cordova || !!window.electron)) {
      opts.redirect = false;
      opts.sso = false;
    }

    // when it is used on on the hosted login page, it should use the legacy mode
    // (usernamepassword/login) in order to continue the transaction after authentication
    if (hostedLoginPage || !opts.oidcConformant) {
      this.clients[lockID] = new Auth0LegacyAPIClient(clientID, domain, opts);
    } else {
      this.clients[lockID] = new Auth0APIClient(lockID, clientID, domain, opts);
    }
  }

  logIn(lockID, options, authParams, cb) {
    this.clients[lockID].logIn(options, authParams, cb);
  }

  logout(lockID, query) {
    this.clients[lockID].logout(query);
  }

  signUp(lockID, options, cb) {
    this.clients[lockID].signUp(options, cb);
  }

  resetPassword(lockID, options, cb) {
    this.clients[lockID].resetPassword(options, cb);
  }

  startPasswordless(lockID, options, cb) {
    this.clients[lockID].startPasswordless(options, cb);
  }

  parseHash(lockID, hash = '', cb) {
    return this.clients[lockID].parseHash(hash, cb);
  }

  getUserInfo(lockID, token, callback) {
    return this.clients[lockID].getUserInfo(token, callback);
  }

  getProfile(lockID, token, callback) {
    return this.clients[lockID].getProfile(token, callback);
  }

  getSSOData(lockID, ...args) {
    return this.clients[lockID].getSSOData(...args);
  }

  getUserCountry(lockID, cb) {
    return this.clients[lockID].getUserCountry((err, data) => cb(err, data && data.countryCode));
  }
}

export default new Auth0WebAPI();
