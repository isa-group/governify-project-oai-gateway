(function () {

  'use strict';

  angular
    .module('gateway')
    .run(run);

  run.$inject = ['$rootScope', 'authService', 'lock','$timeout'];

  function run($rootScope, authService, lock, $timeout) {
    // Put the authService on $rootScope so its methods
    // can be accessed from the nav bar
    $rootScope.authService = authService;

    // Register the authentication listener that is
    // set up in auth.service.js
    authService.registerAuthenticationListener();

    // Use the authManager from angular-jwt to check for
    // the user's authentication state when the page is
    // refreshed and maintain authentication
    // added SSO
    $timeout(authService.checkAuthOnRefresh);

    // Register synchronous hash parser
    lock.interceptHash();
  }

})();
