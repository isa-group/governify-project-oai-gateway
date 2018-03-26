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

import Immutable from 'immutable';
import { fetchClientSettings, syncClientSettingsSuccess } from './client/settings';
import { fetchTenantSettings, syncTenantSettingsSuccess } from './tenant/settings';
import { fetchSSOData } from './sso/data';
import * as l from './index';
import { isADEnabled } from '../connection/enterprise'; // shouldn't depend on this
import sync, { isSuccess } from '../sync';

export function syncRemoteData(m) {
  if (l.useTenantInfo(m)) {
    m = sync(m, 'client', {
      syncFn: (m, cb) => fetchTenantSettings(l.tenantBaseUrl(m), cb),
      successFn: (m, result) => syncTenantSettingsSuccess(m, l.clientID(m), result)
    });
  } else {
    m = sync(m, 'client', {
      syncFn: (m, cb) => fetchClientSettings(l.clientID(m), l.clientBaseUrl(m), cb),
      successFn: syncClientSettingsSuccess
    });
  }

  m = sync(m, 'sso', {
    conditionFn: m => l.auth.sso(m) && !l.oidcConformant(m),
    waitFn: m => isSuccess(m, 'client'),
    syncFn: (m, cb) => fetchSSOData(l.id(m), isADEnabled(m), cb),
    successFn: (m, result) => m.mergeIn(['sso'], Immutable.fromJS(result)),
    errorFn: (m, error) => {
      // location.origin is not supported in all browsers
      let origin = location.protocol + '//' + location.hostname;
      if (location.port) {
        origin += ':' + location.port;
      }

      const appSettingsUrl = `https://manage.auth0.com/#/applications/${l.clientID(m)}/settings`;

      l.warn(
        m,
        `There was an error fetching the SSO data. This could simply mean that there was a problem with the network. But, if a "Origin" error has been logged before this warning, please add "${origin}" to the "Allowed Origins (CORS)" list in the Auth0 dashboard: ${appSettingsUrl}`
      );
    }
  });

  return m;
}
