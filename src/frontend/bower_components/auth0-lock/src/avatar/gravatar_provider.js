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

import blueimp from 'blueimp-md5';
import trim from 'trim';
import jsonp from '../utils/jsonp_utils';
import { validateEmail } from '../field/email';

const md5 = blueimp.md5 || blueimp;

function normalize(str) {
  return typeof str === 'string' ? trim(str.toLowerCase()) : '';
}

export function displayName(email, cb) {
  email = normalize(email);
  if (!validateEmail(email)) return cb({});

  const url = `https://secure.gravatar.com/${md5(email)}.json`;
  jsonp.get(url, function(error, result) {
    if (!error && result && result.entry && result.entry[0]) {
      cb(null, result.entry[0].displayName);
    } else {
      cb({});
    }
  });
}

export function url(email, cb) {
  email = normalize(email);
  if (!validateEmail(email)) return cb({});

  cb(null, `https://secure.gravatar.com/avatar/${md5(email)}?d=404&s=160`);
}
