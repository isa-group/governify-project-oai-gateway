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

'use strict';
angular.module('showcase', [
    'showcase.angularWay',
    'showcase.angularWay.withOptions',
    'showcase.withAjax',
    'showcase.withOptions',
    'showcase.withPromise',

    'showcase.angularWay.dataChange',
    'showcase.bindAngularDirective',
    'showcase.changeOptions',
    'showcase.dataReload.withAjax',
    'showcase.dataReload.withPromise',
    'showcase.disableDeepWatchers',
    'showcase.loadOptionsWithPromise',
    'showcase.angularDirectiveInDOM',
    'showcase.rerender',
    'showcase.rowClickEvent',
    'showcase.rowSelect',
    'showcase.serverSideProcessing',

    'showcase.bootstrapIntegration',
    'showcase.overrideBootstrapOptions',
    'showcase.withAngularTranslate',
    'showcase.withColReorder',
    'showcase.withColumnFilter',
    'showcase.withLightColumnFilter',
    'showcase.withColVis',
    'showcase.withResponsive',
    'showcase.withScroller',
    'showcase.withTableTools',
    'showcase.withFixedColumns',
    'showcase.withFixedHeader',
    'showcase.withButtons',
    'showcase.withSelect',
    'showcase.dtInstances',

    'showcase.usages',
    'ui.bootstrap',
    'ui.router',
    'hljs'
])
.config(sampleConfig)
.config(routerConfig)
.config(translateConfig)
.config(debugDisabled)
.run(initDT);

backToTop.init({
    theme: 'classic', // Available themes: 'classic', 'sky', 'slate'
    animation: 'fade' // Available animations: 'fade', 'slide'
});

function debugDisabled($compileProvider)  {
    $compileProvider.debugInfoEnabled(false);
}

function sampleConfig(hljsServiceProvider) {
    hljsServiceProvider.setOptions({
        // replace tab with 4 spaces
        tabReplace: '    '
    });
}

function routerConfig($stateProvider, $urlRouterProvider, USAGES) {
    $urlRouterProvider.otherwise('/welcome');
    $stateProvider
        .state('welcome', {
            url: '/welcome',
            templateUrl: 'demo/partials/welcome.html',
            controller: function($rootScope) {
                $rootScope.$broadcast('event:changeView', 'welcome');
            }
        })
        .state('gettingStarted', {
            url: '/gettingStarted',
            templateUrl: 'demo/partials/gettingStarted.html',
            controller: function($rootScope) {
                $rootScope.$broadcast('event:changeView', 'gettingStarted');
            }
        })
        .state('api', {
            url: '/api',
            templateUrl: 'demo/api/api.html',
            controller: function($rootScope) {
                $rootScope.$broadcast('event:changeView', 'api');
            }
        });

        angular.forEach(USAGES, function(usages, key) {
            angular.forEach(usages, function(usage) {
                $stateProvider.state(usage.name, {
                    url: '/' + usage.name,
                    templateUrl: 'demo/' + key + '/' + usage.name + '.html',
                    controller: function($rootScope) {
                        $rootScope.$broadcast('event:changeView', usage.name);
                    },
                    onExit: usage.onExit
                });
            });
        });
}

function translateConfig($translateProvider) {
    $translateProvider.translations('en', {
        id: 'ID with angular-translate',
        firstName: 'First name with angular-translate',
        lastName: 'Last name with angular-translate'
    });
    $translateProvider.translations('fr', {
        id: 'ID avec angular-translate',
        firstName: 'Prénom avec angular-translate',
        lastName: 'Nom avec angular-translate'
    });
    $translateProvider.preferredLanguage('en');
}

function initDT(DTDefaultOptions) {
    DTDefaultOptions.setLoadingTemplate('<img src="images/loading.gif" />');
}
