(function () {

    'use strict';

    angular
            .module('gateway')
            .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', '$rootScope', 'authService', 'angularAuth0', '$location', '$state'];

    function HomeController($scope, $rootScope, authService, angularAuth0, $location, $state) {
        var baseURL = $location.protocol() + "://" + $location.host() + ":" + $location.port();
        $scope.authService = authService;

        $scope.logoutFromAuth0 = function () {
//            angularAuth0.logout({returnTo: baseURL});
            authService.logout();
            $state.go("home");
        };
        $rootScope.logoutFromAuth0 = $scope.logoutFromAuth0; // so that it could be accessed outside home controller

        authService.getProfileDeferred().then(function (profile) {
            $scope.profile = profile;
            $rootScope.profile = profile; // so that it could be accessed outside home controller
        });

    }

}());
