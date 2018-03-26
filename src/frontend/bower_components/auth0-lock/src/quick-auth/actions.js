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

import { skipQuickAuth as skip } from '../quick_auth';
import { getEntity, read, swap, updateEntity } from '../store/index';
import { logIn as coreLogIn } from '../core/actions';
import * as l from '../core/index';

export function skipQuickAuth(id) {
  swap(updateEntity, 'lock', id, skip, true);
}

export function logIn(id, connection, loginHint) {
  const m = read(getEntity, 'lock', id);
  const connectionScopes = l.auth.connectionScopes(m);
  const scopes = connectionScopes.get(connection.get('name'));
  const params = {
    connection: connection.get('name'),
    connection_scope: scopes ? scopes.toJS() : undefined
  };

  if (!l.auth.redirect(m) && connection.get('strategy') === 'facebook') {
    params.display = 'popup';
  }
  if (loginHint) {
    params.login_hint = loginHint;
  }
  coreLogIn(id, [], params);
}
