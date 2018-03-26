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

import React from 'react';
import Immutable, { Map } from 'immutable';
import { format } from 'util';
import sync from './sync';
import * as l from './core/index';
import { dataFns } from './utils/data_utils';
const { get, set } = dataFns(['i18n']);
import enDictionary from './i18n/en';
import { load, preload } from './utils/cdn_utils';

export function str(m, keyPath, ...args) {
  return format(get(m, ['strings'].concat(keyPath), ''), ...args);
}

export function html(m, keyPath, ...args) {
  const html = str(m, keyPath, ...args);

  return html ? React.createElement('span', { dangerouslySetInnerHTML: { __html: html } }) : null;
}

export function group(m, keyPath) {
  return get(m, ['strings'].concat(keyPath), Map()).toJS();
}

export function initI18n(m) {
  const language = l.ui.language(m);
  const overrides = l.ui.dict(m);
  const defaultDictionary = Immutable.fromJS(enDictionary);

  let base = languageDictionaries[language] || Map({});

  if (base.isEmpty()) {
    base = overrides;
    m = sync(m, 'i18n', {
      syncFn: (_, cb) => syncLang(m, language, cb),
      successFn: (m, result) => {
        registerLanguageDictionary(language, result);

        const overrided = Immutable.fromJS(result).mergeDeep(overrides);

        assertLanguage(m, overrided.toJS(), enDictionary);

        return set(m, 'strings', defaultDictionary.mergeDeep(overrided));
      }
    });
  } else {
    assertLanguage(m, base.toJS(), enDictionary);
  }

  base = defaultDictionary.mergeDeep(base).mergeDeep(overrides);

  return set(m, 'strings', base);
}

function assertLanguage(m, language, base, path = '') {
  Object.keys(base).forEach(key => {
    if (!language.hasOwnProperty(key)) {
      l.warn(m, `language does not have property ${path}${key}`);
    } else {
      if (typeof base[key] === 'object') {
        assertLanguage(m, language[key], base[key], `${path}${key}.`);
      }
    }
  });
}

// sync

function syncLang(m, language, cb) {
  load({
    method: 'registerLanguageDictionary',
    url: `${l.languageBaseUrl(m)}/js/lock/${__VERSION__}/${language}.js`,
    check: str => str && str === language,
    cb: (err, _, dictionary) => {
      cb(err, dictionary);
    }
  });
}

const languageDictionaries = [];

function registerLanguageDictionary(language, dictionary) {
  languageDictionaries[language] = Immutable.fromJS(dictionary);
}

registerLanguageDictionary('en', enDictionary);

preload({
  method: 'registerLanguageDictionary',
  cb: registerLanguageDictionary
});
