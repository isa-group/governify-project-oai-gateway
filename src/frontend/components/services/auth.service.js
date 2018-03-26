/*!
governify-gateway 0.0.1, built on: 2018-03-26
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


(function () {

    'use strict';

    angular
        .module('gateway')
        .service('authService', authService);

    authService.$inject = ['lock', 'authManager', '$q', 'angularAuth0', '$rootScope', 'jwtHelper'];

    function authService(lock, authManager, $q, angularAuth0, $rootScope, jwtHelper) {

        var userProfile = JSON.parse(localStorage.getItem('profile')) || null;
        var deferredProfile = $q.defer();

        if (userProfile) {
            deferredProfile.resolve(userProfile);
        }

        function login() {
            lock.show();
        }

        // Logging out just requires removing the user's
        // id_token and profile
        function logout() {
            deferredProfile = $q.defer();
            localStorage.removeItem('id_token');
            localStorage.removeItem('profile');
            authManager.unauthenticate();
            userProfile = null;
        }

        // Set up the logic for when a user authenticates
        // This method is called from app.run.js
        function registerAuthenticationListener() {
            lock.on('authenticated', function (authResult) {
                localStorage.setItem('id_token', authResult.idToken);
                authManager.authenticate();

                lock.getProfile(authResult.idToken, function (error, profile) {
                    if (error) {
                        return console.log(error);
                    }

                    localStorage.setItem('profile', JSON.stringify(profile));
                    deferredProfile.resolve(profile);
                });

            });
        }

        function getProfileDeferred() {
            return deferredProfile.promise;
        }

        function checkAuthOnRefresh() {
            var token = localStorage.getItem('id_token');
            if (token) {
                if (!jwtHelper.isTokenExpired(token)) {
                    if (!$rootScope.isAuthenticated) {
                        angularAuth0.getSSOData(function (err, data) {
                            if (!err && data.sso) {
                                authManager.authenticate();
                            }
                        });
                    }
                }
            } else {
                angularAuth0.getSSOData(function (err, data) {
                    if (!err && data.sso) {
                        angularAuth0.signin({
                            scope: 'openid name picture',
                            responseType: 'token'
                        });
                    }
                });
            }
        }

        return {
            login: login,
            logout: logout,
            registerAuthenticationListener: registerAuthenticationListener,
            getProfileDeferred: getProfileDeferred,
            checkAuthOnRefresh: checkAuthOnRefresh
        };
    }
})();
