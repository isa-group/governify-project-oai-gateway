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

import { setField } from './index';
import { validateEmail } from './email';
import { databaseConnection } from '../connection/database';
import trim from 'trim';

const DEFAULT_CONNECTION_VALIDATION = { username: { min: 1, max: 15 } };
const regExp = /^[a-zA-Z0-9_+\-.]+$/;

function validateUsername(str, validateFormat, settings = DEFAULT_CONNECTION_VALIDATION.username) {
  // If the connection does not have validation settings, it should only check if the field is empty.
  // validateFormat overrides this logic to disable validation on login (login should never validate format)
  if (!validateFormat || settings == null) {
    return trim(str).length > 0;
  }

  const lowercased = trim(str.toLowerCase());

  // chekc min value matched
  if (lowercased.length < settings.min) {
    return false;
  }

  // check max value matched
  if (lowercased.length > settings.max) {
    return false;
  }

  // check allowed characters matched
  const result = regExp.exec(lowercased);
  return !!(result && result[0]);
}

export function getUsernameValidation(m) {
  const usernameValidation = databaseConnection(m).getIn(['validation', 'username']);
  return usernameValidation ? usernameValidation.toJS() : null;
}

export function setUsername(m, str, usernameStyle = 'username', validateUsernameFormat = true) {
  const usernameValidation = validateUsernameFormat ? getUsernameValidation(m) : null;

  const validator = value => {
    switch (usernameStyle) {
      case 'email':
        return validateEmail(value);
      case 'username':
        return validateUsername(value, validateUsernameFormat, usernameValidation);
      default:
        return usernameLooksLikeEmail(value)
          ? validateEmail(value)
          : validateUsername(value, validateUsernameFormat, usernameValidation);
    }
  };

  return setField(m, 'username', str, validator);
}

export function usernameLooksLikeEmail(str) {
  return str.indexOf('@') > -1;
}
