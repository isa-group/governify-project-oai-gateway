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

export default class Cache {
  constructor(fetchFn) {
    this.cache = {};
    this.cbs = {};
    this.fetchFn = fetchFn;
  }

  get(...args) {
    const cb = args.pop();
    const key = JSON.stringify(args);
    if (this.cache[key]) return cb(null, this.cache[key]);
    if (this.registerCallback(key, cb) > 1) return;
    this.fetch(key, args);
  }

  fetch(key, args) {
    this.fetchFn(...args, (error, result) => {
      if (!error) this.cache[key] = result;
      this.execCallbacks(key, error, result);
    });
  }

  registerCallback(key, cb) {
    this.cbs[key] = this.cbs[key] || [];
    this.cbs[key].push(cb);
    return this.cbs[key].length;
  }

  execCallbacks(key, ...args) {
    this.cbs[key].forEach(f => f(...args));
    delete this.cbs[key];
  }
}
