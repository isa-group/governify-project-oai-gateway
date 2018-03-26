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
import { getField, getFieldValue, registerOptionField, setField } from './index';
import locations from './phone-number/locations';

const locationOptions = Immutable.fromJS(
  locations.map(x => ({
    country: x[0],
    diallingCode: x[2],
    isoCode: x[1],
    label: `${x[2]} ${x[1]} ${x[0]}`,
    value: `${x[2]} ${x[1]}`
  }))
);

function findLocation(isoCode) {
  return locationOptions.find(x => x.get('isoCode') === isoCode);
}

export function initLocation(m, isoCode) {
  const location = findLocation(isoCode) || findLocation('US');
  return registerOptionField(m, 'location', locationOptions, location.get('value'));
}

export function validatePhoneNumber(str) {
  const regExp = /^[0-9]([0-9 -])*[0-9]$/;
  return regExp.test(str);
}

export function setPhoneNumber(m, str) {
  return setField(m, 'phoneNumber', str, validatePhoneNumber);
}

export function phoneNumberWithDiallingCode(m) {
  return humanPhoneNumberWithDiallingCode(m).replace(/[\s-]+/g, '');
}

export function humanPhoneNumberWithDiallingCode(m) {
  const location = getField(m, 'location');
  const code = location.get('diallingCode', '');
  const number = getFieldValue(m, 'phoneNumber', '');
  return code ? `${code} ${number}` : number;
}

export function humanLocation(m) {
  const location = getField(m, 'location');
  return `${location.get('diallingCode')} ${location.get('country')}`;
}
