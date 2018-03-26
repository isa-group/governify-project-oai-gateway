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

'use strict';
import { stub } from 'sinon';

import expect from 'expect.js';
import Immutable from 'immutable';
import flatten from 'flat';

import enDictionary from '../src/i18n/en';
import esDictionary from '../src/i18n/es';

import * as sync from '../src/sync';

describe('load i18n configuration', () => {
  before(function() {
    stub(sync, 'default', (m, key, opts) => {
      m = opts.successFn(m, esDictionary);
      return m;
    });
  });

  after(function() {
    sync.default.restore();
  });

  it('should merge and warn missing keys', () => {
    let i18n = require('../src/i18n');

    // We need to initialize the state
    var m = Immutable.fromJS({
      languageBaseUrl: 'https://cdn.auth0.com',
      ui: {
        disableWarnings: true,
        language: 'es'
      }
    });

    // Initialize i18n.
    m = i18n.initI18n(m);

    let language = flatten(m.getIn(['i18n', 'strings']).toJS());
    let en = flatten(enDictionary);
    let es = flatten(esDictionary);

    // We should check that the language has all the keys in the
    // en language and its values should be either es or en.
    Object.keys(en).forEach(key => {
      expect(language).to.have.property(key);
      expect([en[key], es[key]]).to.contain(language[key]);
    });
  });
});
