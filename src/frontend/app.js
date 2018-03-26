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


/* global AUTH0_CLIENT_ID, AUTH0_DOMAIN */

(function () {

    'use strict';

    angular
            .module('gateway', ['auth0.auth0', 'auth0.lock', 'angular-jwt', 'ui.router'])
            .config(config);

    config.$inject = ['$stateProvider', 'lockProvider', '$urlRouterProvider', 'jwtOptionsProvider', 'angularAuth0Provider'];

    function config($stateProvider, lockProvider, $urlRouterProvider, jwtOptionsProvider, angularAuth0Provider) {

        $stateProvider
                .state('site', {
                    'abstract': true
                })
                .state('home', {
                    url: '/home',
                    parent: 'site',
                    views: {
                        'content@': {
                            templateUrl: 'components/views/home/home.html',
                            controller: 'HomeController'
                        },
                        'navigation@': {
                            templateUrl: 'components/views/navigation/navigation.html',
                            controller: 'NavigationController'
                        }
                    }

                })
                .state('services', {
                    url: '/services',
                    parent: 'site',
                    views: {
                        'content@': {
                            templateUrl: 'components/views/services/services.html',
                            controller: 'ServicesController'
                        },
                        'navigation@': {
                            templateUrl: 'components/views/navigation/navigation.html',
                            controller: 'NavigationController'
                        }
                    },
                    data: {
                        requiresLogin: true
                    }
                });

        lockProvider.init({
            clientID: AUTH0_CLIENT_ID,
            domain: AUTH0_DOMAIN,
            options: {
                allowSignUp: true,
                autoclose: true,
                socialButtonStyle: 'small',
                theme: {
                    primaryColor: "#337ab7"
                },
                languageDictionary: {
                    title: "Governify Gateway"
                },
                additionalSignUpFields: [{
                        name: "university",
                        placeholder: "Enter your University (if applicable)"
                    }]
            }
        });

        angularAuth0Provider.init({
            clientID: AUTH0_CLIENT_ID,
            domain: AUTH0_DOMAIN
        });

        $urlRouterProvider.otherwise('/home');


        // Configuration for angular-jwt
        jwtOptionsProvider.config({
            tokenGetter: ['options', function (options) {
                    if (options && options.url.substr(options.url.length - 5) === '.html') {
                        return null;
                    }
                    return localStorage.getItem('id_token');
                }],
            whiteListedDomains: ['localhost'],
            unauthenticatedRedirectPath: '/login'
        });

    }

})();
