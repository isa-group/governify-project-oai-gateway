(function () {

    'use strict';

    angular
            .module('gateway')
            .controller('NavigationController', NavigationController);

    NavigationController.$inject = ['$scope', '$sce'];

    function NavigationController($scope, $sce) {
        $scope.trustAsHtml = $sce.trustAsHtml;
    }

}());
