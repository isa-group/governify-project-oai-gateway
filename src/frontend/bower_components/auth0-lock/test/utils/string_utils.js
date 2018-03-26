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
import { matches } from '../../src/utils/string_utils';

describe('matching a string', function() {
  it('returns true for a substring, regardless of its capitalization', function() {
    expect(matches('Abc', 'aBcd')).to.be(true);
    expect(matches('abC', 'zAbc')).to.be(true);
    expect(matches('ABc', 'aBCz')).to.be(true);
    expect(matches('abcd', 'abc')).to.be(false);
  });
});
