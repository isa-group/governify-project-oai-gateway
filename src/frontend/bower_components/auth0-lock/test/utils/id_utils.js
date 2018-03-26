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
import * as idu from '../../src/utils/id_utils';
import { Set } from 'immutable';

describe('building a set of random ids', function() {
  const count = 10;
  let subject;

  before(function() {
    subject = new Set();
    for (let i = 0; i < 10; i++) {
      subject = subject.add(idu.random());
    }
  });

  it('is always a string', function() {
    expect(subject.every(x => typeof x === 'string')).to.be(true);
  });

  it('always contains only lowercase letters and numbers', function() {
    expect(subject.every(x => /[a-z0-9]+/.test(x))).to.be(true);
  });

  it('returns a new value every time', function() {
    expect(subject.size).to.be(10);
  });
});
