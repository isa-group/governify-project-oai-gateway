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

import atom from '../utils/atom';
import { Map } from 'immutable';

const store = atom(new Map({}));

export function observe(key, id, f) {
  subscribe(`${key}-${id}`, (_, oldState, newState) => {
    const m = getEntity(newState, 'lock', id);
    const oldM = getEntity(oldState, 'lock', id);
    if (m != oldM) f(m);
  });
}

export function subscribe(key, f) {
  store.addWatch(key, f);
}

export function unsubscribe(key) {
  store.removeWatch(key);
}

export function swap(...args) {
  return store.swap(...args);
}

export function updateEntity(state, coll, id, f, ...args) {
  return state.updateIn([coll, id], new Map({}), x => f(x, ...args));
}

export function setEntity(state, coll, id, m) {
  return state.setIn([coll, id], m);
}

export function read(f, ...args) {
  return f(store.deref(), ...args);
}

export function getEntity(state, coll, id = 0) {
  return state.getIn([coll, id]);
}

export function removeEntity(state, coll, id = 0) {
  return state.removeIn([coll, id]);
}

export function getCollection(state, coll) {
  return state.get(coll, Map()).toList();
}

// TODO: try to remove this fn
export function updateCollection(state, coll, f, ...args) {
  return state.update(coll, xs => f(xs, ...args));
}

export function getState() {
  return store.deref();
}

// DEV
// store.addWatch("keepHistory", (key, oldState, newState) => {
//   if (!global.window.h) global.window.h = []; global.window.h.push(newState);
//   console.debug("something changed", newState.toJS());
// });
