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
import { swap, updateEntity } from '../store/index';
import { cancelSelection, setField, setOptionField, startSelection } from './index';

export function changeField(id, name, value, validationFn, ...validationExtraArgs) {
  swap(updateEntity, 'lock', id, setField, name, value, validationFn, ...validationExtraArgs);
}

export function startOptionSelection(id, name, iconUrl, icon) {
  // TODO: should be transient
  swap(updateEntity, 'lock', id, m =>
    m
      .setIn(['field', 'selecting', 'name'], name)
      .setIn(['field', 'selecting', 'iconUrl'], iconUrl)
      .setIn(['field', 'selecting', 'icon'], icon)
  );
}

export function selectOption(id, name, option) {
  swap(updateEntity, 'lock', id, m =>
    setOptionField(m.deleteIn(['field', 'selecting']), name, option)
  );
}

export function cancelOptionSelection(id) {
  swap(updateEntity, 'lock', id, m => m.deleteIn(['field', 'selecting']));
}
