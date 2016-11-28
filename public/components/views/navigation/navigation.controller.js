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
