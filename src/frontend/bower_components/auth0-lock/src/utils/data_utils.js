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

import { Map } from 'immutable';

export function dataFns(baseNSKeyPath) {
  function keyPath(nsKeyPath, keyOrKeyPath) {
    return nsKeyPath.concat(typeof keyOrKeyPath === 'object' ? keyOrKeyPath : [keyOrKeyPath]);
  }

  function getFn(nsKeyPath) {
    return function(m, keyOrKeyPath, notSetValue = undefined) {
      return m.getIn(keyPath(nsKeyPath, keyOrKeyPath), notSetValue);
    };
  }

  function setFn(nsKeyPath) {
    return function(m, keyOrKeyPath, value) {
      return m.setIn(keyPath(nsKeyPath, keyOrKeyPath), value);
    };
  }

  function removeFn(nsKeyPath) {
    return function(m, keyOrKeyPath) {
      return m.removeIn(keyPath(nsKeyPath, keyOrKeyPath));
    };
  }

  const transientNSKeyPath = baseNSKeyPath.concat(['transient']);

  return {
    get: getFn(baseNSKeyPath),
    set: setFn(baseNSKeyPath),
    remove: removeFn(baseNSKeyPath),
    tget: getFn(transientNSKeyPath),
    tset: setFn(transientNSKeyPath),
    tremove: removeFn(transientNSKeyPath),
    reset: function(m) {
      return m.map(x => (Map.isMap(x) ? x.remove('transient') : x));
    },
    init: function(id, m) {
      return new Map({ id: id }).setIn(baseNSKeyPath, m);
    },
    initNS: function(m, ns) {
      return m.setIn(baseNSKeyPath, ns);
    }
  };
}
