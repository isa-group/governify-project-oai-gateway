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

import { getEntity, read, swap, updateEntity } from './store/index';
import { dataFns } from './utils/data_utils';
import * as preload from './utils/preload_utils';
import * as f from './utils/fn_utils';
import * as l from './core/index';

const { tget, tset } = dataFns(['avatar']);

const cache = {};

export function requestAvatar(id, src) {
  if (cache[src]) {
    return update(id, src, cache[src].url, cache[src].displayName, true);
  }

  const provider = l.ui.avatarProvider(read(getEntity, 'lock', id)).toJS();

  swap(updateEntity, 'lock', id, m => {
    m = tset(m, 'syncStatus', 'loading');
    m = tset(m, 'src', src);
    return m;
  });

  let url, displayName;

  provider.url(src, (error, str) => {
    if (error) return handleError(id, src);

    preload.img(str, function(error, img) {
      if (error) return handleError(id, src);
      url = img.src;
      if (displayName !== undefined) handleSuccess(id, src, url, displayName);
    });
  });

  provider.displayName(src, (error, str) => {
    if (error) return handleError(id);
    displayName = str;
    if (url !== undefined) handleSuccess(id, src, url, displayName);
  });
}

export const debouncedRequestAvatar = f.debounce(requestAvatar, 300);

function handleSuccess(id, src, url, displayName) {
  cache[src] = { url, displayName };
  update(id, src, url, displayName);
}

function update(id, src, url, displayName, force = false) {
  swap(updateEntity, 'lock', id, m => {
    if (force || tget(m, 'src') === src) {
      m = tset(m, 'syncStatus', 'ok');
      m = tset(m, 'url', url);
      m = tset(m, 'src', src);
      m = tset(m, 'displayName', displayName);
    }
    return m;
  });
}

function handleError(id, src) {
  swap(updateEntity, 'lock', id, m => {
    return tget(m, 'src') === 'src' ? tset(m, 'syncStatus', 'error') : m;
  });
}
