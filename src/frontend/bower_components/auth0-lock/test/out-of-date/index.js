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
import { spy, stub } from 'sinon';

import Auth0LockPasswordless from '../src/index';
import WebAPI from '../src/core/web_api';

describe('.parseHash', function() {
  beforeEach(function() {
    this.lock = new Auth0LockPasswordless('c', 'd');
    this.client = getLockClient(this.lock);
  });

  it('delegates the call to an Auth0 instance', function() {
    const hash = 'a hash';
    const returnValue = 'fake return value';
    stub(this.client, 'parseHash').returns(returnValue);

    expect(this.lock.parseHash(hash)).to.be(returnValue);

    expect(this.client.parseHash.calledOnce).to.be.ok();
    expect(this.client.parseHash.lastCall.calledWithExactly(hash)).to.be.ok();
  });
});

describe('.getProfile', function() {
  beforeEach(function() {
    this.lock = new Auth0LockPasswordless('c', 'd');
    this.client = getLockClient(this.lock);
  });

  it('delegates the call to an Auth0 instance', function() {
    const token = 'a token';
    const cb = () => {};
    const returnValue = 'fake return value';
    stub(this.client, 'getProfile').returns(returnValue);

    expect(this.lock.getProfile(token, cb)).to.be(returnValue);

    expect(this.client.getProfile.calledOnce).to.be.ok();
    expect(this.client.getProfile.lastCall.calledWithExactly(token, cb)).to.be.ok();
  });
});

function getLockClient(lock) {
  const client = WebAPI.clients[lock.id];
  if (!client) {
    throw new Error("Couldn't find Auth0 client for Lock");
  }

  return client;
}
