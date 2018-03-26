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
import { Map } from 'immutable';
import * as g from '../../src/gravatar/index';

const emptyGravatar = new Map({});
const displayName = 'someone';
const imageUrl = 'https://secure.gravatar.com/avatar/b91fa14e9ce922cc2fdedb2f84dba3a5?d=404';

describe('an empty gravatar', function() {
  it("doesn't have a display name", function() {
    expect(g.displayName(emptyGravatar)).to.be(undefined);
  });

  it("doesn't have an imageUrl", function() {
    expect(g.imageUrl(emptyGravatar)).to.be(undefined);
  });

  it("isn't loaded", function() {
    expect(g.loaded(emptyGravatar)).to.be(false);
  });
});

describe('updating a gravatar', function() {
  describe('setting a display name', function() {
    let gravatarWithDisplayName;

    beforeEach(function() {
      gravatarWithDisplayName = g.setDisplayName(emptyGravatar, displayName);
    });

    it('updates its value', function() {
      expect(g.displayName(gravatarWithDisplayName)).to.be(displayName);
    });

    it("doesn't mark it as loaded", function() {
      expect(g.loaded(gravatarWithDisplayName)).to.be(false);
    });
  });

  describe('setting an image url', function() {
    let gravatarWithImageUrl;

    beforeEach(function() {
      gravatarWithImageUrl = g.setImageUrl(emptyGravatar, imageUrl);
    });

    it('updates its value', function() {
      expect(g.imageUrl(gravatarWithImageUrl)).to.be(imageUrl);
    });

    it("doesn't mark it as loaded", function() {
      expect(g.loaded(gravatarWithImageUrl)).to.be(false);
    });
  });

  describe('setting a display name and a image url', function() {
    let loadedGravatar;

    beforeEach(function() {
      loadedGravatar = g.setDisplayName(emptyGravatar, displayName);
      loadedGravatar = g.setImageUrl(loadedGravatar, imageUrl);
    });

    it('marks it as loaded', function() {
      expect(g.loaded(loadedGravatar)).to.be(true);
    });
  });
});

describe('normalizing an email', function() {
  it('lowercases upercased letters', function() {
    const email = 'SomeOne@Auth0.com';
    expect(g.normalizeGravatarEmail(email)).to.be(email.toLowerCase());
  });
});
