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

import { swap, updateEntity } from '../store/index';
import ErrorScreen from '../core/error_screen';
import LoadingScreen from '../core/loading_screen';
import SocialOrEmailLoginScreen from './passwordless/social_or_email_login_screen';
import SocialOrPhoneNumberLoginScreen from './passwordless/social_or_phone_number_login_screen';
import VcodeScreen from '../connection/passwordless/ask_vcode';
import {
  initPasswordless,
  isEmail,
  isSendLink,
  passwordlessStarted
} from '../connection/passwordless/index';
import { initSocial } from '../connection/social/index';
import { isDone } from '../sync';
import * as l from '../core/index';

class Passwordless {
  didInitialize(m, opts) {
    m = initSocial(m, opts);
    m = initPasswordless(m, opts);

    return m;
  }

  didReceiveClientSettings(m) {
    const anySocialConnection = l.hasSomeConnections(m, 'social');
    const anyPasswordlessConnection = l.hasSomeConnections(m, 'passwordless');

    if (!anySocialConnection && !anyPasswordlessConnection) {
      const error = new Error(
        'At least one email, sms or social connection needs to be available.'
      );
      error.code = 'no_connection';
      m = l.stop(m, error);
    }

    return m;
  }

  render(m) {
    // TODO: remove the detail about the loading pane being pinned,
    // sticky screens should be handled at the box module.
    if (!isDone(m) || m.get('isLoadingPanePinned')) {
      return new LoadingScreen();
    }

    if (l.hasStopped(m)) {
      return new ErrorScreen();
    }

    if (isEmail(m)) {
      return isSendLink(m) || !passwordlessStarted(m)
        ? new SocialOrEmailLoginScreen()
        : new VcodeScreen();
    } else {
      return passwordlessStarted(m) ? new VcodeScreen() : new SocialOrPhoneNumberLoginScreen();
    }

    setTimeout(() => {
      const stopError = new Error('Internal error');
      stopError.code = 'internal_error';
      stopError.description = "Couldn't find a screen to render";
      swap(updateEntity, 'lock', l.id(m), l.stop, stopError);
    }, 0);

    return new ErrorScreen();
  }
}

export default new Passwordless();
