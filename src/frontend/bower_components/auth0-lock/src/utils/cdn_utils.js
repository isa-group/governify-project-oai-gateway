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

import Auth0 from 'auth0-js';

if (!global.Auth0) {
  global.Auth0 = {};
}

const cbs = {};

export function load(attrs) {
  const { cb, check, method, url } = attrs;

  if (!cbs[method]) {
    cbs[method] = [];
    global.Auth0[method] = function(...args) {
      cbs[method] = cbs[method].filter(x => {
        if (x.check(...args)) {
          setTimeout(() => x.cb(null, ...args), 0);
          return false;
        } else {
          return true;
        }
      });
    };
  }

  cbs[method].push({ cb: cb, check: check, url: url });

  const count = cbs[method].reduce((r, x) => r + (x.url === url ? 1 : 0), 0);

  if (count > 1) return;

  const script = global.document.createElement('script');
  script.src = url;
  global.document.getElementsByTagName('head')[0].appendChild(script);

  const handleError = err => {
    cbs[method] = cbs[method].filter(x => {
      if (x.url === url) {
        setTimeout(() => x.cb(err), 0);
        return false;
      } else {
        return true;
      }
    });
  };

  const timeoutID = setTimeout(() => handleError(new Error(`${url} timed out`)), 20000);

  script.addEventListener('load', () => clearTimeout(timeoutID));

  script.addEventListener('error', () => {
    clearTimeout(timeoutID);
    handleError(new Error(`${url} could not be loaded.`));
  });
}

export function preload({ method, cb }) {
  global.Auth0[method] = cb;
}
