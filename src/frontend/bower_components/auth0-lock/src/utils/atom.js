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

class Atom {
  constructor(state) {
    this.state = state;
    this.watches = {};
  }

  reset(state) {
    return this._change(state);
  }

  swap(f, ...args) {
    return this._change(f(this.state, ...args));
  }

  deref() {
    return this.state;
  }

  addWatch(k, f) {
    // if (this.watches[key]) {
    //   console.warn(`adding a watch with an already registered key: ${k}`);
    // }
    this.watches[k] = f;
    return this;
  }

  removeWatch(k) {
    // if (!this.watches[key]) {
    //   console.warn(`removing a watch with an unknown key: ${k}`);
    // }
    delete this.watches[k];
    return this;
  }

  _change(newState) {
    const { state, watches } = this;
    this.state = newState;
    Object.keys(watches).forEach(k => watches[k](k, state, newState));
    return this.state;
  }
}

export default function atom(state) {
  return new Atom(state);
}
