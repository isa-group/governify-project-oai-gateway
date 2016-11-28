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
                allowSignUp: false,
                theme: {
                    primaryColor: "#337ab7"
                },
                languageDictionary: {
                    title: "Governify Gateway"
                }

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
