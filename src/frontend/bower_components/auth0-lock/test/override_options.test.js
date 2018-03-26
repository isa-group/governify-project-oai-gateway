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

import { overrideOptions } from '../src/core/index';
import * as i18n from '../src/i18n';

describe('Override state with options on show', () => {
  before(function() {
    stub(i18n, 'initI18n', m => {
      return m;
    });
  });

  after(function() {
    i18n.initI18n.restore();
  });

  it('should merge and warn missing keys', () => {
    var m = Immutable.fromJS({});

    var new_options = {
      allowedConnections: 'facebook',
      languageDictionary: {
        title: 'new_title'
      },
      flashMessage: {
        type: 'success',
        text: 'test'
      },
      auth: {
        params: {
          state: '1234'
        }
      },
      language: 'es',
      theme: {
        primaryColor: 'red',
        logo: 'http://test.com/logo.png'
      }
    };

    m = overrideOptions(m, new_options);

    expect(m.toJS()).to.eql({
      core: {
        transient: {
          globalSuccess: 'test',
          allowedConnections: 'facebook',
          ui: {
            primaryColor: 'red',
            logo: 'http://test.com/logo.png',
            language: 'es',
            dict: {
              title: 'new_title'
            }
          },
          authParams: {
            state: '1234'
          }
        }
      }
    });
  });
});
