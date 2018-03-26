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

import Auth0Lock from 'auth0-lock';

const cid = 'BWDP9XS89CJq1w6Nzq7iFOHsTh6ChS2b';
const domain = 'brucke.auth0.com';
const options = {
  oidcConformant: true,
  allowShowPassword: true,
  usernameStyle: 'email',
  defaultDatabaseConnection: 'acme',
  prefill: {
    email: 'johnfoo@gmail.com'
  }
};

const lock = new Auth0Lock(cid, domain, options);

lock.on('authenticated', function(authResult) {
  console.log(authResult);

  if (!authResult.accessToken) return;

  lock.getUserInfo(authResult.accessToken, function(error, profile) {
    console.log(error, profile);
  });
});

lock.on('authorization_error', function(error) {
  console.log('authorization_error', error);
});

lock.show();
