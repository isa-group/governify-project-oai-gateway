/* global AUTH0_CLIENT_ID, AUTH0_DOMAIN */

(function () {

    'use strict';

    angular
        .module('gateway')
        .controller('ServicesController', HomeController);

    HomeController.$inject = ['$scope', '$http'];

    function HomeController($scope, $http) {

        var refresh = function () {
            $http({
                method: 'GET',
                url: '/gateway/api/v1/services',
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('id_token')
                }
            }).then(function (response) {
                console.log('Data received successfully', response.data);
                $scope.servicelist = response.data;

            }, function (err) {
                console.log("Error, token=" + localStorage.getItem('id_token'));
                var notify = $.notify('There was an error while adding the new service (' + err.status + ')', {
                    type: 'warning',
                    allow_dismiss: true,
                    delay: 200,
                    timer: 3000
                });

            });
        };

        $scope.addService = function () {
            console.log("Inserting service ...");
            if (!$scope.service.name || !$scope.service.url || !$scope.service.swagger_url) {
                var notify = $.notify('All fields are required', {
                    type: 'warning',
                    allow_dismiss: true,
                    delay: 200,
                    timer: 3000
                });
            } else {
                $http({
                    method: 'POST',
                    url: '/gateway/api/v1/services',
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('id_token')
                    },
                    data: $scope.service
                }).then(function () {
                    var notify = $.notify('<strong>Adding</strong> a new service', {
                        type: 'success',
                        allow_dismiss: false,
                        showProgressbar: true,
                        delay: 200,
                        timer: 2000
                    });

                    refresh();
                }, function (err) {
                    var notify = $.notify('There was an error while adding the new service (' + err.status + ') ' + err.data, {
                        type: 'warning',
                        allow_dismiss: true,
                        delay: 200,
                        timer: 3000
                    });

                });
            }
        };

        $scope.editService = function (service) {
            var serv = service;
            var id = service.name;
            $http({
                method: 'DELETE',
                url: '/gateway/api/v1/services/' + id,
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('id_token')
                }
            }).then(function () {
                var notify = $.notify('Click add service to save changes', {
                    type: 'info',
                    allow_dismiss: true,
                    showProgressbar: false,
                    delay: 200,
                    timer: 3000
                });
                var i = $scope.servicelist.indexOf(service);
                $scope.servicelist.splice(i, 1);
                $scope.service = serv;
            }, function (err) {
                var notify = $.notify('There was an error editing the new service (' + err.status + ')', {
                    type: 'warning',
                    allow_dismiss: true,
                    delay: 200,
                    timer: 3000
                });
            });
        };

        $scope.deleteService = function (service) {
            var id = service.name;
            console.log("Deleting service with " + id);
            $http({
                method: 'DELETE',
                url: '/gateway/api/v1/services/' + id,
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('id_token')
                }
            }).then(function () {
                var notify = $.notify('<strong>Deleting</strong> this service', {
                    type: 'success',
                    allow_dismiss: false,
                    showProgressbar: true,
                    delay: 200,
                    timer: 3000
                });
                refresh();
            }, function (err) {
                var notify = $.notify('There was an error deleting the new service (' + err.status + ')', {
                    type: 'warning',
                    allow_dismiss: true,
                    delay: 200,
                    timer: 3000
                });
            });
        };


        console.log("Controller initialized");
        refresh();
    }

}());