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

const DEFAULT_VALIDATION = { mfa_code: { length: 6 } };
const regExp = /^[0-9]+$/;

function validateMFACode(str, settings = DEFAULT_VALIDATION.mfa_code) {
  const value = trim(str);

  // check min value matched
  if (value.length < settings.length) {
    return false;
  }

  // check max value matched
  if (value.length > settings.length) {
    return false;
  }

  // check allowed characters matched
  const result = regExp.exec(value);
  return result && result[0];
}

export function setMFACode(m, str) {
  return setField(m, 'mfa_code', str, validateMFACode);
}

export function getMFACodeValidation(m) {
  return DEFAULT_VALIDATION.mfa_code;
}
