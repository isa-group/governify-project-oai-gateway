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

/*
 *
 * This is used to build the bundle with browserify.
 *
 * The bundle is used by people who doesn't use browserify.
 * Those who use browserify will install with npm and require the module,
 * the package.json file points to index.js.
 */

import Auth0Lock from './index';
// import Auth0LockPasswordless from './passwordless';

if (typeof global.window.define == 'function' && global.window.define.amd) {
  global.window.define('auth0Lock', function() {
    return Auth0Lock;
  });
  // global.window.define('auth0LockPasswordless', function () { return Auth0LockPasswordless; });
} else if (global.window) {
  global.window.Auth0Lock = Auth0Lock;
  // global.window.Auth0LockPasswordless = Auth0LockPasswordless;
}
