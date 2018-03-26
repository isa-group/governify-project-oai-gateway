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

import React from 'react'; // eslint-disable-line
import renderer from 'react-test-renderer';

export const expectComponent = children => {
  const component = renderer.create(children);
  return expect(component);
};

const addDataToProps = props => {
  const returnedProps = {};
  Object.keys(props).forEach(k => (returnedProps[`data-${k}`] = props[k]));
  return returnedProps;
};

const removeDataFromProps = props => {
  const returnedProps = {};
  Object.keys(props).forEach(k => (returnedProps[k.replace('data-', '')] = props[k]));
  return returnedProps;
};

export const mockComponent = (type, domElement = 'div') => props =>
  React.createElement(domElement, {
    'data-__type': type,
    ...addDataToProps(props)
  });

export const extractPropsFromWrapper = (wrapper, index = 0) =>
  removeDataFromProps(
    wrapper
      .find('div')
      .at(index)
      .props()
  );

//set urls with jest: https://github.com/facebook/jest/issues/890#issuecomment-298594389
export const setURL = url => {
  const parser = document.createElement('a');
  parser.href = url;
  [
    'href',
    'protocol',
    'host',
    'hostname',
    'origin',
    'port',
    'pathname',
    'search',
    'hash'
  ].forEach(prop => {
    Object.defineProperty(window.location, prop, {
      value: parser[prop],
      writable: true
    });
  });
};
