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

const getInitTenant = () => require('core/tenant/index').initTenant;

const CLIENT_ID = 'client_id';

const runTest = (initTenant, mockDataFns, client) => {
  initTenant({}, CLIENT_ID, client);
  expect(mockDataFns.initNS.mock.calls.length).toBe(1);
  const tenantInfo = mockDataFns.initNS.mock.calls[0][1].toJS();
  expect(tenantInfo).toMatchSnapshot();
};

describe('initTenant()', () => {
  let initTenant;
  let mockDataFns;
  beforeEach(() => {
    jest.resetModules();

    mockDataFns = {
      initNS: jest.fn(),
      get: jest.fn()
    };
    jest.mock('utils/data_utils', () => ({
      dataFns: () => mockDataFns
    }));

    jest.mock('core/index', () => ({
      findConnection: jest.fn()
    }));
    initTenant = getInitTenant();
  });
  describe('with database connection', () => {
    it('maps connection correctly with defaults', () => {
      const client = {
        connections: {
          database: [
            {
              name: 'test-connection-database',
              strategy: 'auth0'
            }
          ]
        }
      };
      runTest(initTenant, mockDataFns, client);
    });
    it('maps connection correctly with all the properties', () => {
      const client = {
        connections: {
          database: [
            {
              allowForgot: false,
              allowSignup: false,
              name: 'test-connection-database',
              requiresUsername: true,
              strategy: 'auth0',
              validation: {
                passwordPolicy: 'test-passwordPolicy',
                username: {
                  min: 4,
                  max: 5
                }
              }
            }
          ]
        }
      };
      runTest(initTenant, mockDataFns, client);
    });
    it('fixes validation when values are not numbers', () => {
      const client = {
        connections: {
          database: [
            {
              allowForgot: false,
              allowSignup: false,
              name: 'test-connection-database',
              requiresUsername: true,
              strategy: 'auth0',
              validation: {
                passwordPolicy: 'test-passwordPolicy',
                username: {
                  min: 'foo',
                  max: 'bar'
                }
              }
            }
          ]
        }
      };
      runTest(initTenant, mockDataFns, client);
    });
    it('fixes validation when username.min > username.max', () => {
      const client = {
        connections: {
          database: [
            {
              allowForgot: false,
              allowSignup: false,
              name: 'test-connection-database',
              requiresUsername: true,
              strategy: 'auth0',
              validation: {
                passwordPolicy: 'test-passwordPolicy',
                username: {
                  min: 5,
                  max: 4
                }
              }
            }
          ]
        }
      };
      runTest(initTenant, mockDataFns, client);
    });
  });
  describe('with enterprise connection', () => {
    it('maps connection correctly', () => {
      const client = {
        connections: {
          enterprise: [
            {
              name: 'test-connection-enterprise',
              domains: 'domains',
              strategy: 'auth0'
            }
          ]
        }
      };
      runTest(initTenant, mockDataFns, client);
    });
  });
  describe('with other connection types', () => {
    it('maps connection correctly', () => {
      const client = {
        connections: {
          social: [
            {
              name: 'test-connection-other_type',
              strategy: 'auth0'
            }
          ],
          unknown: [
            {
              name: '??',
              strategy: '??'
            }
          ]
        }
      };
      runTest(initTenant, mockDataFns, client);
    });
  });
  describe('with passwordless connection', () => {
    it('maps connection correctly', () => {
      const client = {
        connections: {
          passwordless: [
            {
              name: 'sms',
              strategy: 'sms'
            }
          ]
        }
      };
      runTest(initTenant, mockDataFns, client);
    });
  });
  test('filters clientConnections', () => {
    const client = {
      connections: {
        database: [
          {
            name: 'test-connection-database',
            strategy: 'auth0'
          },
          {
            name: 'test-not-this-one',
            strategy: 'auth0'
          }
        ]
      },
      clientsConnections: {
        [CLIENT_ID]: ['test-connection-database']
      }
    };
    runTest(initTenant, mockDataFns, client);
  });
});
