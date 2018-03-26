/*!
governify-gateway 0.0.1, built on: 2017-03-30
Copyright (C) 2017 ISA group
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
            .controller('NavigationController', NavigationController);

    NavigationController.$inject = ['$scope', '$rootScope', 'authService', '$state'];

    function NavigationController($scope, $rootScope, authService, $state) {
        $scope.authService = authService;

        $scope.logoutFromAuth0 = function () {
            authService.logout();
            $state.go("home");
        };
        $rootScope.logoutFromAuth0 = $scope.logoutFromAuth0; // so that it could be accessed outside home controller

        authService.getProfileDeferred().then(function (profile) {
            $scope.profile = profile;
            $rootScope.profile = profile; // so that it could be accessed outside home controller
            var isAdmin = profile.roles.find(function (role) {
                if (role === "admin") {
                    return true;
                }
            });
            if (isAdmin) {
                $scope.isAdmin = true;
                $rootScope.isAdmin = true; // so that it could be accessed outside home controller
            }
        });
    }

}());
