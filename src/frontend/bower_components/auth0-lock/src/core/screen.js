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

import * as l from './index';
import * as i18n from '../i18n';
import { getInitialScreen, hasScreen } from '../connection/database/index';

export default class Screen {
  constructor(name) {
    this.name = name;
  }

  backHandler() {
    return null;
  }

  escHandler() {
    return null;
  }

  submitButtonLabel(m) {
    return i18n.str(m, ['submitLabel']);
  }

  isFirstScreen(m) {
    const firstScreenName = getInitialScreen(m);
    const currentScreenNameParts = this.name.split('.');
    const currentScreenName = currentScreenNameParts[1] || currentScreenNameParts[0];

    // if signup and login is enabled, both are the first screen in this scenario and
    // neither of them should show the title
    if (currentScreenName === 'signUp' && hasScreen(m, 'login')) {
      return true;
    }

    const initialScreens = [firstScreenName, 'loading', 'lastLogin'];

    return initialScreens.indexOf(currentScreenName) !== -1;
  }

  getTitle(m) {
    if (this.isFirstScreen(m)) {
      return i18n.str(m, 'title');
    }

    return this.getScreenTitle(m);
  }

  getScreenTitle(m) {
    return i18n.str(m, 'title');
  }

  submitHandler() {
    return null;
  }

  isSubmitDisabled(m) {
    return false;
  }

  renderAuxiliaryPane() {
    return null;
  }

  renderTabs() {
    return false;
  }

  renderTerms() {
    return null;
  }
}
